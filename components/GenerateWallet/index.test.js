import * as Bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event/';

import GenerateWallet from '.';
import {
  mockAccount,
  mockMnemonic,
  mockSeed,
  mockUint8ArraySeed,
} from '../../__test__/utils';

/** Bip39ライブラリのモック化 */
jest.mock('bip39', () => ({
  generateMnemonic: jest.fn(),
  mnemonicToSeedSync: jest.fn(),
}));

describe('GenerateWallet', () => {
  it('should exist generate wallet button', () => {
    render(<GenerateWallet />);
    const btnElement = screen.getByRole('button', {
      name: /ウォレットを生成/i,
    });
    expect(btnElement).toBeInTheDocument();
  });

  it('should generates a new wallet on button click', async () => {
    /** 準備 */
    const setAccount = jest.fn();

    Bip39.generateMnemonic.mockImplementation(() => mockMnemonic);
    Bip39.mnemonicToSeedSync.mockImplementation(() => mockSeed);

    /** Keypair.fromSeed()をモック化する */
    jest.spyOn(Keypair, 'fromSeed').mockImplementation(() => mockAccount);

    render(<GenerateWallet setAccount={setAccount} />);
    const btnElement = screen.getByRole('button', {
      name: /ウォレットを生成/i,
    });

    /** 実行 */
    await userEvent.click(btnElement);

    /** 確認 */
    expect(Bip39.generateMnemonic).toBeCalled();
    expect(await screen.findByText(mockMnemonic)).toBeInTheDocument();
    expect(Keypair.fromSeed).toBeCalledWith(mockUint8ArraySeed);
  });
});
