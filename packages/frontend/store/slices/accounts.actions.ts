import {
  sendAddAccount,
  sendRemoveAccount,
  sendSignMessage,
  sendSignTransaction,
  sendUpdateCurrentAccount,
} from '@/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Account } from './accountSlice';

export const setAccountAction = createAsyncThunk(
  'account/setAccount',
  async (account: Account) => {
    console.log('[setAccountAction]', account);
    await sendUpdateCurrentAccount(account.address);
    return account;
  },
);

export const setSignMessageAction = createAsyncThunk(
  'account/setSignMessage',
  async (message: string) => {
    console.log('[setSignMessageAction]', message);
    const signedMessage = await sendSignMessage(message);
    return signedMessage;
  },
);

export const setSignTransactionAction = createAsyncThunk(
  'account/setSignTransactionAction',
  async (payload: { rawHexTx: string; data: Record<sting, string> }) => {
    console.log(payload)
    const { rawHexTx, data } = payload;
    console.log('[setSignTransactionAction]', rawHexTx, data);
    const signedTx = await sendSignTransaction(rawHexTx, data);
    console.log(`[setSignTransactionAction] Result`, signedTx);
    return signedTx;
  },
);

export const setAddAccountAction = createAsyncThunk(
  'account/setAddAccountAction',
  async (accounts: Account[]) => {
    console.log('[setAddAccountAction]', accountAddresses);
    await sendAddAccount(accounts.map((account) => account.address));
    return accounts;
  },
);

export const setRemoveAccountAction = createAsyncThunk(
  'account/setSignMessage',
  async (account: Account) => {
    console.log('[setResetAccountAction]', account);
    await sendRemoveAccount(account.address);
    return account;
  },
);

export const setResetAccountAction = createAsyncThunk(
  'account/setSignMessage',
  async (account) => {
    console.log('[setAccountAction]', account);
    const result = await sendUpdateCurrentAccount(account.address);
    return account;
  },
);

export const setSetupAction = createAsyncThunk(
  'account/setSignMessage',
  async (account) => {
    console.log('[setAccountAction]', account);
    const result = await sendUpdateCurrentAccount(account.address);
    return account;
  },
);
