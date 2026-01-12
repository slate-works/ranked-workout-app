# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "Gymenace Workout App")
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click "Create"

**Fill in required fields:**
- App name: `Gymenace` (or your app name)
- User support email: Your email
- Developer contact: Your email
- Click "Save and Continue"

**Scopes:** Skip this (click "Save and Continue")

**Test users:** Add your email and friends' emails for testing
- Click "Save and Continue"
- Click "Back to Dashboard"

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**

**Configure:**
- Name: `Gymenace Web Client`
- **Authorized JavaScript origins:**
  - `http://localhost:3000` (for local development)
  - `https://yourdomain.com` (add your production domain later)
  
- **Authorized redirect URIs:**
  - `http://localhost:3000/api/auth/callback/google` (local)
  - `https://yourdomain.com/api/auth/callback/google` (production - add later)

4. Click **"Create"**

## Step 5: Copy Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456`)

**Copy these and update your `.env` file:**

```env
AUTH_GOOGLE_ID="YOUR_CLIENT_ID_HERE"
AUTH_GOOGLE_SECRET="YOUR_CLIENT_SECRET_HERE"
```

## Step 6: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Testing

1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Authorize the app
4. You should be redirected to the dashboard!

## For Production Deployment

When deploying to your domain:

1. Go back to **Google Cloud Console** → **Credentials**
2. Click on your OAuth client
3. Add your production URLs:
   - **Authorized JavaScript origins:** `https://workout.yourdomain.com`
   - **Authorized redirect URIs:** `https://workout.yourdomain.com/api/auth/callback/google`
4. Click "Save"

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure your redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes!

**Error: "Access blocked: This app's request is invalid"**
- Make sure you added your email as a test user in OAuth consent screen

**Google sign-in button doesn't work:**
- Check that your `.env` file has the correct credentials
- Restart your dev server after changing `.env`
