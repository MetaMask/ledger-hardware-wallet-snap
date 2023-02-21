export enum KeyringMethods {
  Setup = 'keyring_setup',
  SetAccount = 'keyring_setAccount',
  SignTransaction = 'keyring_signTransaction',
  SignMessage = 'keyring_signMessage',
  SignEIP712Message = 'keyring_signEIP712Message',
  SignEIP712HashedMessage = 'keyring_signEIP712HashedMessage',
  GetAccounts = 'keyring_getAccounts',
  AddAccount = 'keyring_addAccount',
  RemoveAccount = 'keyring_removeAccount',
  ForgetDevice = 'keyring_forgetDevice',
  ResetState = 'keyring_resetState',
  ListAccounts = 'keyring_listAccounts',

  // for qr key rings
  QrRequestSignature = 'keyring_qr_requestSignature',
  QrCancelRequestSignature = 'keyring_qr_cancelRequestSignature',
  QrSubmitSignature = 'keyring_qr_submitSignature',
}

export const UnrestrictedKeyringMethods = [
  KeyringMethods.SetAccount,
  KeyringMethods.Setup,
  KeyringMethods.RemoveAccount,
  KeyringMethods.ForgetDevice,
  KeyringMethods.GetAccounts,
  KeyringMethods.RemoveAccount,
  KeyringMethods.AddAccount,
  KeyringMethods.ResetState,
  KeyringMethods.ListAccounts,
];

export function isUnrestrictedKeyringMethod(method: string): boolean {
  return UnrestrictedKeyringMethods.includes(method as KeyringMethods);
}
