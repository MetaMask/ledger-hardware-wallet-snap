import { SnapProvider } from '@metamask/snap-types';

import { updateKeyringState } from './state';
import {
  KeyringAccountType,
  KeyringMode,
  SnapKeyringState,
} from '../types/SnapKeyringState';

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
