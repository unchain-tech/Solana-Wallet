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
    // setLoading(true);
    e.preventDefault();

    try {
      console.log('送金中...');
      setTransactionSig('');

      const connection = new Connection(network, 'confirmed');
      const params = {
        fromPubkey: account.publicKey,
        lamports: 0.5 * LAMPORTS_PER_SOL,
        toPubkey: toAddress,
      };

      // console.log('Transfer params:', params);

      const transaction = new Transaction();

      transaction.add(SystemProgram.transfer(params));

      console.log('===5.');

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
      // console.log('confirmation', confirmation);

      setTransactionSig(confirmation);

      await refreshBalance();

      console.log('送金が完了しました!!!');
    } catch (error) {
      console.log('ERROR!', error);
      // } finally {
      //   setLoading(false);
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
          {/* {loading === true ? (
            <div data-testid="loading-transfer">処理中...</div>
          ) : ( */}
          <input
            type="submit"
            className="p-2 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
            value="送金"
          />
          {/* )} */}
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
