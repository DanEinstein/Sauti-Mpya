// Voice message and audio recording types

export interface VoiceMessage {
  id: string;
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  transcription?: string;
  timestamp: Date;
}

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  voiceMessage?: VoiceMessage;
  timestamp?: Date;
}

export interface GroqChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
