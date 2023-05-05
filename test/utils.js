import { Keypair } from '@solana/web3.js';

export const dummyMnemonic =
  'health milk myth struggle bless calm machine limit radio jewel bundle void';
export const dummySeed = Buffer.from('0123456789abcdef0123456789abcdef');
export const dummyUint8ArraySeed = new Uint8Array(dummySeed);
export const dummyAccount = Keypair.generate();
export const dummyNetwork = 'network';
