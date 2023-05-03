import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import Airdrop from '../components/Airdrop';
import GenerateWallet from '../components/GenerateWallet/';
import GetBalance from '../components/GetBalance';
import HeadComponent from '../components/Head';
import ImportWallet from '../components/ImportWallet';
import Transfer from '../components/Transfer';

export default function Home() {
  const [network, setNetwork] = useState(undefined);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
    if (NETWORK === 'localnet') {
      setNetwork('http://127.0.0.1:8899');
    } else if (NETWORK === 'devnet') {
      const network = clusterApiUrl(NETWORK);
      setNetwork(network);
    } else {
      console.error(`Invalid network: ${NETWORK}. Use 'devnet' or 'localnet'.`);
    }
  }, [network]);

  const refreshBalance = async () => {
    try {
      // Connectionインスタンスの生成。
      const connection = new Connection(network, 'confirmed');
      const publicKey = account.publicKey;

      let balance = await connection.getBalance(publicKey);
      // 残高がlamportで返ってくるため、SOLに変換する(100,000,000lamport = 1SOL)。
      balance = balance / LAMPORTS_PER_SOL;
      console.log('balance:', balance);

      setBalance(balance);
    } catch (error) {
      console.log('ERROR!', error);
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
              <div className="my-6 font-bold">ネットワーク: {network}</div>
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
          <GenerateWallet setAccount={setAccount} />
        </div>
        <hr className="my-6" />
        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP2: 既存のウォレットをインポートする
          </h2>
          <ImportWallet setAccount={setAccount} />
        </div>
        <hr className="my-6" />
        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP3: 残高を取得する
          </h2>
          {account && <GetBalance refreshBalance={refreshBalance} />}
        </div>
        <hr className="my-6" />
        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP4: エアドロップ機能を実装する
          </h2>
          {account && (
            <Airdrop
              account={account}
              network={network}
              refreshBalance={refreshBalance}
            />
          )}
        </div>
        <hr className="my-6" />
        <div>
          <h2 className="p-2 border-dotted border-l-4 border-l-indigo-400">
            STEP5: 送金機能を実装する
          </h2>
          {account && (
            <Transfer
              account={account}
              network={network}
              refreshBalance={refreshBalance}
            />
          )}
        </div>
      </div>
    </div>
  );
}
