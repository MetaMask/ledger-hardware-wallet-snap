export type Signature = {
  v: number | string;
  s: string;
  r: string;
};

export type SignedPayload = {
  hexPayload: string;
  data: Record<string, string>;
  signature: Signature;
  signedTxHex?: string;
  signatureHex?: string;
};
