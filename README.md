# GradeFlow - AI Teacher Assistant

## Features
- Gradebook with real-time student grades and analytics
- Lesson planning with curriculum integration  
- Automated parent messaging
- Google Classroom sync
- **District gradebook export** (`/api/sync-gradebook.js`)

## Scheduled Sync (Cron Job)

Deploy this as midnight cron job on Vercel/Render/etc:

```bash
# Pseudo-code - replace YOUR_DOMAIN with deployed URL
curl -X POST https://YOUR_DOMAIN.vercel.app/api/sync-gradebook \\
  -H "Content-Type: application/json" \\
  -d '{"triggeredBy": "midnight-cron"}'
```

Or Node.js script:

```javascript
// cron-sync.js - run with `node cron-sync.js`
await fetch('https://YOUR_DOMAIN.vercel.app/api/sync-gradebook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ triggeredBy: 'midnight-cron' }),
})
```

## Local Development
```bash
npm install
npm run dev
```

**Test sync:** Open browser console → `useStore.getState().syncGradebookToDistrict()`

## UI Integration
Add `<GradebookSyncButton />` to Gradebook header:

```jsx
// src/pages/Gradebook.jsx
import { GradebookSyncButton } from '../components/GradebookSyncButton'

<header>
  <GradebookSyncButton />
</header>
```

## Supabase Schema
See `supabase-schema.sql` - ensure `sync_logs` table exists for payload logging.
