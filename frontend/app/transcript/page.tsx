"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptResponse {
  success: boolean;
  video_id: string;
  language: string;
  transcript: TranscriptItem[];
}

export default function TranscriptPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('url');
  
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [videoId, setVideoId] = useState('');
  const [language, setLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportFormat, setExportFormat] = useState('txt');

  useEffect(() => {
    if (!videoUrl) {
      setError('Nie podano URL filmu');
      setIsLoading(false);
      return;
    }

    const fetchTranscript = async () => {
      try {
        const response = await fetch('/api/transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_url: videoUrl,
            language: 'pl',
          }),
        });

        if (!response.ok) {
          throw new Error('Nie udało się pobrać napisów');
        }

        const data: TranscriptResponse = await response.json();
        
        if (!data.success) {
          throw new Error('Nie udało się pobrać napisów');
        }

        setTranscript(data.transcript);
        setVideoId(data.video_id);
        setLanguage(data.language);
      } catch (err: any) {
        setError(err.message || 'Wystąpił błąd podczas pobierania napisów');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscript();
  }, [videoUrl]);

  // Funkcja formatująca czas (sekundy) na format MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Funkcja eksportująca napisy do wybranego formatu
  const exportTranscript = () => {
    if (!transcript.length) return;

    let content = '';
    let fileName = `transcript_${videoId}.${exportFormat}`;

    switch (exportFormat) {
      case 'txt':
        content = transcript.map(item => `${formatTime(item.start)} - ${item.text}`).join('\n\n');
        break;
      case 'srt':
        content = transcript.map((item, index) => {
          const startTime = formatSrtTime(item.start);
          const endTime = formatSrtTime(item.start + item.duration);
          return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
        }).join('\n');
        break;
      default:
        content = transcript.map(item => item.text).join('\n\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funkcja formatująca czas dla formatu SRT (HH:MM:SS,mmm)
  const formatSrtTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Pobieranie napisów...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white">
        <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden p-8">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Błąd</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              FastCaption
            </h1>
            <p className="text-gray-400">Transkrypcja filmu YouTube</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <Link href="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-center">
              Nowy film
            </Link>
            
            <div className="flex">
              <select 
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-l-lg focus:outline-none"
              >
                <option value="txt">TXT</option>
                <option value="srt">SRT</option>
              </select>
              <button 
                onClick={exportTranscript}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Eksportuj
              </button>
            </div>
          </div>
        </div>

        {videoId && (
          <div className="mb-6">
            <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              ></iframe>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-xl p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transkrypcja</h2>
            <span className="text-sm px-3 py-1 bg-gray-700 rounded-full">
              Język: {language || 'nieznany'}
            </span>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 transcript-container">
            {transcript.length > 0 ? (
              transcript.map((item, index) => (
                <div key={index} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400 text-sm">
                      {formatTime(item.start)}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {item.duration.toFixed(1)}s
                    </span>
                  </div>
                  <p className="mt-1 text-white">{item.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">Brak napisów do wyświetlenia</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 