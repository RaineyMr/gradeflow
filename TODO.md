## Task: Fix black screen on app load (show login page)

### Steps to complete:
1. [✅] Add hydration flag to src/lib/store.js
2. [✅] Update src/App.jsx with global loading overlay
3. [✅] Fix src/components/layout/AppShell.jsx with loading fallback
4. [✅] Update src/router/ProtectedRoute.jsx to handle loading
5. [✅] Add localStorage validation + auto-redirect in src/App.jsx LoginRoute
6. [✅] Tested: npm run dev shows login instantly, no black screen. Demo login → dashboard works.

7. [✅] Invalid localStorage auto-cleared + session expiry handled.

Task complete: App now reliably shows login page on load with proper hydration/loading states. Black screen fixed.
8. [ ] attempt_completion

Current progress: Starting implementation.

