import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Send, X } from 'lucide-react';
import {
  requestMicrophonePermission,
  getSupportedMimeType,
  formatDuration,
  isAudioRecordingSupported
} from '../utils/audioUtils';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onSendVoice, onCancel, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!isAudioRecordingSupported()) {
      setError('Audio recording is not supported in your browser.');
      return;
    }

    try {
      setError(null);
      const stream = await requestMicrophonePermission();
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        setIsPaused(true);
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoice(audioBlob);
      // Cleanup
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    }
  };

  const handleCancel = () => {
    stopRecording();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    onCancel();
  };

  // If not recording and no audio recorded yet, show start button
  if (!isRecording && !audioUrl) {
    return (
      <div className="flex flex-col gap-2">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex-1 bg-[#2B9EB3] hover:bg-[#1E6A8C] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Mic size={20} />
            Start Recording
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  // If recording, show recording controls
  if (isRecording) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-semibold text-gray-800">
                {isPaused ? 'Paused' : 'Recording...'}
              </span>
            </div>
            <span className="text-2xl font-mono font-bold text-gray-800">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Waveform visualization placeholder */}
          <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-red-500 rounded-full ${!isPaused ? 'animate-pulse' : ''}`}
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={pauseRecording}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={stopRecording}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Square size={20} />
            Stop
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {duration >= 300 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
            Maximum recording length (5 minutes) reached. Please stop recording.
          </div>
        )}
      </div>
    );
  }

  // If audio recorded, show playback and send controls
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">Recording ready</span>
          <span className="text-lg font-mono font-bold text-gray-800">
            {formatDuration(duration)}
          </span>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        <button
          onClick={playAudio}
          className="w-full bg-white hover:bg-gray-50 border-2 border-blue-300 text-gray-800 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause Preview' : 'Play Preview'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSend}
          disabled={disabled}
          className="flex-1 bg-[#2B9EB3] hover:bg-[#1E6A8C] text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
          Send Voice Message
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
