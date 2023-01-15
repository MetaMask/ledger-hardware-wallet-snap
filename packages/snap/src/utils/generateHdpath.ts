export const generateHdPath = ({
  // purpose = '44\'',
  // coinType = '60\'',
  // account = '0\'',
  // change = '0',
  addressIndex,
}: {
  // purpose: string;
  // coinType: string;
  // account: string;
  // change: string;
  addressIndex: string;
}): string => {
  const HD_PATH = "44'/60'/0'/0/x";
  const path = HD_PATH.replace('x', addressIndex);
  return path;
};
