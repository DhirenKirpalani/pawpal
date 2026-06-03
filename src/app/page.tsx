import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            🐾 PawPal
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            AI Pet Health Assistant
          </p>
          <p className="text-lg text-gray-500">
            Get instant, reliable pet health advice in English or Indonesian
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ✨ Features
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">🤖</span>
                <span>AI-powered health advice</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🌏</span>
                <span>Bilingual (English & Indonesian)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚡</span>
                <span>Instant responses</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🏥</span>
                <span>Vet recommendations when needed</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">�</span>
                <span>Safe & responsible advice</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🚀 Get Started
            </h2>
            <div className="space-y-4">
              <Link
                href="/onboard"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
              >
                1. Register Your Pet
              </Link>
              <Link
                href="/chat"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
              >
                2. Start Chatting
              </Link>
            </div>
          </div>
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
