import * as Bip39 from 'bip39';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useState } from 'react';

import HeadComponent from '../components/Head';

const NETWORK = 'devnet';

export default function Home() {
  const [mnemonic, setMnemonic] = useState(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactionSig, setTransactionSig] = useState('');
  const [loading, setLoading] = useState(false);
  const [toAddress, setToAddress] = useState(null);

  /**
   * ニーモニックフレーズとアカウントの生成を行う関数。
   */
  const generateWallet = () => {
    // ニーモニックフレーズの生成。
    const generatedMnemonic = Bip39.generateMnemonic();
    setMnemonic(generatedMnemonic);
    console.log('generatedMnemonic', generatedMnemonic);

    const seed = Bip39.mnemonicToSeedSync(generatedMnemonic).slice(0, 32);
    console.log('seed', seed);

    const newAccount = Keypair.fromSeed(new Uint8Array(seed));
    console.log('newAccount', newAccount.publicKey.toString());

    setAccount(newAccount);
  };

  const handleImport = (e) => {
    e.preventDefault();
    // フォームに入力されたニーモニックフレーズを取得する。
    console.log('recoveryPhrase', recoveryPhrase);

    // ニーモニックフレーズを使用して、シードを生成する。
    const seed = Bip39.mnemonicToSeedSync(recoveryPhrase).slice(0, 32);

    // シードを使用して、アカウントを生成する。
    const importedAccount = Keypair.fromSeed(new Uint8Array(seed));
    setAccount(importedAccount);
  };

  const refreshBalance = async () => {
    try {
      // Connectionインスタンスの生成。
      const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');
      const publicKey = account.publicKey;

      let balance = await connection.getBalance(publicKey);
      // 残高がlamportで返ってくるため、SOLに変換する(100,000,000lamport = 1SOL)。
      balance = balance / LAMPORTS_PER_SOL;
      console.log('balance', balance);

      setBalance(balance);
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleAirdrop = async () => {
    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');
      const publicKey = account.publicKey;

      const confirmation = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL,
      );
      // 確認署名とコミットメントを受け取り、トランザクションがネットワークによって確認されると解決するプロミスを返す。
      await connection.confirmTransaction(confirmation, 'confirmed');
      // アカウントの残高を更新する。
      await refreshBalance();
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    setLoading(true);
    e.preventDefault();

    console.log('toAddress', toAddress);

    try {
      console.log('送金中...');
      setTransactionSig('');

      const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

      const instructions = SystemProgram.transfer({
        fromPubkey: account.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: LAMPORTS_PER_SOL,
      });

      const transaction = new Transaction().add(instructions);

      const signers = [
        {
          publicKey: account.publicKey,
          secretKey: account.secretKey,
        },
      ];

      const confirmation = await sendAndConfirmTransaction(
        connection,
        transaction,
        signers,
      );
      console.log('confirmation', confirmation);

      setTransactionSig(confirmation);

      await refreshBalance();

      console.log('送金が完了しました!!!');
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeadComponent />
      <div className="p-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          <span className="text-[#9945FF]">Solana</span>ウォレットを作ろう！
        </h1>
        <div className="mx-auto mt-5 text-gray-500">
          Solanaウォレットの新規作成、インポート、エアドロップ、送金機能の開発にチャレンジしてみよう
        </div>

        <hr className="my-6" />

        <div>
          <h3 className="p-2 border-dotted border-l-8 border-l-indigo-600">
            My Wallet
          </h3>
          {account && (
            <>
              <div className="my-6 text-indigo-600 font-bold">
                <span>アドレス: </span>
                <span data-testid="address">
                  {account.publicKey.toString()}
                </span>
              </div>
              <div className="my-6 font-bold">ネットワーク: {NETWORK}</div>
              {typeof balance === 'number' && (
                <div className="my-6 font-bold" data-testid="balance">
                  💰 残高: {balance} SOL
                </div>
              )}
            </>
          )}
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP1: ウォレットを新規作成する
          </h2>
          <button
            className="p-2 my-6 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
            onClick={generateWallet}
          >
            ウォレットを生成
          </button>
          {mnemonic && (
            <>
              <div
                className="mt-1 p-4 border border-gray-300 bg-gray-200"
                data-testid="mnemonic-display"
              >
                {mnemonic}
              </div>
              <strong className="text-xs">
                このフレーズは秘密にして、安全に保管してください。このフレーズが漏洩すると、誰でもあなたの資産にアクセスできてしまいます。
                <br />
                オンライン銀行口座のパスワードのようなものだと考えてください。
              </strong>
            </>
          )}
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP2: 既存のウォレットをインポートする
          </h2>
          <form onSubmit={handleImport} className="my-6">
            <div className="flex items-center border-b border-indigo-500 py-2">
              <input
                type="text"
                className="w-full text-gray-700 mr-3 p-1 focus:outline-none"
                placeholder="シークレットリカバリーフレーズ"
                onChange={(e) => setRecoveryPhrase(e.target.value)}
              />
              <input
                type="submit"
                className="p-2 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
                value="インポート"
              />
            </div>
          </form>
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP3: 残高を取得する
          </h2>
          {account && (
            <button
              className="p-2 my-6 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
              onClick={refreshBalance}
            >
              残高を取得
            </button>
          )}
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP4: エアドロップ機能を実装する
          </h2>
          {account &&
            (loading === true ? (
              <div data-testid="loading-airdrop">処理中...</div>
            ) : (
              <button
                className="p-2 my-6 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
                onClick={handleAirdrop}
              >
                Airdrop
              </button>
            ))}
        </div>

        <hr className="my-6" />

        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP5: 送金機能を実装する
          </h2>
          {account && (
            <>
              <form onSubmit={handleTransfer} className="my-6">
                <div className="flex items-center border-b border-indigo-500 py-2">
                  <input
                    type="text"
                    className="w-full text-gray-700 mr-3 p-1 focus:outline-none"
                    placeholder="送金先のウォレットアドレス"
                    onChange={(e) => setToAddress(e.target.value)}
                  />
                  {loading === true ? (
                    <div data-testid="loading-transfer">処理中...</div>
                  ) : (
                    <input
                      type="submit"
                      className="p-2 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
                      value="送金"
                    />
                  )}
                </div>
              </form>
              {transactionSig && (
                <>
                  <span className="text-red-600">送金が完了しました!</span>
                  <a
                    href={`https://explorer.solana.com/tx/${transactionSig}?cluster=${NETWORK}`}
                    className="border-double border-b-4 border-b-indigo-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solana Block Explorer でトランザクションを確認する
                  </a>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
