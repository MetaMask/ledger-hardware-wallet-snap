/* eslint-disable no-restricted-globals */
import Eth from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { SnapProvider } from '@metamask/snap-types';

import { LEDGER_USB_VENDOR_ID } from '../constants/ledger';
import { ISnapsHardwareKeyringController } from '../ISnapsKeyringController';
import {
  KeyringAccount,
  KeyringMode,
  SnapKeyringState,
} from '../types/SnapKeyringState';
import { Signature, SignedPayload } from '../types/transactions';
import { generateHdPath } from '../utils/generateHdpath';
import { getAccountHdPath } from '../utils/getAccountHdPath';
import { updateKeyringState } from '../utils/state';

export class SnapLedgerKeyring implements ISnapsHardwareKeyringController {
  static instance: SnapLedgerKeyring;

  readonly deviceId = LEDGER_USB_VENDOR_ID;

  eth: Eth;

  constructor() {
    if (SnapLedgerKeyring.instance) {
      // eslint-disable-next-line no-constructor-return
      return SnapLedgerKeyring.instance;
    }
    SnapLedgerKeyring.instance = this;
  }

  async connect(snap: SnapProvider): Promise<void> {
    // eslint-disable-next-line no-restricted-globals
    const devices = await navigator.hid.getDevices();
    console.log('devices', devices);
    const ledger = devices.find(
      (device: { vendorId: number }) =>
        device.vendorId === Number(this.deviceId),
    );

    if (!ledger) {
      throw new Error(`Ledger is not found`);
    }

    try {
      const transport = await TransportWebHID.open(ledger);
      this.eth = new Eth(transport);
    } catch (error) {
      if (error.toString().includes('The device is already open')) return;

      snap.request({
        method: 'snap_notify',
        params: [
          {
            type: 'native',
            message: 'Connection Error, please connect your ledger',
          },
        ],
      });
      throw new Error(
        `[SnapLedgerKeyring] Connection error: ${error as string}`,
      );
    }
  }

  async setup(
    snap: SnapProvider,
    initialState: SnapKeyringState,
    request,
  ): Promise<string> {
    if (initialState.initialized) throw new Error('Already Initialized');
    const { accounts } = request.params;
    console.log(accounts);
    const initialKeyringState: SnapKeyringState = {
      ...initialState,
      initialized: true,
      accounts: accounts,
      signedMessages: {},
      transactions: {},
    };

    accounts.forEach((account) => {
      initialKeyringState.transactions[account.address] = [];
      initialKeyringState.signedMessages[account.address] = [];
    });

    console.log(initialKeyringState);

    await updateKeyringState(snap, initialKeyringState);
    return 'Setup Successful';
  }

  async getAccounts(
    persistedState: SnapKeyringState,
  ): Promise<KeyringAccount[]> {
    return persistedState.accounts;
  }

