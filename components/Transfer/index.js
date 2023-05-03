import {
  Connection,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useState } from 'react';

export default function TransferFunction({ account, network, refreshBalance }) {
  const [transactionSig, setTransactionSig] = useState('');
  const [toAddress, setToAddress] = useState(null);

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      setTransactionSig('');

      const connection = new Connection(network, 'confirmed');
      const params = {
        fromPubkey: account.publicKey,
        lamports: 0.5 * LAMPORTS_PER_SOL,
        toPubkey: toAddress,
      };
      const signers = [
        {
          publicKey: account.publicKey,
          secretKey: account.secretKey,
        },
      ];

      // Transactionインスタンスを生成し、`transfer`の指示を追加します。
      const transaction = new Transaction();
      transaction.add(SystemProgram.transfer(params));
      // トランザクションに署名を行い、送信します。
      const transactionSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        signers,
      );

      setTransactionSig(transactionSignature);

      // アカウントの残高を更新します。
      await refreshBalance();
    } catch (error) {
      console.log('ERROR!', error);
    }
  };

  return (
    <>
      <form onSubmit={handleTransfer} className="my-6">
        <div className="flex items-center border-b border-indigo-500 py-2">
          <input
            type="text"
            className="w-full text-gray-700 mr-3 p-1 focus:outline-none"
            placeholder="送金先のウォレットアドレス"
            onChange={(e) => setToAddress(e.target.value)}
          />
          <input
            type="submit"
            className="p-2 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
            value="送金"
          />
        </div>
      </form>
      {transactionSig && (
        <>
          <span className="text-red-600">送金が完了しました!</span>
          <a
            href={`https://explorer.solana.com/tx/${transactionSig}?cluster=${network}`}
            className="border-double border-b-4 border-b-indigo-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Solana Block Explorer でトランザクションを確認する
          </a>
        </>
      )}
    </>
  );
}
