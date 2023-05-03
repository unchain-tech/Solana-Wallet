import { Keypair } from '@solana/web3.js';

// 共通の定数
export const mockMnemonic =
  'health milk myth struggle bless calm machine limit radio jewel bundle void';
export const mockSeed = Buffer.from('0123456789abcdef0123456789abcdef');
export const mockUint8ArraySeed = new Uint8Array(mockSeed);
export const mockAccount = Keypair.generate();