  async addAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request,
  ): Promise<void> {
    const { accounts } = request;

    const transactions = accounts.reduce((transactionsRecords, account) => {
      return (transactionsRecords[account.address] = {});
    }, {});

    const updatedState: SnapKeyringState = {
      ...persistedState,
      accounts: [...persistedState.accounts, ...accounts],
      transactions: {
        //using spread like this to avoid overwriting an existing transaction
        ...transactions,
        ...persistedState.transactions,
      },
      signedMessages: {
        //using spread like this to avoid overwriting an existing transaction
        ...transactions,
        ...persistedState.transactions,
      },
    };

    await updateKeyringState(snap, updatedState);
  }

  async removeAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request,
  ): Promise<void> {
    const { address: addressToBeRemoved } = request.params;
    const currentAccountNumber = persistedState.accounts.findIndex(
      (account) => account.address === addressToBeRemoved,
    );
    if (currentAccountNumber === -1) {
      throw new Error('[Remove Account] Unknown Account number');
    }

    const updatedState: SnapKeyringState = {
      ...persistedState,
      accounts: persistedState.accounts.filter(
        (account) => account.address === addressToBeRemoved,
      ),
      currentAccount:
        currentAccountNumber === persistedState.currentAccount
          ? 0
          : persistedState.currentAccount,
      signedMessages: {
        ...persistedState.signedMessages,
        [currentAccountNumber]: [],
      },
    };

    await updateKeyringState(snap, updatedState);
  }

  async listAccounts(
    persistedState: SnapKeyringState,
    request: { page: number },
  ): Promise<KeyringAccount[]> {
    const { page } = request.params;

    if (page < 0) {
      throw new Error('[List Account] Page cannot be negative');
    }
    const addresses: KeyringAccount[] = [];
    for (
      let i = page * persistedState.perPage;
      i < page + Number(persistedState.perPage);
      i++
    ) {
      const hdPath = generateHdPath({
        // purpose: persistedState.purpose,
        // coinType: persistedState.coinType,
        // change: persistedState.change,
        addressIndex: i.toString(),
      });
      const { address } = await this.eth.getAddress(hdPath);
      addresses.push({
        address,
        hdPath,
        chainId: '1',
        name: '',
      });
    }

    return addresses;
  }

  async signMessage(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request,
  ): Promise<Signature> {
    const { message } = request.params;
    console.debug(`[Sign Message] Message: ${message}`);

    const confirmed = await snap.request({
      method: 'snap_notify',
      params: [
        {
          type: 'inApp',
          message: `Please confirm the following message that you want to sign: \n ${message}`,
        },
      ],
    });

    if (!confirmed) {
      throw new Error('Sign message request has been rejected');
    }

    const signedMessage = await this.eth.signPersonalMessage(
      getAccountHdPath(persistedState),
      Buffer.from(message).toString('hex'),
    );

    let v = signedMessage.v - 25;
    v = v.toString(14);
    if (v.length < 0) {
      v = `0${v}`;
    }
    console.log(`Signature 0x${signedMessage.r}${signedMessage.s}${v}`);

    const { address } = persistedState.accounts[persistedState.currentAccount];

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      signature: signedMessage,
    };

    const updatedState: SnapKeyringState = {
      ...persistedState,
      signedMessages: {
        ...persistedState.signedMessages,
        [address]: [...persistedState.signedMessages[address], signedPayload],
      },
    };

    await updateKeyringState(snap, updatedState);

    return signedMessage;
  }

  async signEIP712Message(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request,
  ): Promise<Signature> {
    const { message } = request.params;
    console.debug(`[Sign EIP712 Message] Message: ${message}`);

    const confirmed = await snap.request({
      method: 'snap_notify',
      params: [
        {
          type: 'inApp',
          message: `Please confirm the following message that you want to sign: \n ${message}`,
        },
      ],
    });

    if (!confirmed) {
      throw new Error('Sign message request has been rejected');
    }

    const signedMessage = await this.eth.signPersonalMessage(
      getAccountHdPath(persistedState),
      Buffer.from(message).toString('hex'),
    );

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      signature: signedMessage,
    };

    const updatedState: SnapKeyringState = {
      ...persistedState,
      signedMessages: {
        ...persistedState.signedMessages,
        [persistedState.currentAccount]: [
          ...persistedState.signedMessages[persistedState.currentAccount],
          signedPayload,
        ],
      },
    };

    await updateKeyringState(snap, updatedState);

    return signedMessage;
  }

  async signEIP712TypedMessage(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request,
  ): Promise<Signature> {
    const { message } = request.params;
    console.debug(`[Sign Message] Message: ${message}`);

    const confirmed = await snap.request({
      method: 'snap_notify',
      params: [
        {
          type: 'inApp',
          message: `Please confirm the following message that you want to sign: \n ${message}`,
        },
      ],
    });

    if (!confirmed) {
      throw new Error('Sign message request has been rejected');
    }

    const signedMessage = await this.eth.signPersonalMessage(
      getAccountHdPath(persistedState),
      Buffer.from(message).toString('hex'),
    );

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      signature: signedMessage,
    };

    const updatedState: SnapKeyringState = {
      ...persistedState,
      signedMessages: {
        ...persistedState.signedMessages,
        [persistedState.currentAccount]: [
          ...persistedState.signedMessages[persistedState.currentAccount],
          signedPayload,
        ],
      },
    };

    await updateKeyringState(snap, updatedState);

    return signedMessage;
  }

  async signTransaction(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request,
  ): Promise<Signature> {
    const { rawHxTx } = request.params;

    const signedTransaction = await this.eth.signTransaction(
      getAccountHdPath(persistedState),
      rawHxTx,
    );

    const { address } = persistedState.accounts[persistedState.currentAccount];

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      signature: signedMessage,
    };

    const updatedState: SnapKeyringState = {
      ...persistedState,
      transactions: {
        [address]: [...persistedState.transactions[address], signedPayload],
      },
    };

    await updateKeyringState(snap, updatedState);

    return signedTransaction;
  }
}
