# IdeaForge Vision - Quick Start Guide

## Prerequisites

- Node.js v16+ and npm v8+
- Firebase Project (free tier works)
- Google Gemini API key (free tier available)
- GitHub account (optional, for better rate limits)

## Step 1: Clone & Install

```bash
cd IdeaForge
npm install
```

## Step 2: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. In **Project Settings**, copy your Web API credentials
4. Edit `public/config.js` and paste your credentials:

```javascript
window.__firebase_config = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

5. **Important**: Enable Anonymous Authentication in Firebase:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Anonymous**

6. Create a Firestore database:
   - Go to **Firestore Database**
   - Start in **Production** or **Test mode**
   - Location: Any (e.g., us-central1)

## Step 3: Gemini API Configuration

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Edit `public/config.js` and add:

```javascript
window.__gemini_api_key = "YOUR_GEMINI_API_KEY";
```

## Step 4: Update Gemini Service Endpoint

Edit `src/services/geminiService.ts` line 20:

```typescript
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
```

(This assumes you'll POST with JSON body containing the prompt)

## Step 5: Run Development Server

```bash
npm run dev
```

Opens at: **http://localhost:5173/**

## Step 6: Test the Flow

1. Click **Sign In** → Anonymous login
2. Enter an idea description (e.g., "AI-powered task manager for teams")
3. Click **Forge**
4. Watch GitHub search results appear
5. Gemini AI analyzes and generates results
6. Results auto-save to Firestore
7. Export report as JSON/Markdown

## Troubleshooting

### "Cannot find module 'firebase'"
→ Run `npm install`

### "Firebase config not found"
→ Check that `window.__firebase_config` is set in `public/config.js` and loaded before React

### "Gemini API returns 403"
→ Check your API key in `public/config.js` and Gemini quota/permissions

### "GitHub rate limited"
→ The app falls back gracefully; use GitHub Personal Access Token in `githubService.ts` if needed:
```typescript
headers: { Accept: 'application/vnd.github+json', Authorization: 'token YOUR_GITHUB_TOKEN' }
```

### "Firestore document not saving"
→ Check Firebase Auth is enabled (Anonymous) and Firestore rules allow writes for authenticated users

## Project Structure

```
IdeaForge/
├── public/
│   └── config.js                 # API credentials (EDIT THIS)
├── src/
│   ├── components/               # React UI components
│   ├── hooks/                    # useAuth, useForge, useFirestore, useExport
│   ├── services/                 # Firebase, GitHub, Gemini
│   ├── types/                    # TypeScript interfaces
│   ├── styles/                   # Tailwind CSS
│   ├── pages/                    # Login, Dashboard
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.cjs
├── postcss.config.cjs
└── vite.config.ts
```

## Build & Deploy

```bash
npm run build      # Creates dist/ folder
npm run preview    # Preview production build locally
```

Deploy `dist/` to Vercel, Netlify, GitHub Pages, or your own server.

## API Endpoints Summary

| Service | Endpoint | Auth |
|---------|----------|------|
| GitHub Search | `https://api.github.com/search/repositories` | None (rate limited) |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models/...` | API Key |
| Firebase Auth | Built-in | Anonymous |
| Firestore | Built-in | User UID |

## Security Notes

- Never commit `public/config.js` with real credentials to Git → use `.gitignore`
- Use Firebase Security Rules to restrict Firestore access to authenticated users
- Restrict Gemini API key to your domain
- GitHub Public API has rate limits (60 req/hour unauthenticated)

## Features Overview

✅ Instant anonymous authentication  
✅ Real-time GitHub repository search  
✅ AI-powered idea analysis with GitHub context  
✅ Feasibility & Novelty scoring  
✅ Patent research synthesis  
✅ System architecture diagrams (Mermaid)  
✅ Starter code generation  
✅ Export to JSON/Markdown  
✅ Persistent history in Firestore  
✅ Sidekick chat for follow-ups  

## Next Steps

1. Test with sample idea
2. Refine Gemini prompt in `src/services/geminiService.ts`
3. Customize Tailwind theme in `tailwind.config.cjs`
4. Add more components as needed
5. Deploy to production

---

**Created**: February 2026  
**Framework**: React 18 + Vite  
**Auth**: Firebase  
**AI**: Google Gemini 2.5 Flash  
**Database**: Firestore
