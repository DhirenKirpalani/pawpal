export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6287809998198';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="relative container mx-auto px-4 py-16">
        {/* HERO SECTION */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block mb-6">
            <span className="text-7xl">🐾</span>
          </div>
          <h1 className="text-7xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-6 leading-tight">
            PawPal.ID
          </h1>
          <p className="text-3xl font-semibold text-gray-800 mb-4">
            AI Pet Health Assistant
          </p>
          <p className="text-xl text-gray-600 mb-6">
            Get instant guidance for your pet's health, behavior, and nutrition — in WhatsApp.
          </p>
          <p className="text-lg text-purple-600 font-medium mb-10">
            🌏 English & Indonesian
          </p>

          {/* PRIMARY CTA */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="text-2xl">💬</span>
              Chat with PawPal on WhatsApp
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </a>
        </div>

        {/* TRUST LAYER */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-sm font-semibold text-gray-700">AI-powered guidance</p>
              <p className="text-xs text-gray-500 mt-1">(not a replacement for vets)</p>
            </div>
            <div className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm font-semibold text-gray-700">Instant responses</p>
              <p className="text-xs text-gray-500 mt-1">in seconds</p>
            </div>
            <div className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🧠</div>
              <p className="text-sm font-semibold text-gray-700">Built for common</p>
              <p className="text-xs text-gray-500 mt-1">pet health concerns</p>
            </div>
            <div className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-sm font-semibold text-gray-700">Always recommends</p>
              <p className="text-xs text-gray-500 mt-1">vet care when needed</p>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE FEATURES */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Everything Your Pet Needs
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Personalized care, smart reminders, and health tracking — all in WhatsApp
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Health Advice */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Health Advice</h3>
              <p className="text-gray-600 text-sm">Ask about symptoms, food safety, behavior issues, and get instant expert guidance</p>
            </div>

            {/* Smart Reminders */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Reminders</h3>
              <p className="text-gray-600 text-sm">Never miss vaccines, deworming, vet appointments, or medication schedules</p>
            </div>

            {/* Feeding Tracker */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="text-4xl mb-3">🍖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Feeding Tracker</h3>
              <p className="text-gray-600 text-sm">Personalized meal plans, portion sizes, and supplement schedules based on age & breed</p>
            </div>

            {/* Potty Training */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="text-4xl mb-3">🚽</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Potty Training</h3>
              <p className="text-gray-600 text-sm">Track bathroom habits, success rates, and get reminders to help with training</p>
            </div>

            {/* Health Notes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Health Journal</h3>
              <p className="text-gray-600 text-sm">Log symptoms, incidents, unusual behavior — share with your vet when needed</p>
            </div>

            {/* Lost Pet Alert */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Lost Pet Alert</h3>
              <p className="text-gray-600 text-sm">Instant notifications and tracking if your pet goes missing</p>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="max-w-3xl mx-auto mb-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-lg shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Message PawPal</h3>
                <p className="text-gray-600">Open WhatsApp and say what's happening</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-lg shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Get instant guidance</h3>
                <p className="text-gray-600">AI analyzes symptoms and responds clearly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-lg shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Know what to do next</h3>
                <p className="text-gray-600">Monitor, treat at home, or visit vet</p>
              </div>
            </div>
          </div>
        </div>

        {/* EXAMPLES - CRITICAL FOR CONVERSION */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Ask PawPal Anything
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="backdrop-blur-lg bg-white/60 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-purple-300">
              <p className="text-gray-700 font-medium">"My dog is vomiting, what should I do?"</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-purple-300">
              <p className="text-gray-700 font-medium">"Can cats eat tuna?"</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-purple-300">
              <p className="text-gray-700 font-medium">"My puppy is not eating today"</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-purple-300">
              <p className="text-gray-700 font-medium">"Is this rash serious?"</p>
            </div>
          </div>
        </div>

        {/* WHY PAWPAL IS DIFFERENT */}
        <div className="max-w-3xl mx-auto mb-16 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-xl p-8 border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🧠 Why PawPal is different
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Most users currently:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Google symptoms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Ask random forums</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Get conflicting advice</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">PawPal:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Gives structured, calm, and safe guidance in seconds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="text-center mb-12">
          <p className="text-2xl font-semibold text-gray-800 mb-6">
            🐾 Start chatting with PawPal now
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="text-2xl">💬</span>
              Open WhatsApp
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </a>
        </div>

        {/* DISCLAIMER */}
        <div className="text-center text-gray-500 max-w-2xl mx-auto">
          <p className="text-sm">
            ⚠️ PawPal provides AI-powered guidance for common pet health concerns. This is not a replacement for professional veterinary care. Always consult a veterinarian for serious health issues or emergencies.
          </p>
        </div>
      </div>
    </div>
  );
}
