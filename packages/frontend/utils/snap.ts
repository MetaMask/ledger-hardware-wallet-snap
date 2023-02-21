import { Account } from '@/store/slices/accountSlice';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [defaultSnapOrigin]: {},
    },
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (e) {
    console.log('failed to get request account', e);
  }
  console.log('requested accounts');
  try {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: {
        },
      },
    });
  } catch (e) {
    console.log('failed in request', e);
    throw e;
  }
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'hello',
      },
    },
  });
};

export const sendGetAccounts = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_getAccounts',
      },
    },
  });
};

export const sendListAccounts = async (page: number = 0) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_listAccounts',
        params: {
          page,
        },
      },
    },
  });
};

export const sendUpdateCurrentAccount = async (address: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_setAccount',
        params: {
          address,
        },
      },
    },
  });
};

export const sendSignMessage = async (message: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_signMessage',
        params: { message },
      },
    },
  });
};

export const sendSignTransaction = async (
  rawHexTx: string,
  data: Record<string, string>,
) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_signTransaction',
        params: { rawHexTx, data },
      },
    },
  });
};

export const sendAddAccount = async (accounts: Account[]) => {
  console.log(accounts);
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_addAccount',
        params: { accounts },
      },
    },
  });
};
export const sendRemoveAccount = async (address: string) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_removeAccount',
        params: { address },
      },
    },
  });
};

export const sendResetAccount = async ({ address }: { address: string }) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_resetAccount',
        params: { address },
      },
    },
  });
};

export const sendSetup = async ({ accounts }) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_setup',
        params: { accounts },
      },
    },
  });
};

export const sendGetPersistedState = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'getState',
      },
    },
  });
};

export const sendResetState = async () => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'keyring_forgetDevice',
      },
    },
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
