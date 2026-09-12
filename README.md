# Clean English

A web app that uses AI to rewrite messy English into clear, natural language.

## Features

- 🤖 AI-powered text cleaning using OpenAI
- 📝 Simple, clean interface
- 📋 Copy button to copy cleaned text
- 🧹 Clear button to reset both inputs
- 🔒 Secure API key handling (never exposed in browser)

## Setup

### 1. Get OpenAI API Key

- Go to https://platform.openai.com/api-keys
- Sign up or log in
- Create a new API key
- Add billing ($5-20 to start)

### 2. Create Vercel Account

- Go to https://vercel.com
- Sign up with GitHub

### 3. Deploy to Vercel

1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Click "Deploy"
5. Go to project Settings → Environment Variables
6. Add: `OPENAI_API_KEY` = your OpenAI API key
7. Redeploy

### 4. Test

- Open your Vercel URL
- Type messy text
- Click "Clean English"
- See cleaned text appear

## How It Works

1. User enters text in browser
2. Frontend sends to `/api/clean` endpoint
3. Vercel serverless function receives request
4. Function calls OpenAI API securely (API key on server only)
5. Cleaned text returned to browser
6. User sees result and can copy it

## Security

✅ API key never exposed to browser
✅ API key stored in Vercel environment variables
✅ All requests go through your own backend
✅ No API key in code or HTML

## Local Testing

```bash
npm install -g vercel
vercel login
vercel dev
```

Then open http://localhost:3000

## Cost

- Vercel: Free tier
- OpenAI: ~$1-2 per month for light usage
