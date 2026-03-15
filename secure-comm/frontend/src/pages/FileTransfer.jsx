export default function FileTransfer() {
  return (
    <div className="panel p-4 space-y-3">
      <h2 className="text-xl font-semibold">Secure File Transfer</h2>
      <p className="text-sm text-slate-400">File -> AES encrypt -> SHA-256 hash -> blockchain proof -> secure download</p>
      <input type="file" className="input" />
      <button className="btn">Process Secure Transfer</button>
    </div>
  );
}
