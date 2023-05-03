import {
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Transfer from '.';

// TODO: mock化の共通化を検討する
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  sendAndConfirmTransaction: jest.fn(),
  Transaction: jest.fn(),
  SystemProgram: {
    transfer: jest.fn(),
  },
}));

describe('Transfer', () => {
  it('should exist transfer button', () => {
    render(<Transfer account={{}} network="" refreshBalance={() => {}} />);

    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /送金/i });

    expect(formElement).toBeInTheDocument();
    expect(btnElement).toBeInTheDocument();
  });
  it('should be able to transfer', async () => {
    /** 準備 */
    const mockTransaction = {
      add: jest.fn(),
    };
    const refreshBalance = jest.fn();
    Transaction.mockImplementation(() => mockTransaction);
    SystemProgram.transfer.mockReturnValue('mockInstruction');
    sendAndConfirmTransaction.mockResolvedValue('mockSignature');

    render(
      <Transfer
        account={{ publicKey: 'mockPublicKey', secretKey: 'mockSecretKey' }}
        network="mockNetwork"
        refreshBalance={refreshBalance}
      />,
    );
    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /送金/i });

    /** 実行 */
    await userEvent.type(formElement, 'mockRecipientPublicKey');
    await userEvent.click(btnElement);

    /** 確認 */
    const linkElement = screen.getByRole('link');

    expect(mockTransaction.add).toBeCalledWith('mockInstruction');
    expect(sendAndConfirmTransaction).toBeCalledWith(
      expect.anything(),
      mockTransaction,
      [{ publicKey: 'mockPublicKey', secretKey: 'mockSecretKey' }],
    );
    expect(refreshBalance).toBeCalled();
    expect(linkElement).toHaveAttribute(
      'href',
      `https://explorer.solana.com/tx/mockSignature?cluster=mockNetwork`,
    );
  });
});
