# IdeaForge Vision - R&D Tool

A professional, full-stack React application for idea forging with GitHub research, AI analysis, and patent synthesis.

## Architecture

```
src/
├── components/          # UI components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── ResultTabs.tsx
│   ├── RepoCard.tsx
│   ├── PatentCard.tsx
│   ├── MermaidDiagram.tsx
│   ├── SidekickChat.tsx
│   └── ExportButton.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Firebase Authentication
│   ├── useForge.tsx    # Forge state management
│   ├── useFirestore.ts # Firestore history fetch
│   └── useExport.ts    # Export utilities
├── services/           # API and backend logic
│   ├── firebaseConfig.ts  # Firebase initialization
│   ├── githubService.ts   # GitHub repo search
│   └── geminiService.ts   # Gemini AI orchestration
├── types/              # TypeScript interfaces
│   └── index.ts
├── styles/             # Global CSS
│   └── index.css
├── pages/              # Route pages
│   ├── Login.tsx
│   └── Dashboard.tsx
├── App.tsx
└── main.tsx
```

## Key Features

✅ **Firebase Anonymous Auth** - Instant login without credentials  
✅ **GitHub Integration** - Real-time repository search with live metrics  
✅ **Google Gemini 2.5 Flash** - AI-powered idea analysis with grounding in real repos  
✅ **Firestore History** - Automatic Forge storage at `/artifacts/{appId}/users/{userId}/forges/{forgeId}`  
✅ **Mermaid Diagrams** - System architecture visualization via mermaid.ink  
✅ **Tailwind CSS** - Cyberpunk-Corporate theme (Deep Slate #020617, Emerald-500, Cyan-400)  
✅ **Export Bundle** - Download JSON/Markdown reports  
✅ **Sidekick Chat** - Follow-up Q&A about generated results  

## Installation

```bash
npm install
```

## Configuration

Before running the app, you must set up Firebase and Gemini API credentials.

### 1. Firebase Setup

Open `index.html` or set in your JavaScript before app initialization:

```javascript
window.__firebase_config = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};
window.__app_id = "ideaforge"; // Optional, defaults to 'ideaforge'
```

### 2. Gemini API Setup

Set the Gemini API key:

```javascript
window.__gemini_api_key = "YOUR_GEMINI_API_KEY";
```

Configure the Gemini endpoint in `src/services/geminiService.ts` (line 20):

```typescript
const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173/`

## Build for Production

```bash
npm run build
npm run preview
```

## API Requirements (Provided Later)

The system requires:

1. **Firebase Realtime Database or Firestore** - For storing Forge history
2. **Google Gemini 2.5 Flash API** - For AI analysis
3. **GitHub API** (public, no token required for basic search)

## User Flow

1. **Login** → Anonymous Firebase sign-in
2. **Dashboard** → Describe idea, optionally upload image
3. **Forge** → Triggers:
   - GitHub repo search (live data)
   - Gemini AI analysis (with repo context)
   - Auto-save to Firestore
4. **Results** → Display refined concept, scores, repos, patents, architecture diagram, starter code
5. **Export** → Download as JSON or Markdown
6. **Sidekick** → Ask follow-up questions

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **Routing**: React Router DOM v6
- **Backend**: Firebase (Auth + Firestore)
- **Icons**: Lucide React
- **Diagrams**: Mermaid + mermaid.ink
- **AI**: Google Gemini 2.5 Flash
- **External APIs**: GitHub API

## Notes

- GitHub rate limits: The service gracefully falls back to empty results
- Gemini errors: Mock response returned to ensure UI stability
- Firestore path structure: `/artifacts/{appId}/users/{userId}/forges/{forgeId}`
- All data is authenticated via Firebase user UID
