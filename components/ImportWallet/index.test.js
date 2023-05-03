import * as bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ImportWallet from '.';
import {
  mockAccount,
  mockMnemonic,
  mockSeed,
  mockUint8ArraySeed,
} from '../../__test__/utils';

/** bip39ライブラリのモック化 */
jest.mock('bip39', () => ({
  mnemonicToSeedSync: jest.fn(),
}));

describe('ImportWallet', () => {
  it('should exist import wallet button', () => {
    render(<ImportWallet />);

    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /インポート/i });

    expect(formElement).toBeInTheDocument();
    expect(btnElement).toBeInTheDocument();
  });
  it('should be able to import wallet from mnemonic phrase', async () => {
    /** 準備 */
    const setAccount = jest.fn();

    bip39.mnemonicToSeedSync.mockImplementation(() => mockSeed);

    jest.spyOn(Keypair, 'fromSeed').mockImplementation(() => mockAccount);

    render(<ImportWallet setAccount={setAccount} />);
    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /インポート/i });

    /** 実行 */
    await userEvent.type(formElement, mockMnemonic);
    await userEvent.click(btnElement);

    /** 確認 */
    expect(bip39.mnemonicToSeedSync).toBeCalledWith(mockMnemonic);
    expect(Keypair.fromSeed).toBeCalledWith(mockUint8ArraySeed);
    expect(setAccount).toBeCalledWith(mockAccount);
  });
});
