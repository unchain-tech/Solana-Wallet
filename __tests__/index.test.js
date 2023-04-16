import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import Home from '../pages/index';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Home', () => {
  let mnemonic;
  let address;
  it('generates a mnemonic phrase', async () => {
    act(() => {
      render(<Home />, container);
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('ウォレットを生成'));

    await waitFor(() => {
      expect(screen.queryByTestId('mnemonic-display')).toBeInTheDocument();
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    mnemonic = screen.queryByTestId('mnemonic-display');
    address = screen.queryByTestId('address');
    const words = mnemonic.textContent.split(' ');

    console.log('First address:', address.textContent);

    expect(words.length).toBe(12);
  });

  it('import wallet', async () => {
    act(() => {
      render(<Home />, container);
    });
    const user = userEvent.setup();
    const importButton = screen.getByText('インポート');
    const recoveryPhrase =
      screen.getByPlaceholderText('シークレットリカバリーフレーズ');
    // ニーモニックフレーズを入力
    await user.type(recoveryPhrase, mnemonic.textContent);
    await user.click(importButton);
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    const importedAddress = screen.queryByTestId('address');

    expect(importedAddress.textContent).toBe(address.textContent);
  });

  it('get balance', async () => {
    // 準備
    act(() => {
      render(<Home />, container);
    });
    const user = userEvent.setup();
    const importButton = screen.getByText('インポート');
    const recoveryPhrase =
      screen.getByPlaceholderText('シークレットリカバリーフレーズ');
    // // ニーモニックフレーズを入力
    await user.type(recoveryPhrase, mnemonic.textContent);
    // // [ インポート ]ボタンを押して、アドレスを表示させる
    await user.click(importButton);
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });

    // 実行
    // // [ 残高を取得 ]ボタンを押す
    const getBalanceButton = screen.getByText('残高を取得');
    await user.click(getBalanceButton);
    await waitFor(
      () => {
        expect(screen.queryByTestId('balance')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // 確認
    const balanceInfo = screen.queryByTestId('balance');
    expect(balanceInfo.textContent).toBe('💰 残高: 0 SOL');
  });

  it('airdrop', async () => {
    // 準備
    act(() => {
      render(<Home />, container);
    });
    const user = userEvent.setup();
    const importButton = screen.getByText('インポート');
    const recoveryPhrase =
      screen.getByPlaceholderText('シークレットリカバリーフレーズ');
    // // ニーモニックフレーズを入力
    await user.type(recoveryPhrase, mnemonic.textContent);
    // // [ インポート ]ボタンを押して、アドレスを表示させる
    await user.click(importButton);
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });

    // 実行
    // // [ Airdrop ]ボタンを押す
    const airdropButton = screen.getByText('Airdrop');
    await user.click(airdropButton);
    // ローディングインジケータが表示されるまで待機する
    await waitFor(() => {
      expect(screen.getByTestId('loading-airdrop')).toBeInTheDocument();
    });
    // 非同期処理が終わるまで待機する
    await waitForElementToBeRemoved(screen.getByTestId('loading-airdrop'), {
      timeout: 10000,
    });

    await waitFor(
      () => {
        expect(screen.queryByTestId('balance')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // // 確認
    const balanceInfo = screen.queryByTestId('balance');
    expect(balanceInfo.textContent).toBe('💰 残高: 1 SOL');
  }, 10000);

  it('transfer', async () => {
    // 準備
    act(() => {
      render(<Home />, container);
    });
    const user = userEvent.setup();

    // // 新たにWalletを作成する
    await user.click(screen.getByText('ウォレットを生成'));
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    const bobAddress = screen.queryByTestId('address');
    console.log('Second address:', address.textContent);

    // // 最初のアドレスをインポートして、残高を確認する
    const importButton = screen.getByText('インポート');
    const recoveryPhrase =
      screen.getByPlaceholderText('シークレットリカバリーフレーズ');
    // // ニーモニックフレーズを入力
    await user.type(recoveryPhrase, mnemonic.textContent);
    // // [ インポート ]ボタンを押して、アドレスを表示させる
    await user.click(importButton);
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    // // 送金を行うアドレスを確認
    const currentAddress = screen.queryByTestId('address');
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    expect(currentAddress.textContent).toBe(address.textContent);
    // // // // [ Airdrop ]ボタンを押す(最低2SOL必要なため)
    // const airdropButton = screen.getByText("Airdrop");
    // await user.click(airdropButton);
    // // // ローディングインジケータが表示されるまで待機する
    // await waitFor(() => {
    //   expect(screen.getByTestId("loading-airdrop")).toBeInTheDocument();
    // });
    // // 非同期処理が終わるまで待機する
    // await waitForElementToBeRemoved(screen.getByTestId("loading-airdrop"), { timeout: 10000 });

    // await waitFor(() => {
    //   expect(screen.queryByTestId("balance")).toBeInTheDocument();
    // }, { timeout: 10000 });

    // // // 確認
    // const balanceOfAlice = screen.queryByTestId("balance");
    // expect(balanceOfAlice.textContent).toBe("💰 残高: 2 SOL");

    // // 実行
    // // 1SOLあることを確認したら、アドレス２に0.5SOL送金する
    // const transferButton = screen.getByText("送金");
    // const to = screen.getByPlaceholderText("送金先のウォレットアドレス");
    // // // 送金先のウォレットアドレスを入力
    // await user.type(to, bobAddress.textContent);
    // // // [ 送金 ]ボタンを押して、送金を実行
    // await user.click(transferButton);
    // // ローディングインジケータが表示されるまで待機する
    // await waitFor(() => {
    //   expect(screen.getByTestId("loading-transfer")).toBeInTheDocument();
    // });
    // // 非同期処理が終わるまで待機する
    // await waitForElementToBeRemoved(screen.getByTestId("loading-transfer"), { timeout: 10000 });

    // await waitFor(() => {
    //   expect(screen.queryByTestId("送金が完了しました!")).toBeInTheDocument();
    // }, { timeout: 10000 });

    // // // 確認
    // const balanceOfBob = screen.queryByTestId("balance");
    // expect(balanceOfBob.textContent).toBe("💰 残高: 0.999995 SOL");
  });
});
