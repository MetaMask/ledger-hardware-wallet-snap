import { SnapKeyringState } from '../types/SnapKeyringState';

export const getAccountHdPath = (state: SnapKeyringState): string => {
  return state.accounts[state.currentAccount].hdPath;
};
