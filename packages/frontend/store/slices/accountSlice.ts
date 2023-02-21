import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import { HYDRATE } from 'next-redux-wrapper';
import {
  setAccountAction,
  setAddAccountAction,
  setSignMessageAction,
  setSignTransactionAction,
} from './accounts.actions';

type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export interface Account {
  address: string;
  name: string;
  hdPath: string;
}

// TODO: move to sdk
export interface Transaction {}

export interface SignedMessage {}

export interface AccountState {
  currentAccount: Account | null;
  accounts: Account[];
  status: 'idle' | 'loading' | 'failed';
  transactions: Record<string, Transaction[]>;
  messages: Record<string, SignedMessage[]>;
  ledgerError: string;
}

const initialState: AccountState = {
  currentAccount: null,
  accounts: [],
  status: 'idle',
  transactions: {},
  messages: {},
  ledgerError: ''
};

function isPendingAction(action: AnyAction): action is PendingAction {
  return action.type.endsWith('/pending');
}
function isFailedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith('/rejected');
}
function isFulfilledAction(action: AnyAction): action is FulfilledAction {
  return action.type.endsWith('/fulfilled');
}

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<Account>) => {
      state.currentAccount = action.payload;
    },
    setAvailableAccounts: (state, action: PayloadAction<Account[]>) => {
      if (action.payload.length === 0) return;

      state.accounts = action.payload;

      action.payload.forEach((account) => {
        if (!state.transactions[account.address]) {
          state.transactions[account.address] = [];
        }
        if (!state.messages[account.address]) {
          state.messages[account.address] = [];
        }
      });

      if (!state.currentAccount) {
        state.currentAccount = state.accounts[0];
      }
    },
    addSignedMessage: (
      state,
      action: PayloadAction<{ address: string; message: SignedMessage }>,
    ) => {
      const { address, message } = action.payload;
      state.messages[address].push(message);
    },
    addTransaction: (
      state,
      action: PayloadAction<{ address: string; transaction: Transaction }>,
    ) => {
      const { address, transaction } = action.payload;
      state.transactions[address].push(transaction);
    },
    setLedgerError: (state, action: PayloadAction<string>) => {
      state.ledgerError = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAccountAction.fulfilled, (state, action) => {
        state.status = 'idle';
        state.currentAccount = action.payload;
      })
      .addCase(setSignMessageAction.fulfilled, (state, action) => {
        state.status = 'idle';
        state.messages[state.currentAccount.address].push(action.payload);
      })
      .addCase(setSignTransactionAction.fulfilled, (state, action) => {
        state.status = 'idle';
        state.transactions[state.currentAccount.address].push(action.payload);
      })
      .addCase(setAddAccountAction.fulfilled, (state, action) => {
        state.status = 'idle';
        if (
          state.accounts.findIndex(
            (account) => account.address === action.payload.address,
          ) !== -1
        ) {
          state.accounts.push(action.payload);
        }
      })
      .addMatcher(isPendingAction, (state) => {
        state.status = 'loading';
      })
      .addMatcher(isFailedAction, (state, action) => {
        state.status = 'failed';
        console.log(`[${action.type} Rejected] ${action.error.message}`)
        state.ledgerError = action.error.message;
      });
  },
});

export const {
  setAccount,
  addTransaction,
  addSignedMessage,
  setAvailableAccounts,
  setLedgerError
} = accountSlice.actions;

export const selectCurrentAccount = (state: RootState) =>
  state.account.currentAccount;
export const selectAvailableAccounts = (state: RootState) =>
  state.account.accounts;
export const selectMessages = (state: RootState) => state.account.messages;
export const selectTransactions = (state: RootState) =>
  state.account.transactions;
export const selectLedgerErrorMessage = (state: RootState) => state.account.ledgerError

export default accountSlice.reducer;
