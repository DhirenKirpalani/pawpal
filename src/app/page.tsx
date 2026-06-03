import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-7xl">🐾</span>
          </div>
          <h1 className="text-7xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-6 leading-tight">
            PawPal
          </h1>
          <p className="text-3xl font-semibold text-gray-700 mb-4">
            AI Pet Health Assistant
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant, reliable pet health advice powered by AI
            <br />
            <span className="text-lg text-purple-600 font-medium">Available in English & Indonesian</span>
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Advanced AI analyzes symptoms and provides personalized advice</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">🌏</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bilingual</h3>
              <p className="text-gray-600">Seamlessly switch between English and Indonesian</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Instant</h3>
              <p className="text-gray-600">Get immediate responses to your pet health questions</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/onboard"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <span className="relative z-10">Register Your Pet</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/profile"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-purple-600 bg-white border-2 border-purple-600 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <span className="relative z-10">View Profile</span>
              <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/chat"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-violet-600 bg-white border-2 border-violet-600 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <span className="relative z-10">Start Chatting</span>
              <div className="absolute inset-0 bg-violet-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            💡 Tip: Register your pet first for personalized advice!
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            How It Works
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <span className="bg-indigo-100 text-indigo-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Register Your Pet</h3>
                <p>Tell us about your pet - name, species, breed, age, and weight</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-indigo-100 text-indigo-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Ask Questions</h3>
                <p>Describe symptoms, ask about food, behavior, or general care</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-indigo-100 text-indigo-600 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Get AI Advice</h3>
                <p>Receive instant, personalized health guidance for your pet</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            ⚠️ PawPal provides guidance only. Always consult a veterinarian for serious concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
