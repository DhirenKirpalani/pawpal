'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Pet {
  name: string;
  species: string;
  breed?: string;
  age_years: number;
  weight_kg: number;
}

export default function ProfilePage() {
  const [phone, setPhone] = useState('');
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPet = async () => {
    if (!phone) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/profile?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pet');
      }
      
      setPet(data.pet);
    } catch (err: any) {
      setError(err.message);
      setPet(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-violet-600 hover:text-violet-700 mb-6"
        >
          ← Back to Home
        </Link>

        <div className="backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-6">
            🐾 Pet Profile
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+6281234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button
                onClick={fetchPet}
                disabled={loading || !phone}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
              >
                {loading ? 'Loading...' : 'View'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {pet && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {pet.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p className="text-sm text-gray-500">Species</p>
                    <p className="font-semibold capitalize">{pet.species}</p>
                  </div>
                  {pet.breed && (
                    <div>
                      <p className="text-sm text-gray-500">Breed</p>
                      <p className="font-semibold">{pet.breed}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold">{pet.age_years} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-semibold">{pet.weight_kg} kg</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/chat?phone=${encodeURIComponent(phone)}`}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
                >
                  Chat with PawPal
                </Link>
                <Link
                  href={`/onboard?phone=${encodeURIComponent(phone)}`}
                  className="flex-1 bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold py-3 px-6 rounded-lg text-center transition"
                >
                  Update Info
                </Link>
              </div>
            </div>
          )}

          {!pet && !error && !loading && (
            <div className="text-center text-gray-500 py-8">
              <p>Enter your phone number to view your pet's profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
