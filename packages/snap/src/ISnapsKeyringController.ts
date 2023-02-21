import { SnapProvider } from '@metamask/snap-types';

import { KeyringAccount, SnapKeyringState } from './types/SnapKeyringState';
import { Signature, SignedPayload } from './types/transactions';

export type ISnapsBaseKeyringController = {
  connect(snap: SnapProvider): Promise<void>;
  setup(
    snap: SnapProvider,
    initialState: SnapKeyringState,
    request: unknown,
  ): Promise<string>;
  getAccounts(persistedState: SnapKeyringState): Promise<KeyringAccount[]>;
  addAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { accounts: KeyringAccount[] } },
  ): Promise<void>;
  removeAccount(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { address: string } },
  ): Promise<void>;
  listAccounts(
    persistedState: SnapKeyringState,
    request: { params: { page: number } },
  ): Promise<KeyringAccount[]>;
  signMessage(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { message: any } },
  ): Promise<SignedPayload>;
  signTransaction(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { data: any; rawHexTx: any } },
  ): Promise<SignedPayload>;
  signEIP712Message(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { message: any } },
  ): Promise<Signature>;
  signEIP712TypedMessage(
    snap: SnapProvider,
    persistedState: SnapKeyringState,
    request: { params: { message: any } },
  ): Promise<Signature>;
};

export type ISnapsHardwareKeyringController = {} & ISnapsBaseKeyringController;

export type ISnapsQRHardwareKeyringController = {
  requestSignature(): Promise<void>;
  sendSignature(): Promise<void>;
} & ISnapsBaseKeyringController;
