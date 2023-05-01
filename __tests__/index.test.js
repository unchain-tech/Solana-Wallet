import * as Bip39 from 'bip39';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import Home from '../pages/index';

/**
 * 実行する機能
 * 1. ウォレット生成
 * （生成）
 *  // Aliceのアドレス
 *  // Aliceのリカバリーフレーズ
 * ---
 * 2. リカバリーフレーズのインポート
 * (前提)
 *  // Aliceのリカバリーフレーズ
 * 3. 残高取得
 * （前提）
 *  // Aliceのウォレットがインポートされていること
 * 4. airdrop
 * (前提)
 *  // Aliceのウォレットがインポートされていること
 * 5. transfer
 * （前提）
 *  // Bobのウォレットアドレスがあること
 *  // AliceがSolを所有していること
 */

const LoadSetup = async () => {
  // Aliceのアドレス
  /** DOM要素をレンダリングターゲットに設定する */
  const container = document.createElement('div');
  document.body.appendChild(container);

  /** テストで使用する変数を定義 */
  act(() => {
    render(<Home />, container);
  });
  const user = userEvent.setup();
  const generateWalletButton = screen.getByText('ウォレットを生成');

  // Aliceのウォレットを生成
  await user.click(generateWalletButton);
  await waitFor(() => {
    expect(screen.queryByTestId('mnemonic-display')).toBeInTheDocument();
    expect(screen.queryByTestId('address')).toBeInTheDocument();
  });
  const mnemonicOfAlice = screen.queryByTestId('mnemonic-display');
  const addressOfAlice = screen.queryByTestId('address');

  // 12単語のシードフレーズが生成されていることを確認
  expect(mnemonicOfAlice.textContent.split(' ').length).toBe(12);

  const connectionRpc = await new Connection(
    'http://127.0.0.1:8899',
    'confirmed',
  );

  return {
    user,
    mnemonicOfAlice,
    addressOfAlice,
    connectionRpc,
    generateWalletButton,
  };
};

describe('Home', function () {
  it('import wallet', async function () {
    /** 準備 LoadSetupを呼び出して必要な変数を取ってくる */
    const { user, addressOfAlice, mnemonicOfAlice } = await LoadSetup();

    const importButton = screen.getByText('インポート');
    const recoveryPhrase =
      screen.getByPlaceholderText('シークレットリカバリーフレーズ');

    /** 実行 */
    // ニーモニックフレーズを入力
    await user.type(recoveryPhrase, mnemonicOfAlice.textContent);
    await user.click(importButton);
    await waitFor(() => {
      expect(screen.queryByTestId('address')).toBeInTheDocument();
    });
    const importedAddress = screen.queryByTestId('address');

    /** 検証 */
    expect(importedAddress.textContent).toBe(addressOfAlice.textContent);
  });

  it('balance', async function () {
    /** 準備 */
    const { user } = await LoadSetup();

    /** 実行 */
    /** [ 残高を取得 ]ボタンを押す */
    const getBalanceButton = screen.getByText('残高を取得');
    await user.click(getBalanceButton);
    await waitFor(
      () => {
        expect(screen.queryByTestId('balance')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    /** 検証 */
    const balanceInfo = screen.queryByTestId('balance');
    expect(balanceInfo.textContent).toBe('💰 残高: 0 SOL');
  }, 10000);

  it('airdrop', async function () {
    /** 準備 */
    const { user, addressOfAlice } = await LoadSetup();

    /** 実行 */
    /** [ Airdrop ]ボタンを押す */
    const airdropButton = screen.getByText('Airdrop');
    await user.click(airdropButton);
    // /** ローディングインジケータが表示されるまで待機する */
    await waitFor(() => {
      expect(screen.getByTestId('loading-airdrop')).toBeInTheDocument();
    });
    /** 非同期処理が終わるまで待機する */
    await waitForElementToBeRemoved(screen.getByTestId('loading-airdrop'), {
      timeout: 10000,
    });
    await waitFor(
      () => {
        expect(screen.queryByTestId('balance')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    /** 検証 */
    const balanceInfo = screen.queryByTestId('balance');
    expect(balanceInfo.textContent).toBe('💰 残高: 1 SOL');
  }, 20000);

  it('transfer', async function () {
    /** 準備 */
    const {
      user,
      addressOfAlice,
      mnemonicOfAlice,
      connectionRpc,
      generateWalletButton,
    } = await LoadSetup();

    console.log(connectionRpc.rpcEndpoint);

    const aliceOriginalAddress = addressOfAlice.textContent;
    const alicePubKey = new PublicKey(addressOfAlice.textContent);

    // await new Promise((resolve) => setTimeout(resolve, 3000));

    // let balance = await connectionRpc.getBalance(alicePubKey);
    // console.log('balance1', balance, aliceOriginalAddress.textContent);

    // console.log(connectionRpc.rpcEndpoint);

    // const signature = await connectionRpc.requestAirdrop(
    //   alicePubKey,
    //   1 * LAMPORTS_PER_SOL,
    // );
    // await connectionRpc.confirmTransaction(signature);
    // const latestBlockHash = await connectionRpc.getLatestBlockhash();

    // await connectionRpc.confirmTransaction({
    //   blockhash: latestBlockHash.blockhash,
    //   lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    //   signature
    // })
    // const signatureStatus = await connectionRpc.getSignatureStatus(signature);

    const balance = await connectionRpc.getBalance(alicePubKey);
    expect(balance).toBe(1 * LAMPORTS_PER_SOL);

    /** Bobのウォレットアドレスを生成 */
    const generatedMnemonic = Bip39.generateMnemonic();
    const seed = Bip39.mnemonicToSeedSync(generatedMnemonic).slice(0, 32);
    const accountOfBob = Keypair.fromSeed(new Uint8Array(seed));
    console.log('accountOfBob', accountOfBob, accountOfBob.publicKey);

    /** 実行 */
    /** Aliceが1SOL所有していることを確認したら、Bobに0.5SOL送金する */
    const transferButton = screen.getByText('送金');
    const to = screen.getByPlaceholderText('送金先のウォレットアドレス');

    /** Bobのウォレットアドレスを入力 */
    await user.type(to, accountOfBob.publicKey.toString());

    /** [ 送金 ]ボタンを押して、送金を実行 */
    await user.click(transferButton);
    /** ローディングインジケータが表示されるまで待機する */
    await waitFor(() => {
      expect(screen.queryByTestId('loading-transfer')).toBeInTheDocument();
    });
    /** 非同期処理が終わるまで待機する */
    await waitForElementToBeRemoved(screen.queryByTestId('loading-transfer'), {
      timeout: 10000,
    });
    await waitFor(
      () => {
        expect(screen.queryByTestId('送金が完了しました!')).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    /** 検証 */
    const balanceOfAlice = await connectionRpc.getBalance(
      aliceOriginalAddress.textContent,
    );
    expect(balanceOfAlice).toBe(0.499995 * LAMPORTS_PER_SOL);

    // Bobの残金を確認する
    const balanceOfBob = await connectionRpc.getBalance(accountOfBob.publicKey);
    expect(balanceOfBob).toBe(0.5 * LAMPORTS_PER_SOL);
  }, 100000);
}, 500000);
