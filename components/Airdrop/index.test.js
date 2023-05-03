import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Airdrop from '.';

// TODO: mock化の共通化を検討する
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  confirmTransaction: jest.fn(),
  LAMPORTS_PER_SOL: 1000000000,
}));

describe('Airdrop', () => {
  it('should exist airdrop button', () => {
    render(<Airdrop account={{}} network="" refreshBalance={() => {}} />);

    const btnElement = screen.getByRole('button', { name: /Airdrop/i });

    expect(btnElement).toBeInTheDocument();
  });

  it('should be able to airdrop', async () => {
    /** 準備 */
    const mockRequestAirdrop = jest.fn(() => Promise.resolve('signature'));
    const mockGetLatestBlockhash = jest.fn(() =>
      Promise.resolve({ blockhash: 'blockhash', lastValidBlockHeight: 1 }),
    );
    const mockConfirmTransaction = jest.fn(() =>
      Promise.resolve({ value: true }),
    );
    const refreshBalance = jest.fn();

    Connection.mockImplementation(() => ({
      requestAirdrop: mockRequestAirdrop,
      getLatestBlockhash: mockGetLatestBlockhash,
      confirmTransaction: mockConfirmTransaction,
    }));

    render(
      <Airdrop
        account={{ publicKey: 'mockPublicKey' }}
        network=""
        refreshBalance={refreshBalance}
      />,
    );
    const btnElement = screen.getByRole('button', { name: /Airdrop/i });

    /** 実行 */
    await userEvent.click(btnElement);

    /** 確認 */
    expect(mockRequestAirdrop).toBeCalledWith(
      'mockPublicKey',
      LAMPORTS_PER_SOL,
    );
    expect(mockConfirmTransaction).toBeCalledWith(
      {
        signature: 'signature',
        blockhash: 'blockhash',
        lastValidBlockHeight: 1,
      },
      expect.anything(),
    );
    expect(refreshBalance).toBeCalled();
  });
});
