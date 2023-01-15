export interface Signature {
  v: number | string;
  s: string;
  r: string;
}

export interface SignedPayload {
  hexPayload: string;
  signature: Signature;
}
