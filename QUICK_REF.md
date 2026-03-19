# IdeaForge Vision - Quick Reference Card

## 🎯 Current Status
✅ **Development Server Running** → `http://localhost:5173/`  
✅ **Zero TypeScript Errors** → Strict mode passing  
✅ **Production Build Ready** → `npm run build` creates dist/  
✅ **All Components Built** → 7 UI components ready  

---

## 📋 YOUR CHECKLIST

```
[ ] 1. Create Firebase project
    → Go to https://console.firebase.google.com
    
[ ] 2. Enable Anonymous Auth
    → Authentication → Sign-in methods → Toggle Anonymous ON
    
[ ] 3. Create Firestore Database
    → Firestore Database → Start in Production mode
    
[ ] 4. Get Firebase Credentials
    → Project Settings → Web → Copy config object
    
[ ] 5. Get Gemini API Key
    → Go to https://makersuite.google.com/app/apikey
    
[ ] 6. Fill in public/config.js
    → Edit file with your credentials
    
[ ] 7. Test Application
    → Sign in → Create forge → Export results
    
[ ] 8. Deploy (Optional)
    → Run: npm run build
    → Upload dist/ to Vercel/Netlify/etc
```

---

## 🔧 Key Files to Remember

| File | Purpose | Edit? |
|------|---------|-------|
| `public/config.js` | Your API credentials | ✏️ YES |
| `src/services/geminiService.ts` | Gemini endpoint | ✏️ Maybe |
| `src/hooks/useForge.tsx` | Orchestration logic | ❌ No |
| `src/components/ResultTabs.tsx` | Result display | ❌ No |
| `tailwind.config.cjs` | Theme colors | ✏️ Optional |

---

## 🎮 Commands Quick Reference

```bash
# Start dev server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies (already done)
npm install

# Check for errors
npm run type-check  # (if configured)
```

---

## 🔗 External Services Used

| Service | Purpose | Free Tier | Limits |
|---------|---------|-----------|--------|
| Firebase | Auth + Database | ✅ Yes | 1M reads/day |
| Google Gemini | AI Analysis | ✅ Yes | 60 req/min |
| GitHub API | Repo Search | ✅ Yes | 60 req/hour |

---

## 📱 User Flow Diagram

```
Login Page
    ↓
[Sign In] → Firebase Anonymous Auth
    ↓
Dashboard
    ↓
Input: Idea + Image (optional)
    ↓
[Forge Button]
    ↓
GitHub Search (real data)
    ↓
Gemini AI Analysis (with context)
    ↓
Results Display
├─ Refined Concept
├─ Scores (Feasibility %)
├─ Validated Repos
├─ Patents
├─ Architecture (Mermaid)
├─ Starter Code
└─ Export / Chat
    ↓
Auto-save to Firestore
    ↓
History Sidebar Updates
```

---

## 💾 Database Structure

```
artifacts/
└── ideaforge/                    (or your app ID)
    └── users/
        └── {userId}/
            └── forges/
                └── {forgeId}/
                    ├── idea: string
                    ├── result: { ... }
                    └── createdAt: timestamp
```

---

## 🎨 Theme Colors

| Name | Value | Usage |
|------|-------|-------|
| Deep Slate | #020617 | Background |
| Emerald-500 | #10B981 | Primary buttons |
| Cyan-400 | #22D3EE | Secondary buttons |
| White/5% | rgba | Cards |

---

## 🐛 If Something Goes Wrong

```
Error: "Firebase config not found"
→ Check public/config.js is loaded in index.html
→ Browser DevTools → Console → window.__firebase_config

Error: "Gemini returns 403"
→ Check API key in public/config.js
→ Verify quota: https://makersuite.google.com/app/apikey

Error: "Firestore document not saving"
→ Check Anonymous Auth is enabled in Firebase
→ Check Firestore rules allow writes (production mode)

Error: "GitHub repos not appearing"
→ Check internet connection (it's a public API)
→ Check query: Open DevTools Network tab

Error: npm install fails
→ Delete node_modules/ and package-lock.json
→ Run: npm install again
```

---

## 📞 Support Resources

- **README.md** - Feature overview
- **QUICKSTART.md** - Detailed setup guide  
- **API_REQUIREMENTS.md** - Credentials checklist
- **COMPLETE.md** - Full project summary
- **public/config.js** - Configuration template

---

## ✅ Verification Checklist

Run this to verify everything works:

```bash
# 1. Check TypeScript
npm run build     # Should complete with 0 errors

# 2. Check dev server
npm run dev       # Should start successfully

# 3. Check config loaded
# Open http://localhost:5173/
# Open DevTools Console
# Type: window.__firebase_config
# Should show your config object

# 4. Check sign in
# Click "Sign In" button
# Should redirect to /dashboard
```

---

## 🚀 Deployment Command

One-liner to deploy (after credentials are set):

```bash
npm run build && vercel deploy dist/
```

Or for Netlify:
```bash
npm run build
# Then drag dist/ folder to Netlify
```

---

## 📊 Performance Tips

- GitHub search limited to 6 results by default (fast, relevant)
- Gemini uses exponential backoff (resilient to timeouts)
- Firestore auto-batches document writes
- Tailwind CSS is tree-shaken (only used styles in dist/)
- Vite code-splitting (lazy load components if needed)

---

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)

---

**Last Verified**: February 9, 2026, 12:30 PM  
**Status**: Ready for Credentials  
**Next Step**: Fill in public/config.js
