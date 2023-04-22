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
let user;
let generateWalletButton;
let importButton;
let recoveryPhrase;

beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);

  act(() => {
    render(<Home />, container);
  });
  user = userEvent.setup();
  generateWalletButton = screen.getByText('ウォレットを生成');
  importButton = screen.getByText('インポート');
  recoveryPhrase =
    screen.getByPlaceholderText('シークレットリカバリーフレーズ');
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Home', () => {
  let mnemonicOfAlice;
  let mnemonicOfBob;
  let addressOfAlice;
  let addressOfBob;

  it('generates wallet', async () => {
    // 実行
    // Aliceのウォレットを生成する。
    await user.click(generateWalletButton);

    // 検証
    await waitFor(() => {
      expect(screen.queryByTestId('mnemonic-display')).toBeInTheDocument();
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    mnemonicOfAlice = screen.queryByTestId('mnemonic-display');
    addressOfAlice = screen.queryByTestId('address');
    const wordsOfAlice = mnemonicOfAlice.textContent.split(' ');
    expect(wordsOfAlice.length).toBe(12);
  });

  it('import wallet', async () => {
    // 準備
    // // ニーモニックフレーズを入力
    await user.type(recoveryPhrase, mnemonicOfAlice.textContent);
    await user.click(importButton);
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    const importedAddress = screen.queryByTestId('address');

    expect(importedAddress.textContent).toBe(addressOfAlice.textContent);
  });

  describe("Import and use Alice's Wallet", () => {
    beforeEach(async () => {
      // // ニーモニックフレーズを入力
      await user.type(recoveryPhrase, mnemonicOfAlice.textContent);
      // // [ インポート ]ボタンを押して、アドレスを表示させる
      await user.click(importButton);
      await waitFor(() => {
        expect(screen.queryByTestId('address')).toBeInTheDocument();
      });

      await user.clear(recoveryPhrase);
    });

    it('get balance', async () => {
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

      // 検証
      const balanceInfo = screen.queryByTestId('balance');
      expect(balanceInfo.textContent).toBe('💰 残高: 0 SOL');
    });

    it('airdrop', async () => {
      // 実行
      // // [ Airdrop ]ボタンを押す
      const airdropButton = screen.getByText('Airdrop');
      await user.click(airdropButton);
      // // ローディングインジケータが表示されるまで待機する
      await waitFor(() => {
        expect(screen.getByTestId('loading-airdrop')).toBeInTheDocument();
      });
      // // 非同期処理が終わるまで待機する
      await waitForElementToBeRemoved(screen.getByTestId('loading-airdrop'), {
        timeout: 10000,
      });
      await waitFor(
        () => {
          expect(screen.queryByTestId('balance')).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // 検証
      const balanceInfo = screen.queryByTestId('balance');
      expect(balanceInfo.textContent).toBe('💰 残高: 2 SOL');
    }, 20000);

    it('transfer', async () => {
      // 準備
      // // Bobのウォレットを生成する。
      await user.click(generateWalletButton);
      await waitFor(() => {
        expect(screen.queryByTestId('mnemonic-display')).toBeInTheDocument();
        expect(screen.queryByTestId('address')).toBeInTheDocument();
      });
      const mnemonicOfBob = screen.queryByTestId('mnemonic-display');
      const addressOfBob = screen.queryByTestId('address');

      console.log(`addressOfAlice.textContent: ${addressOfAlice.textContent}`);
      console.log(
        `mnemonicOfAlice.textContent: ${mnemonicOfAlice.textContent}`,
      );
      console.log(`addressOfBob.textContent: ${addressOfBob.textContent}`);
      console.log(`mnemonicOfBob.textContent: ${mnemonicOfBob.textContent}`);

      // // Aliceのウォレットをインポートする
      await user.type(recoveryPhrase, mnemonicOfAlice.textContent);
      await user.click(importButton);
      await waitFor(() => {
        expect(screen.queryByTestId('address')).toBeInTheDocument();
      });
      const importedAddress = screen.queryByTestId('address');
      expect(importedAddress.textContent).toBe(addressOfAlice.textContent);

      // // [ 残高を取得 ]ボタンを押す
      const getBalanceButton = screen.getByText('残高を取得');
      await user.click(getBalanceButton);
      await waitFor(
        () => {
          expect(screen.queryByTestId('balance')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      const balanceOfAlice = screen.queryByTestId('balance');
      expect(balanceOfAlice.textContent).toBe('💰 残高: 2 SOL');

      // // 実行
      // // Aliceが2SOL所有していることを確認したら、Bobに1SOL送金する
      const transferButton = screen.getByText('送金');
      const to = screen.getByPlaceholderText('送金先のウォレットアドレス');
      // // 送金先のウォレットアドレスを入力
      await user.type(to, addressOfBob.textContent);
      // // [ 送金 ]ボタンを押して、送金を実行
      await user.click(transferButton);
      // // ローディングインジケータが表示されるまで待機する
      await waitFor(() => {
        expect(screen.queryByTestId('loading-transfer')).toBeInTheDocument();
      });
      // 非同期処理が終わるまで待機する
      await waitForElementToBeRemoved(
        screen.queryByTestId('loading-transfer'),
        { timeout: 10000 },
      );

      await waitFor(
        () => {
          expect(
            screen.queryByTestId('送金が完了しました!'),
          ).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // 検証;
      const balanceOfBob = screen.queryByTestId('balance');
      expect(balanceOfBob.textContent).toBe('💰 残高: 0.999995 SOL');
    }, 20000);
  });
});
