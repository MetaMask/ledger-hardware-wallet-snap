import { SnapProvider } from '@metamask/snap-types';

import { SnapKeyringState } from '../types/SnapKeyringState';

export const updateKeyringState = async (
  snap: SnapProvider,
  updatedState: SnapKeyringState,
): Promise<void> => {
  await snap.request({
    method: 'snap_manageState',
    params: ['update', updatedState],
  });
};
