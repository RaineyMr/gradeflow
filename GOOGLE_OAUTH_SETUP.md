# Google OAuth Setup Guide for GradeFlow

This guide walks you through setting up Google OAuth 2.0 authentication for GradeFlow, allowing users to sign in with their Google accounts.

## Overview

GradeFlow uses Google OAuth 2.0 through Supabase Auth, providing a secure and seamless login experience for teachers, students, parents, and administrators.

## Prerequisites

- Google Cloud Console account
- Supabase project with Auth enabled
- GradeFlow repository access

## Step 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID (you'll need it later)

### 1.2 Enable Required APIs

In your Google Cloud project, enable these APIs:

1. **Google+ API** (for basic profile information)
2. **Google OAuth2 API** (for authentication)
3. **Google People API** (optional, for extended profile data)

### 1.3 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Configure the consent screen first if prompted:
   - Choose **External** for User Type
   - Fill in required app information
   - Add scopes: `email`, `profile`, `openid`
4. Create OAuth client ID:
   - **Application type**: Web application
   - **Name**: GradeFlow Web App
   - **Authorized redirect URIs**:
     - Development: `http://localhost:5173/auth/callback`
     - Staging: `https://gradeflow-staging.vercel.app/auth/callback`
     - Production: `https://gradeflow-omega.vercel.app/auth/callback`

### 1.4 Get Your Credentials

After creating the OAuth client, you'll have:
- **Client ID**: Starts with `...apps.googleusercontent.com`
- **Client Secret**: Keep this secure!

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Click to expand and **Enable** the provider

### 2.2 Configure Google Provider

1. **Google Client ID**: Paste your Google Client ID
2. **Google Client Secret**: Paste your Google Client Secret
3. **Redirect URL**: Should match your Google Cloud redirect URIs
4. **Save** the configuration

### 2.3 Verify Supabase URL

Your Supabase project URL should be:
- Development: `https://your-project-ref.supabase.co`
- Note this URL for environment variables

## Step 3: Environment Variables Setup

### 3.1 Local Development

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

### 3.2 Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the same variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CLIENT_ID`

## Step 4: Testing the OAuth Flow

### 4.1 Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. Click "Continue with Google"
4. Verify the complete flow:
   - Redirect to Google consent screen
   - User authentication
   - Redirect back to `/auth/callback`
   - Session creation and dashboard redirect

### 4.2 Production Testing

1. Deploy to Vercel (automatic on push to main)
2. Test the OAuth flow on your production URL
3. Verify redirect URIs match exactly

## Step 5: Role Determination Logic

The system automatically determines user roles based on email domains:

### Supported Domain Patterns

| Domain Pattern | Role | Example |
|---------------|-------|---------|
| `@houstonsd.org`, `@houstonisd.org` | Teacher | `teacher@houstonsd.org` |
| `@kipp*` | Teacher | `teacher@kippneworleans.org` |
| `@yesprep*` | Teacher | `teacher@yesprep.org` |
| `@renew*` | Teacher | `teacher@renew-schools.org` |
| `@collegiate*` | Teacher | `teacher@collegiate-academies.org` |
| `@archdiocese*` | Teacher | `teacher@archdiocese-nola.org` |

### Role Detection Rules

1. **Teacher**: Matches school district domains
2. **Student**: Email contains numbers or graduation years
3. **Parent**: Email contains "parent", "mom", or "dad"
4. **Admin**: Email contains "admin", "principal", "superintendent"
5. **Default**: Falls back to "teacher" for unknown domains

## Step 6: Security Considerations

### 6.1 Never Expose Secrets

- **Client Secret**: Only in Supabase, never in frontend
- **Environment Variables**: Never commit `.env.local` to Git
- **API Keys**: Use Vercel environment variables for production

### 6.2 Redirect URI Security

- HTTPS required in production
- Exact URI matching (no wildcards)
- Separate URIs for each environment

### 6.3 Session Management

- Supabase handles session tokens automatically
- Sessions are stored securely in browser
- Automatic token refresh included

## Step 7: Troubleshooting

### Common Issues

#### "redirect_uri_mismatch" Error
- Check that redirect URIs match exactly in Google Cloud and Supabase
- Ensure HTTPS is used in production
- Verify no trailing slashes in URLs

#### "invalid_client" Error
- Double-check Client ID in Supabase
- Verify Client Secret is correct
- Ensure Google provider is enabled in Supabase

#### "access_denied" Error
- User cancelled the OAuth flow
- User didn't grant required permissions
- Check consent screen configuration

#### Demo Mode Issues
- Missing environment variables trigger demo mode
- Check console for "⚠ Running in DEMO MODE" message
- Verify `.env.local` file exists and is properly configured

### Debugging Tools

1. **Browser Console**: Check for OAuth errors
2. **Network Tab**: Verify redirect requests
3. **Supabase Logs**: Check authentication attempts
4. **Google Cloud Console**: Monitor API usage

## Step 8: Advanced Configuration

### 8.1 Custom Scopes

Add additional Google API scopes in Supabase:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/gmail.readonly`

### 8.2 Custom Branding

Customize the Google consent screen:
- Upload app logo
- Set application name
- Configure privacy policy URL
- Add terms of service URL

### 8.3 Multi-Domain Support

For multiple school districts:
1. Add all redirect URIs to Google Cloud
2. Configure role detection logic for each domain
3. Update domain mapping in `OAuthCallback.jsx`

## File Structure

```
src/
├── components/
│   ├── GoogleSignInButton.jsx    # OAuth button component
│   └── ErrorBoundary.jsx        # Error handling
├── pages/
│   └── auth/
│       └── callback.jsx         # OAuth callback handler
├── lib/
│   ├── supabase.js            # Supabase client with auth methods
│   └── store.js               # Zustand store with setAuth function
└── pages/
    └── Login.jsx               # Login page with Google button
```

## Testing Checklist

- [ ] Google OAuth button appears on login page
- [ ] Clicking button redirects to Google consent screen
- [ ] After consent, redirected back to `/auth/callback`
- [ ] Session is created and user is logged in
- [ ] User metadata (name, email, picture) is populated
- [ ] Correct dashboard loads based on role
- [ ] Logout clears session
- [ ] Subsequent visits maintain session
- [ ] Error states display clearly
- [ ] Mobile responsive design works
- [ ] Demo mode fallback works when env vars missing

## Support

For issues with Google OAuth setup:

1. Check this guide first
2. Review [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
3. Consult [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
4. Check GitHub issues for similar problems
5. Contact technical support with error details

---

**Note**: This OAuth implementation uses Supabase as the authentication provider, which handles all security concerns including CSRF protection, PKCE flow, and secure token storage.
