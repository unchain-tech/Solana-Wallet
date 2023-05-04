import * as bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ImportWallet from '.';
import {
  dummyAccount,
  dummyMnemonic,
  dummySeed,
  dummyUint8ArraySeed,
} from '../../__test__/utils';

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
  it('should implement import wallet flow', async () => {
    /** 準備 */
    const mockedSetAccount = jest.fn();
    /** 関数の戻り値にダミーの値を設定する */
    bip39.mnemonicToSeedSync.mockImplementation(() => dummySeed);
    jest.spyOn(Keypair, 'fromSeed').mockImplementation(() => dummyAccount);

    render(<ImportWallet setAccount={mockedSetAccount} />);
    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /インポート/i });

    /** 実行 */
    await userEvent.type(formElement, dummyMnemonic);
    await userEvent.click(btnElement);

    /** 確認 */
    expect(bip39.mnemonicToSeedSync).toBeCalledWith(dummyMnemonic);
    expect(Keypair.fromSeed).toBeCalledWith(dummyUint8ArraySeed);
    expect(mockedSetAccount).toBeCalledWith(dummyAccount);
  });
});
