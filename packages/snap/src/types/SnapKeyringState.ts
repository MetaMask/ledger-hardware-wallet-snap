import { SignedPayload } from './transactions';

export type SnapKeyringState = {
  version: number;
  initialized: boolean;
  accounts: KeyringAccount[];
  currentAccount: number;
  perPage: number;
  keyringMode: KeyringMode;
  keyringAccountType: KeyringAccountType;
  signedMessages: Record<string, SignedPayload[]>;
  transactions: Record<string, SignedPayload[]>;
};

export enum KeyringMode {
  HD = 'hd',
  PUBKEY = 'pubkey',
  AccountAbstraction = 'accountAbstraction',
  SmartContract = 'smartContract',
  MPC = 'mpc',
}

export enum KeyringAccountType {
  Standard = 'account.standard',
  LedgerLive = 'account.ledger_live',
  LedgerLegacy = 'account.ledger_legacy',
}

export type KeyringAccount = {
  address: string;
  name: string;
  chainId: string;
  hdPath: string;
};
