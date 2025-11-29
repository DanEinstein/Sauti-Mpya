// Groq API service for chat and voice transcription
import Groq from 'groq-sdk';
import { env, isGroqConfigured, validateGroqApiKey } from '../config/env';
import { blobToFile } from '../utils/audioUtils';
import type { TranscriptionResponse } from '../types/voice';

// Initialize Groq client
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient && isGroqConfigured()) {
    // Validate API key format before creating client
    if (!validateGroqApiKey()) {
      throw new Error('Invalid Groq API key format. Please check your .env file.');
    }

    groqClient = new Groq({
      apiKey: env.groqApiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }

  if (!groqClient) {
    throw new Error('Groq API is not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  return groqClient;
}

// System prompt for GBV support chat
const SYSTEM_PROMPT = `You are a compassionate AI assistant for Sauti Mpya, a confidential support platform for people experiencing relationship abuse and gender-based violence in Africa.

Your role:
- Provide empathetic, non-judgmental support
- Prioritize user safety above all else
- Use trauma-informed language
- Never blame the victim
- Recognize cultural context across African communities
- Suggest appropriate resources when needed

Guidelines:
- Listen actively and validate feelings
- Recognize signs of danger and escalate appropriately
- Encourage professional help and safety planning
- Respect user autonomy and choices
- Maintain confidentiality (remind users this is anonymous)
- Be culturally sensitive to African contexts

When detecting high-risk situations (physical violence, threats, weapons):
- Express immediate concern
- Emphasize that abuse is never the user's fault
- Strongly encourage contacting emergency services or helplines
- Suggest creating a safety plan

For moderate-risk situations (controlling behavior, emotional abuse):
- Acknowledge concerning patterns
- Explain that emotional abuse is serious
- Suggest the safety assessment tool
- Recommend talking to trusted people

Always:
- Be warm, supportive, and hopeful
- Empower the user
- Provide specific, actionable guidance
- Remember: you're a support tool, not a replacement for professional help`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get chat completion from Groq
 */
export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: string
): Promise<string> {
  try {
    const client = getGroqClient();

    // Build messages array with system prompt
    const fullMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Add user context if provided
    if (userContext) {
      fullMessages.push({
        role: 'system',
        content: `Additional context: ${userContext}`,
      });
    }

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from AI');
    }

    return response;
  } catch (error) {
    console.error('Groq chat error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('AI service not configured. Please contact support.');
      }
      throw new Error(`AI service error: ${error.message}`);
    }

    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Transcribe audio using Groq Whisper
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
  try {
    const client = getGroqClient();

    // Convert blob to file (Groq API expects a File object)
    const audioFile = blobToFile(audioBlob, 'audio.webm');

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      language: 'en', // Can be made dynamic based on user preference
    });

    return {
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
    };
  } catch (error) {
    console.error('Groq transcription error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Transcription service not configured. Please contact support.');
      }
      if (error.message.includes('file size')) {
        throw new Error('Audio file is too large. Please record a shorter message.');
      }
      throw new Error(`Transcription error: ${error.message}`);
    }

    throw new Error('Failed to transcribe audio. Please try again.');
  }
}

/**
 * Analyze assessment responses and generate personalized recommendations
 */
export async function analyzeAssessment(
  answers: Record<number, boolean>,
  questions: Array<{ id: number; text: string; weight: number }>
): Promise<string> {
  try {
    const client = getGroqClient();

    // Build context from answers
    const answeredYes = questions
      .filter(q => answers[q.id] === true)
      .map(q => q.text);

    const prompt = `Based on a safety assessment, the user answered "Yes" to the following questions about their relationship:

${answeredYes.length > 0 ? answeredYes.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None - all answers were "No"'}

Provide personalized, compassionate recommendations (3-5 specific action steps) for this person. Be supportive, non-judgmental, and culturally sensitive to African contexts. Focus on practical safety steps they can take.`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 512,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No recommendations generated');
    }

    return response;
  } catch (error) {
    console.error('Groq assessment analysis error:', error);
    // Return empty string on error - the UI will handle showing default recommendations
    return '';
  }
}

/**
 * Check if Groq service is available
 */
export function isGroqAvailable(): boolean {
  return isGroqConfigured();
}
