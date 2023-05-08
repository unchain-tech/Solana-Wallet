import {
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Transfer from '.';
import { dummyAccount, dummyNetwork } from '../../test/utils';

jest.mock('@solana/web3.js', () => ({
  ...jest.requireActual('@solana/web3.js'),
  Connection: jest.fn(),
  sendAndConfirmTransaction: jest.fn(),
  SystemProgram: {
    transfer: jest.fn(),
  },
  Transaction: jest.fn(),
}));

describe('Transfer', () => {
  it('should exist transfer button', () => {
    render(<Transfer account={{}} network="" refreshBalance={() => {}} />);

    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /送金/i });

    expect(formElement).toBeInTheDocument();
    expect(btnElement).toBeInTheDocument();
  });

  it('should implement transfer flow', async () => {
    /** 準備 */
    const mockedRefreshBalance = jest.fn();
    /** Transactionクラスをモックする */
    const mockedTransaction = {
      add: jest.fn(),
    };
    Transaction.mockImplementation(() => mockedTransaction);
    /** 関数の戻り値にダミーの値を設定する */
    sendAndConfirmTransaction.mockResolvedValue('mockSignature');
    SystemProgram.transfer.mockReturnValue('mockInstruction');

    render(
      <Transfer
        account={dummyAccount}
        network={dummyNetwork}
        refreshBalance={mockedRefreshBalance}
      />,
    );
    const formElement = screen.getByRole('textbox');
    const btnElement = screen.getByRole('button', { name: /送金/i });

    /** 実行 */
    await userEvent.type(formElement, 'mockRecipientPublicKey');
    await userEvent.click(btnElement);

    /** 確認 */
    const linkElement = screen.getByRole('link');

    expect(mockedTransaction.add).toBeCalledWith('mockInstruction');
    expect(sendAndConfirmTransaction).toBeCalledWith(
      expect.anything(),
      mockedTransaction,
      [
        {
          publicKey: dummyAccount.publicKey,
          secretKey: dummyAccount.secretKey,
        },
      ],
    );
    expect(mockedRefreshBalance).toBeCalled();
    expect(linkElement).toHaveAttribute(
      'href',
      `https://explorer.solana.com/tx/mockSignature?cluster=${dummyNetwork}`,
    );
  });
});
