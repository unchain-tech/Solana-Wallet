import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Airdrop({ account, network, refreshBalance }) {
  const handleAirdrop = async () => {
    try {
      const connection = new Connection(network, 'confirmed');
      const publicKey = account.publicKey;
      const signature = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL,
      );

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection
        .confirmTransaction(
          {
            signature,
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          },
          'confirmed',
        )
        .then((response) => {
          const signatureResult = response.value;
          if (signatureResult.err) {
            console.error('Transaction failed: ', signatureResult.err);
          }
        });

      // アカウントの残高を更新します。
      await refreshBalance();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <button
      className="p-2 my-6 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
      onClick={handleAirdrop}
    >
      Airdrop
    </button>
  );
}
