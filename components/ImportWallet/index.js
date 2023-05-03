import * as Bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { useState } from 'react';

export default function ImportWallet({ setAccount }) {
  const [recoveryPhrase, setRecoveryPhrase] = useState(null);

  const handleImport = (e) => {
    e.preventDefault();

    // ニーモニックフレーズを使用して、シードを生成します。
    const seed = Bip39.mnemonicToSeedSync(recoveryPhrase).slice(0, 32);
    // シードを使用して、アカウントを生成します。
    const importedAccount = Keypair.fromSeed(new Uint8Array(seed));

    setAccount(importedAccount);
  };

  return (
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
  );
}
