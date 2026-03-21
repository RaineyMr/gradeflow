# GradeFlow Backend Setup Guide

## What changed and why

Your Anthropic API key was **hardcoded directly in the JavaScript bundle** — visible to anyone
who opens DevTools. This fix moves all AI calls to a secure backend proxy on Vercel.

---

## Step 1 — Add your API key to Vercel (2 minutes)

1. Go to **vercel.com/hiremrrainey-7105s-projects/gradeflow/settings/environment-variables**
2. Click **Add New**
3. Set:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key
   - **Environments:** ✅ Production ✅ Preview ✅ Development
4. Click **Save**

⚠️ Do NOT use `VITE_` prefix — that would make it public again.

---

## Step 2 — Add the two new files to your repo

Drop these files in exactly these locations:

```
gradeflow/
  api/
    ai.js          ← NEW (the secure backend proxy)
  src/
    lib/
      ai.js        ← REPLACE your existing ai.js
```

---

## Step 3 — Update your existing files to use the new helper

Find every file that currently imports from your old `ai.js` and update the imports.

### Old pattern (remove this):
```js
import { callAI } from '../lib/ai'
// or any direct fetch to api.anthropic.com
```

### New pattern (same import path, new functions):
```js
import { callAI, gradeWork, extractRoster, extractAnswers, generateLessonPlan } from '../lib/ai'
```

### Files most likely to update (based on bundle analysis):
- `src/pages/Camera.jsx` — uses `gradeWork`, `extractRoster`, `extractAnswers`
- `src/pages/LessonPlan.jsx` — uses `generateLessonPlan`
- `src/pages/Dashboard.jsx` or similar — uses `callAI`
- Any component using AI web search — switch to `callAIWithSearch`

---

## Step 4 — Delete the old API key from your code

Search your entire repo for:
```
sk-ant-
```

If you find it anywhere, delete it immediately and rotate your key at:
**console.anthropic.com → API Keys → Revoke → Create New**

Then update the `ANTHROPIC_API_KEY` in Vercel with the new key.

---

## Step 5 — Push and verify

```bash
git add api/ai.js src/lib/ai.js
git commit -m "security: move API key to backend proxy"
git push
```

Vercel will redeploy automatically. The site will work exactly the same —
but now the key is safe.

---

## What the proxy handles

| Intent | Used by | Returns |
|--------|---------|---------|
| `general` | Dashboards, summaries | text string |
| `search` | Web-search AI features | text string |
| `grade` | Camera grading flow | `{score, grade, feedback, corrections}` |
| `extractRoster` | Camera roster upload | `{students: [{name, id}]}` |
| `extractAnswers` | Camera answer key upload | `{answers: [{question, answer}]}` |
| `lessonPlan` | Lesson Plan page | structured lesson object |

---

## Adding more intents later

Just add a new `case` to the `switch` in `api/ai.js` and a new exported function
in `src/lib/ai.js`. No other files need to change.
