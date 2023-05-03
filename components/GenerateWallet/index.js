import * as bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { useState } from 'react';

export default function GenerateWallet({ setAccount }) {
  const [mnemonic, setMnemonic] = useState(null);

  const generateWallet = () => {
    const generatedMnemonic = bip39.generateMnemonic();
    // ニーモニックフレーズを使用して、シードを生成します。
    const seed = bip39.mnemonicToSeedSync(generatedMnemonic).slice(0, 32);
    // シードを使用して、アカウントを生成します。
    const newAccount = Keypair.fromSeed(new Uint8Array(seed));

    setMnemonic(generatedMnemonic);
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
          <div className="mt-1 p-4 border border-gray-300 bg-gray-200">
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
