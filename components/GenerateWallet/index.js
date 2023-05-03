import * as Bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { useState } from 'react';

export default function GenerateWallet({ setAccount }) {
  const [mnemonic, setMnemonic] = useState(null);

  /**
   * ニーモニックフレーズとアカウントの生成を行う関数。
   */
  const generateWallet = () => {
    // ニーモニックフレーズの生成。
    const generatedMnemonic = Bip39.generateMnemonic();
    setMnemonic(generatedMnemonic);
    console.log('generatedMnemonic:', generatedMnemonic);

    const seed = Bip39.mnemonicToSeedSync(generatedMnemonic).slice(0, 32);
    console.log('seed:', seed);

    const newAccount = Keypair.fromSeed(new Uint8Array(seed));
    // console.log('newAccount:', newAccount.publicKey.toString());

    setAccount(newAccount);
  };

  return (
    <>
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
            data-testid="mnemonic-display" // TODO: `dta-testid`不要になったら削除
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
    </>
  );
}
