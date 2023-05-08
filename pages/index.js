import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import Airdrop from '../components/Airdrop';
import GenerateWallet from '../components/GenerateWallet/';
import GetBalance from '../components/GetBalance';
import HeadComponent from '../components/Head';
import ImportWallet from '../components/ImportWallet';
import Transfer from '../components/Transfer';

const NETWORK = 'devnet';

export default function Home() {
  const [network, setNetwork] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    // Connectionインスタンスを生成する際に使用する、接続先のURLを取得します。
    // 現在の実装では、'devnet'のみをサポートしています。
    if (NETWORK === 'devnet') {
      const network = clusterApiUrl(NETWORK);
      setNetwork(network);
    } else {
      console.error(`Invalid network: ${NETWORK}. Use 'devnet'.`);
    }
  }, []);

  const refreshBalance = async () => {
    try {
      // Connectionインスタンスを生成します。
      const connection = new Connection(network, 'confirmed');

      let balance = await connection.getBalance(account.publicKey);
      // 残高がlamportで返ってくるため、SOLに変換します。
      // 100,000,000lamport = 1SOL
      balance = balance / LAMPORTS_PER_SOL;

      setBalance(balance);
    } catch (error) {
      console.error(error);
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
                {account.publicKey.toString()}
              </div>
              <div className="my-6 font-bold">ネットワーク: {network}</div>
              {typeof balance === 'number' && (
                <div className="my-6 font-bold">💰 残高: {balance} SOL</div>
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
