/* eslint-disable no-case-declarations */
import { OnRpcRequestHandler, SnapRpcHandler } from '@metamask/snap-types';

import { SnapLedgerKeyring } from './ledger/SnapLedgerKeyring';
import {
  isUnrestrictedKeyringMethod,
  KeyringMethods,
} from './types/methods.enum';
import { SnapKeyringState } from './types/SnapKeyringState';
import { initializeSnapState } from './utils/initialize-state';
import { updateKeyringState } from './utils/state';

declare let snap;

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  let persistedState: SnapKeyringState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  });

  if (!persistedState) {
    persistedState = await initializeSnapState(snap);
  }

  // eslint-disable-next-line no-restricted-globals
  console.log(navigator);
  console.log(persistedState);
  console.debug('Request', request);

  const snapLedgerKeyring = new SnapLedgerKeyring();
  await snapLedgerKeyring.connect(snap);

  // Force Setup if state is not initialized
  if (
    !persistedState.initialized &&
    !isUnrestrictedKeyringMethod(request.method) &&
    request.method !== 'getState'
  ) {
    throw new Error(
      'Ledger Snap is not setup. Setup by calling `keyring_setup`',
    );
  }

  let confirmed: boolean;

  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: origin,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });
    case KeyringMethods.SetAccount:
      const accountIndex = snapLedgerKeyring.setAccount(
        persistedState,
        request,
      );
      const updatedState: SnapKeyringState = {
        ...persistedState,
        currentAccount: accountIndex,
      };
      return await updateKeyringState(snap, updatedState);
    case KeyringMethods.GetAccounts:
      return await snapLedgerKeyring.getAccounts(persistedState);
    case KeyringMethods.AddAccount:
      return await snapLedgerKeyring.addAccount(snap, persistedState, request);
    case KeyringMethods.RemoveAccount:
      return await snapLedgerKeyring.removeAccount(
        snap,
        persistedState,
        request,
      );
    case KeyringMethods.SignEIP712Message:
      confirmed = await snap.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Please confirm signing of this message`,
            textAreaContent: `${JSON.stringify(request.params)}`,
          },
        ],
      });
      if (!confirmed) {
        throw new Error('User rejected transaction');
      }
      throw new Error('TODO');
    case KeyringMethods.SignEIP712HashedMessage:
      confirmed = await snap.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Please confirm signing of this message`,
            textAreaContent: `${JSON.stringify(request.params)}`,
          },
        ],
      });
      if (!confirmed) {
        throw new Error('User rejected transaction');
      }
      throw new Error('TODO');
    case KeyringMethods.SignMessage:
      confirmed = await snap.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Please confirm signing of this message`,
            textAreaContent: `${JSON.stringify(request.params)}`,
          },
        ],
      });
      if (!confirmed) {
        throw new Error('User rejected transaction');
      }
      return await snapLedgerKeyring.signMessage(snap, persistedState, request);
    case KeyringMethods.SignTransaction:
      confirmed = await snap.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Please confirm signing of this message`,
            textAreaContent: `${JSON.stringify(request.params)}`,
          },
        ],
      });
      if (!confirmed) {
        throw new Error('User rejected transaction');
      }
      return await snapLedgerKeyring.signTransaction(
        snap,
        persistedState,
        request,
      );
    case KeyringMethods.ForgetDevice:
      return await snap.request({
        method: 'snap_manageState',
        params: { operation: 'clear' },
      });
    case KeyringMethods.ResetState:
      throw new Error('TODO');

    case KeyringMethods.ListAccounts:
      return await snapLedgerKeyring.listAccounts(persistedState, request);
    // Only called once
    case KeyringMethods.Setup:
      if (persistedState.initialized) {
        throw new Error('Ledger is already setup');
      }
      return snapLedgerKeyring.setup(snap, persistedState, request);
    case 'getState':
      return persistedState;
    default:
      throw new Error('Method not found.');
  }
};
