import { SnapProvider } from '@metamask/snap-types';

import { KeyringAccount, SnapKeyringState } from './types/SnapKeyringState';
import { Signature } from './types/transactions';

export type ISnapsBaseKeyringController = {
  connect(snap: SnapProvider): Promise<void>;
  setup(
    snap: SnapProvider,
    initialState: SnapKeyringState,
    request: unknown,
  ): Promise<void>;
  getAccounts(persistedState: SnapKeyringState): Promise<KeyringAccount[]>;
  addAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: unknown,
  ): Promise<void>;
  removeAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: unknown,
  ): Promise<void>;
  listAccounts(
    persistedState: SnapKeyringState,
    request: { page: number },
  ): Promise<KeyringAccount[]>;
  signMessage(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: unknown,
  ): Promise<Signature>;
  signTransaction(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: unknown,
  ): Promise<Signature>;
  signEIP712Message(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: unknown,
  ): Promise<Signature>;
  signEIP712TypedMessage(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: unknown,
  ): Promise<Signature>;
};

export type ISnapsHardwareKeyringController = {} & ISnapsBaseKeyringController;

export type ISnapsQRHardwareKeyringController = {
  requestSignature(): Promise<void>;
  sendSignature(): Promise<void>;
} & ISnapsBaseKeyringController;
