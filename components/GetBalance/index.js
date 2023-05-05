export default function GetBalance({ refreshBalance }) {
  return (
    <button
      className="p-2 my-6 text-white bg-indigo-500 focus:ring focus:ring-indigo-300 rounded-lg cursor-pointer"
      onClick={refreshBalance}
    >
      残高を取得
    </button>
  );
}
