// Environment configuration with validation and security checks

/**
 * Environment variable configuration interface
 * Add new environment variables here as the app grows
 */
interface EnvConfig {
  groqApiKey: string;
  // Add future environment variables here
  // supabaseUrl?: string;
  // supabaseAnonKey?: string;
  debugMode?: boolean;
}

/**
 * Safely get environment variable with validation
 * @param key - Environment variable key
 * @param required - Whether the variable is required (default: false)
 * @returns The environment variable value or empty string
 */
function getEnvVar(key: string, required: boolean = false): string {
  const value = import.meta.env[key];

  if (!value || value === '') {
    if (required) {
      console.error(`❌ Required environment variable missing: ${key}`);
      console.error(`Please add ${key} to your .env file`);
    } else {
      console.warn(`⚠️ Optional environment variable not set: ${key}`);
    }
    return '';
  }

  // Security check: Don't allow placeholder values
  const placeholders = ['your_', 'placeholder', 'example', 'test_key'];
  if (placeholders.some(placeholder => value.toLowerCase().includes(placeholder))) {
    console.warn(`⚠️ ${key} appears to contain a placeholder value. Please update with actual value.`);
    return '';
  }

  return value;
}

/**
 * Centralized environment configuration
 * All environment variables should be accessed through this object
 */
export const env: EnvConfig = {
  // Groq AI API Key - Optional but recommended for full features
  groqApiKey: getEnvVar('VITE_GROQ_API_KEY', false),

  // Debug mode - Optional, for development only
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',

  // Add future environment variables here
  // supabaseUrl: getEnvVar('VITE_SUPABASE_URL', false),
  // supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', false),
};

/**
 * Check if Groq AI is properly configured
 * @returns true if Groq API key is set and valid
 */
export function isGroqConfigured(): boolean {
  return !!env.groqApiKey && env.groqApiKey.length > 0;
}

/**
 * Validate Groq API key format
 * @returns true if the API key appears to be in the correct format
 */
export function validateGroqApiKey(): boolean {
  if (!env.groqApiKey) return false;

  // Groq API keys should start with "gsk_"
  if (!env.groqApiKey.startsWith('gsk_')) {
    console.error('❌ Invalid Groq API key format. Key should start with "gsk_"');
    return false;
  }

  return true;
}

/**
 * Get environment name (development, production, etc.)
 */
export function getEnvironment(): string {
  return import.meta.env.MODE || 'development';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

// Log configuration status on load (only in development)
if (isDevelopment() && env.debugMode) {
  console.log('🔧 Environment Configuration:');
  console.log(`  Mode: ${getEnvironment()}`);
  console.log(`  Groq AI: ${isGroqConfigured() ? '✅ Configured' : '❌ Not configured'}`);
  if (isGroqConfigured()) {
    console.log(`  Groq Key Valid: ${validateGroqApiKey() ? '✅ Yes' : '❌ No'}`);
  }
}
