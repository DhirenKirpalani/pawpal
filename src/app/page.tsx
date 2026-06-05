export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6287809998198';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="relative container mx-auto px-4 py-20">
        {/* HERO SECTION */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-block mb-8">
            <span className="text-8xl">🐾</span>
          </div>
          <h1 className="text-8xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-8 leading-tight">
            PawPal
          </h1>
          <p className="text-4xl font-bold text-gray-800 mb-6">
            Like texting a friend who knows your pet
          </p>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            🌏 English & Indonesian
          </p>

          {/* PRIMARY CTA */}
          <div className="flex flex-col gap-6 items-center">
            <a
              href="/chat"
              className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-3xl">💬</span>
                Start Chatting
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
            <p className="text-base text-gray-500">
              No signup • Just start talking
            </p>
          </div>
        </div>

        {/* EMOTIONAL BENEFITS */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="backdrop-blur-lg bg-white/80 border border-white/40 rounded-3xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">💜</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">Understands you</p>
              <p className="text-gray-600">Knows when you're worried</p>
            </div>
            <div className="backdrop-blur-lg bg-white/80 border border-white/40 rounded-3xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🧠</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">Remembers</p>
              <p className="text-gray-600">Builds a relationship</p>
            </div>
            <div className="backdrop-blur-lg bg-white/80 border border-white/40 rounded-3xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">Celebrates</p>
              <p className="text-gray-600">Your pet's progress</p>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-3">Everything Your Pet Needs</h2>
          <p className="text-center text-gray-500 mb-12">One companion. Every concern.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Health Advice', desc: 'Symptoms, food safety, behavior — instant guidance' },
              { icon: '⏰', title: 'Smart Reminders', desc: 'Vaccines, deworming, vet appointments — never miss one' },
              { icon: '🍖', title: 'Feeding Tracker', desc: 'Meal plans and portions based on age & breed' },
              { icon: '🚽', title: 'Potty Training', desc: 'Track habits and success rates' },
              { icon: '📝', title: 'Health Journal', desc: 'Log symptoms and share with your vet' },
              { icon: '🔔', title: 'Lost Pet Alert', desc: 'Instant notifications if your pet goes missing' },
            ].map((s) => (
              <div key={s.title} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all border border-purple-50">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center mb-16">
          <a
            href="/chat"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            💬 Start Chatting
          </a>
          <p className="text-sm text-gray-500 mt-4">No signup • Just start talking</p>
        </div>

        {/* FOOTER */}
        <div className="text-center mb-12">
          <p className="text-xs text-gray-400 max-w-xl mx-auto">
            PawPal provides AI guidance for common pet health concerns. Not a replacement for professional veterinary care.
          </p>
        </div>
      </div>
    </div>
  );
}
