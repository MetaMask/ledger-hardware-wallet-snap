/* eslint-disable no-restricted-globals */
import Eth from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { SnapProvider } from '@metamask/snap-types';
import { serializeTransaction } from 'ethers/lib/utils';

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
      if (error.toString().includes('The device is already open')) {
        return;
      }

      await snap.request({
        method: 'snap_notify',
        params: {
          type: 'native',
          message: 'Connection Error, please connect your ledger',
        },
      });
      throw new Error(
        `[SnapLedgerKeyring] Connection error: ${error as string}`,
      );
    }
  }

  async setup(
    snap: SnapProvider,
    initialState: SnapKeyringState,
    request: { params: { accounts: KeyringAccount[] } },
  ): Promise<string> {
    if (initialState.initialized) {
      throw new Error('Already Initialized');
    }
    const { accounts } = request.params;
    console.log(accounts);
    const initialKeyringState: SnapKeyringState = {
      ...initialState,
      keyringMode: KeyringMode.HD,
      initialized: true,
      accounts,
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

  setAccount(
    persistedState: SnapKeyringState,
    request: { params: { address: string } },
  ): number {
    const { address } = request.params;

    const accountIndex = persistedState.accounts.findIndex(
      (account) => account.address === address,
    );

    console.log(`[Set Account] account index = ${accountIndex}`);

    if (accountIndex === -1) {
      throw new Error(`[Set Account] Unknown account ${address}`);
    }

    return accountIndex;
  }

  async getAccounts(
    persistedState: SnapKeyringState,
  ): Promise<KeyringAccount[]> {
    return persistedState.accounts;
  }

  async addAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { accounts: KeyringAccount[] } },
  ): Promise<void> {
    console.log(request.params);
    const { accounts } = request.params;

    // check for duplicated
    const accountsToAdd = accounts.filter(
      (account) =>
        persistedState.accounts.findIndex(
          (persistedAccount) => persistedAccount.address === account.address,
        ) === -1,
    );

    console.log(`[Add account] new accounts`, accountsToAdd);
    if (accountsToAdd.length === 0) {
      return;
    }

    const transactions = accountsToAdd.reduce(
      (transactionsRecords, account) => {
        return (transactionsRecords[account.address] = {});
      },
      {},
    );

    const messages = accountsToAdd.reduce((transactionsRecords, account) => {
      return (transactionsRecords[account.address] = {});
    }, {});

    const updatedState: SnapKeyringState = {
      ...persistedState,
      accounts: [...persistedState.accounts, ...accountsToAdd],
      transactions: {
        // using spread like this to avoid overwriting an existing transaction
        ...transactions,
        ...persistedState.transactions,
      },
      signedMessages: {
        // using spread like this to avoid overwriting an existing transaction
        ...messages,
        ...persistedState.signedMessages,
      },
    };

    console.debug(updatedState);

    await updateKeyringState(snap, updatedState);
  }

  async removeAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { address: string } },
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
    request: { params: { page: number } },
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
      console.log(await this.eth.getAddress(hdPath));
      const { address } = await this.eth.getAddress(hdPath);
      console.log(`HDPath ${hdPath} address ${address}`);
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
    request: { params: { message: any } },
  ): Promise<SignedPayload> {
    const { message } = request.params;
    console.debug(`[Sign Message] Message:`, message);

    const signedMessage = await this.eth.signPersonalMessage(
      getAccountHdPath(persistedState),
      Buffer.from(message).toString('hex'),
    );

    const signature = `0x${signedMessage.r}${
      signedMessage.s
    }${signedMessage.v.toString(16)}`;
    console.log(
      `Signature 0x${signedMessage.r}${
        signedMessage.s
      }${signedMessage.v.toString(16)}`,
    );

    const { address } = persistedState.accounts[persistedState.currentAccount];

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      data: message,
      signature: signedMessage,
      signatureHex: signature,
    };

    const updatedState: SnapKeyringState = Object.assign({}, persistedState);
    if (updatedState.signedMessages[address]) {
      updatedState.signedMessages[address].push(signedPayload);
    } else {
      updatedState.signedMessages[address] = [signedPayload];
    }

    await updateKeyringState(snap, updatedState);

    return signedPayload;
  }

  async signEIP712Message(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { message: any } },
  ): Promise<Signature> {
    const { message } = request.params;
    console.debug(`[Sign EIP712 Message] Message:`, message);

    const signedMessage = await this.eth.signPersonalMessage(
      getAccountHdPath(persistedState),
      Buffer.from(message).toString('hex'),
    );

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      data: message,
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
    request: { params: { message: any } },
  ): Promise<Signature> {
    const { message } = request.params;
    console.debug(`[Sign Message] Message:`, message);

    const signedMessage = await this.eth.signPersonalMessage(
      getAccountHdPath(persistedState),
      Buffer.from(message).toString('hex'),
    );

    const signedPayload: SignedPayload = {
      hexPayload: Buffer.from(message).toString('hex'),
      data: message,
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
    request: { params: { data: any; rawHexTx: any } },
  ): Promise<SignedPayload> {
    const { rawHexTx, data } = request.params;

    const { address } = persistedState.accounts[persistedState.currentAccount];
    data.from = address;

    console.log(`[Sign Transaction] Received Payload`, rawHexTx, data);
    console.log(
      '[Sign Transaction] Signing with path',
      getAccountHdPath(persistedState),
    );

    const signature = await this.eth.signTransaction(
      getAccountHdPath(persistedState),
      rawHexTx,
      null,
    );

    console.log(signature);

    delete data.accessList;
    data.type = 2;

    const serializeTransactionResult = serializeTransaction(data, {
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
      // eslint-disable-next-line radix
      v: parseInt(signature.v),
    });

    console.log(serializeTransactionResult);

    const existingTransactions = persistedState.transactions[address];

    const signedPayload: SignedPayload = {
      hexPayload: rawHexTx,
      data,
      signature,
      signedTxHex: serializeTransactionResult,
    };

    console.debug(`[Sign Transaction] Signed Payload`, signedPayload);

    const updatedState: SnapKeyringState = {
      ...persistedState,
      transactions: {
        ...persistedState.transactions,
        [address]: existingTransactions
          ? [...existingTransactions, signedPayload]
          : [signedPayload],
      },
    };

    await updateKeyringState(snap, updatedState);

    return signedPayload;
  }
}
