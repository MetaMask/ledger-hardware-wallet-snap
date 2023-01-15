import { SnapProvider } from '@metamask/snap-types';
import {
  KeyringAccountType,
  KeyringMode,
  SnapKeyringState,
} from '../types/SnapKeyringState';
import { updateKeyringState } from './state';

export const initializeSnapState = async (
  snap: SnapProvider,
): Promise<SnapKeyringState> => {
  const initialState: SnapKeyringState = {
    version: 1,
    initialized: false,
    accounts: [],
    currentAccount: 0,
    perPage: 10,
    keyringMode: KeyringMode.HD,
    keyringAccountType: KeyringAccountType.Standard,
    signedMessages: {},
    transactions: {},
  };

  await updateKeyringState(snap, initialState);

  return initialState;
};
