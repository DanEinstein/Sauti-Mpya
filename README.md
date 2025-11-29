# Sauti Mpya (New Voice)

**A confidential, mobile-first, pan-African web application for relationship abuse support**

Sauti Mpya provides instant help for anyone experiencing relationship concerns or abuse - completely anonymous, no login required, no data stored.

## 🌍 Features

- **6 Core Pages**
  - Landing page with warm African design
  - Real-time compassionate AI chatbot
  - 8-question safety assessment with instant risk scoring
  - Interactive safety plan builder with PDF download
  - Pan-African emergency helplines (Kenya, Nigeria, South Africa, Ghana, Uganda, and more)
  - Privacy & trust information page

- **Critical Safety Features**
  - QUICK EXIT button on every page (clears history, redirects to Google)
  - Emergency helpline bar always visible
  - Zero cookies, zero localStorage persistence, zero tracking
  - 100% anonymous - no login or registration

- **Pan-African Design**
  - Trust teal (#2B9EB3), Compassion blue (#1E6A8C), Warm earth orange (#FF6B35)
  - Risk colors: Green (low), Amber (medium), Red (high)
  - Subtle African pattern overlay
  - Google Fonts: Nunito Sans (headings) + Open Sans (body)
  - Mobile-first, responsive design

## 📁 Project Structure

```
Sauti-v2/
├── src/
│   ├── components/
│   │   ├── EmergencyBar.tsx      # Emergency helpline display
│   │   ├── Layout.tsx             # Main layout wrapper
│   │   ├── Navigation.tsx         # Navigation menu
│   │   └── QuickExit.tsx          # Quick exit button
│   ├── pages/
│   │   ├── Home.tsx               # Landing page
│   │   ├── Chat.tsx               # AI chatbot interface
│   │   ├── Assessment.tsx         # Safety assessment
│   │   ├── SafetyPlan.tsx         # Safety plan builder
│   │   ├── Resources.tsx          # Emergency helplines
│   │   └── About.tsx              # Privacy & trust info
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite configuration
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Sauti-v2.git
cd Sauti-v2

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory
cp .env.example .env

# Add your Groq API key to .env
# Get a free API key from https://console.groq.com
# VITE_GROQ_API_KEY=your_actual_api_key_here

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Getting a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file as `VITE_GROQ_API_KEY=your_key_here`

**Note**: The app works without an API key but with limited AI features. Voice recording and rule-based chat responses will still work.

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npm run typecheck
```

## 📋 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **AI Integration**: Groq AI (Llama 3.3 + Whisper)
- **Audio**: Web Audio API (MediaRecorder)
- **Build Tool**: Vite
- **Hosting**: Vercel (recommended)

## 🎙️ Voice Message Features

- **Voice Recording**: Record voice messages directly in the chat
- **Audio Transcription**: Automatic speech-to-text using Groq Whisper
- **Playback Preview**: Listen to your recording before sending
- **Visual Feedback**: Real-time recording indicators and waveform animation
- **Browser Support**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## 🤖 AI-Powered Features

- **Intelligent Chat**: Context-aware responses using Groq's Llama 3.3 model
- **Voice Transcription**: Fast, accurate transcription with Whisper Large V3 Turbo
- **Personalized Assessment**: AI-generated recommendations based on safety assessment
- **Trauma-Informed**: Specially crafted prompts for GBV support context
- **Fallback Support**: Works with or without API key (limited features without key)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Sauti-v2)

#### Manual Deployment Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sauti Mpya life-saving application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Sauti-v2.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (Vite preset is auto-detected)
   - Click "Deploy"

Your application will be live in under 2 minutes!

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

## 🔒 Privacy & Security

- **No authentication** - fully anonymous access
- **No database** - zero data persistence (client-side only)
- **No tracking** - no cookies, no analytics, no localStorage
- **QUICK EXIT** - instant browser history clearing
- **Client-side only** - all processing happens in the browser
- **Open source** - transparent and auditable code

## 🌍 Supported Countries

Emergency helplines available for:
- **Kenya**: 1195
- **Nigeria**: 0800 033 3333
- **South Africa**: 0800 428 428
- **Ghana**: 0800 800 800
- **Uganda**: 0800 200 600
- **Rwanda**: 3512
- **Tanzania**: 116
- **Zambia**: 933
- **Zimbabwe**: 0712 763 772

## 🎯 Assessment Features

The 8-question safety assessment evaluates:
1. Physical violence
2. Threats
3. Fear and intimidation
4. Controlling behavior
5. Verbal/emotional abuse
6. Financial control
7. Sexual coercion
8. Isolation

Results categorized as:
- **High Risk** (score ≥10): Immediate safety concerns
- **Moderate Risk** (score 5-9): Warning signs present
- **Low Risk** (score <5): No major indicators

## 💬 AI Chatbot

The compassionate AI chatbot:
- Detects risk levels from user messages
- Provides empathetic, non-judgmental responses
- Offers guidance based on concern severity
- Suggests relevant resources (assessment, safety plan, helplines)
- Never stores conversations

## 📄 Safety Plan

Interactive safety plan includes:
- Safe people to contact
- Safe places to go
- Important documents to take
- Essential items to pack
- Warning signs to leave immediately
- Emergency code word
- One-click PDF download

## 🤝 Contributing

This is a life-saving tool. Contributions welcome:
- Additional country helplines
- Translation support (future)
- Accessibility improvements
- Security enhancements
- Bug fixes and optimizations

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Important Notice

**Sauti Mpya is NOT a crisis service.**

If you are in immediate danger:
- Call emergency services (police, ambulance)
- Contact local helplines listed on the Resources page

## 📝 License

MIT License - Use freely to save lives

## 👥 Authors

Built with urgency and compassion to serve survivors across Africa.

---

**"New Voice. New Beginning."**

*Your safety matters. Your voice matters. You are not alone.*
