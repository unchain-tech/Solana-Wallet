import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Airdrop({ account, network, refreshBalance }) {
  console.log(`in Airdrop ${network}`);
  const handleAirdrop = async () => {
    // setLoading(true);
    try {
      console.log(`in Airdrop ${network}`);
      const connection = new Connection(network, 'confirmed');
      console.log('=== 1.');
      const publicKey = account.publicKey;
      // console.log(`publicKey: ${publicKey}`);

      console.log(`=== 2. `);
      // await new Promise(r => setTimeout(r, 3000));
      const signature = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL,
      );
      // console.log(`signature: ${signature}`);
      console.log('=== 3.');

      const latestBlockHash = await connection.getLatestBlockhash();

      console.log(`latestBlockHash ${latestBlockHash}`);

      // 確認署名とコミットメントを受け取り、トランザクションがネットワークによって確認されると解決するプロミスを返す。

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        },
        'confirmed',
      );

      console.log('=== 4.');
      // アカウントの残高を更新する。
      await refreshBalance();
    } catch (error) {
      console.log('error', error);
      // } finally {
      //   setLoading(false);
    }
  };
  return (
    // (loading === true ? (
    //   <div data-testid="loading-airdrop">処理中...</div>
    // ) : (
    <button
      className="p-2 my-6 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
      onClick={handleAirdrop}
    >
      Airdrop
    </button>
    // ))
  );
}
