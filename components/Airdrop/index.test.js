import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Airdrop from '.';
import { dummyAccount, dummyNetwork } from '../../test/utils';

jest.mock('@solana/web3.js', () => ({
  ...jest.requireActual('@solana/web3.js'),
  Connection: jest.fn(),
}));

describe('Airdrop', () => {
  it('should exist airdrop button', () => {
    render(<Airdrop account={{}} network="" refreshBalance={() => {}} />);

    const btnElement = screen.getByRole('button', { name: /Airdrop/i });

    expect(btnElement).toBeInTheDocument();
  });

  it('should implement airdrop flow', async () => {
    /** 準備 */
    const mockedRefreshBalance = jest.fn();
    /** Connectionクラスをモックする */
    const mockedRequestAirdrop = jest.fn(() => Promise.resolve('signature'));
    const mockedGetLatestBlockhash = jest.fn(() =>
      Promise.resolve({ blockhash: 'blockhash', lastValidBlockHeight: 1 }),
    );
    const mockedConfirmTransaction = jest.fn(() =>
      Promise.resolve({ value: true }),
    );
    Connection.mockImplementation(() => ({
      requestAirdrop: mockedRequestAirdrop,
      getLatestBlockhash: mockedGetLatestBlockhash,
      confirmTransaction: mockedConfirmTransaction,
    }));

    render(
      <Airdrop
        account={dummyAccount}
        network={dummyNetwork}
        refreshBalance={mockedRefreshBalance}
      />,
    );
    const btnElement = screen.getByRole('button', { name: /Airdrop/i });

    /** 実行 */
    await userEvent.click(btnElement);

    /** 確認 */
    expect(mockedRequestAirdrop).toBeCalledWith(
      dummyAccount.publicKey,
      LAMPORTS_PER_SOL,
    );
    expect(mockedConfirmTransaction).toBeCalledWith(
      {
        signature: 'signature',
        blockhash: 'blockhash',
        lastValidBlockHeight: 1,
      },
      expect.anything(),
    );
    expect(mockedRefreshBalance).toBeCalled();
  });
});
