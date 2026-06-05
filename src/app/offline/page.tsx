export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-7xl mb-6">🐾</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">You're offline</h1>
        <p className="text-gray-500 mb-8">
          No worries — your chat history is saved.<br />
          Come back when you're connected.
        </p>
        <a
          href="/chat"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-full shadow-lg"
        >
          💬 Try again
        </a>
      </div>
    </div>
  );
}
