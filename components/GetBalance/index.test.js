import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GetBalance from '.';

describe('GetBalance', () => {
  it('should exist get balance button', () => {
    render(<GetBalance refreshBalance={() => { }} />);

    const btnElement = screen.getByRole('button', { name: /残高を取得/i });

    expect(btnElement).toBeInTheDocument();
  });

  it('should implement get balance flow', async () => {
    /** 準備 */
    const mockedRefreshBalance = jest.fn();

    render(<GetBalance refreshBalance={mockedRefreshBalance} />);
    const btnElement = screen.getByRole('button', { name: /残高を取得/i });

    /** 実行 */
    await userEvent.click(btnElement);

    /** 確認 */
    expect(mockedRefreshBalance).toBeCalled();
  });
});