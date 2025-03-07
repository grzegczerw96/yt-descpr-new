"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Walidacja URL
      if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
        throw new Error('Wprowadź poprawny link do filmu na YouTube');
      }

      // Przekierowujemy do strony z napisami, przekazując URL jako parametr zapytania
      router.push(`/transcript?url=${encodeURIComponent(videoUrl)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            FastCaption
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Pobierz napisy z filmów YouTube szybko i wygodnie
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Wklej link do filmu YouTube..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ładowanie...
                </span>
              ) : (
                'Pobierz napisy'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Funkcje: Pobieranie napisów w wielu językach, eksport do różnych formatów, analiza tekstu
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>FastCaption &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
