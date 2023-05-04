import * as bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event/';

import GenerateWallet from '.';
import {
  dummyAccount,
  dummyMnemonic,
  dummySeed,
  dummyUint8ArraySeed,
} from '../../__test__/utils';

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

  it('should implement generate wallet flow', async () => {
    /** 準備 */
    const mockedSetAccount = jest.fn();
    /** 関数の戻り値にダミーの値を設定する */
    bip39.generateMnemonic.mockImplementation(() => dummyMnemonic);
    bip39.mnemonicToSeedSync.mockImplementation(() => dummySeed);
    jest.spyOn(Keypair, 'fromSeed').mockImplementation(() => dummyAccount);

    render(<GenerateWallet setAccount={mockedSetAccount} />);
    const btnElement = screen.getByRole('button', {
      name: /ウォレットを生成/i,
    });

    /** 実行 */
    await userEvent.click(btnElement);

    /** 確認 */
    expect(bip39.generateMnemonic).toBeCalled();
    expect(await screen.findByText(dummyMnemonic)).toBeInTheDocument();
    expect(Keypair.fromSeed).toBeCalledWith(dummyUint8ArraySeed);
  });
});
