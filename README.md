# FitTrack

Gym + food tracker, installable on your phone home screen as a PWA.

## Deploy to Vercel (free)

1. **Create a GitHub repo** and push this folder to it:
   ```
   cd fittrack-pwa
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/fittrack.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**, sign in with GitHub, click "Add New Project", and import the repo. Leave the default settings — Vercel auto-detects Vite.

3. **Add your API key:** In the Vercel project settings → Environment Variables, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)

4. Click **Deploy**. You'll get a URL like `fittrack-yourname.vercel.app`.

## Install on your phone

**Android (Chrome):**
- Open your Vercel URL
- Tap the **⋮** menu → **Add to Home Screen** / **Install app**

**iPhone (Safari):**
- Open your Vercel URL
- Tap the **Share** icon → **Add to Home Screen**

It'll appear on your home screen with its own icon and open full-screen, no browser bar.

## Local development

```
npm install
npm run dev
```

Note: the AI features (trainer feedback, macro estimation) need the `/api/claude` function, which only works when deployed to Vercel (or run via `vercel dev` locally with the Vercel CLI).

## Customizing the icon

Replace `public/icon-192.png` and `public/icon-512.png` with your own square images (same filenames, same sizes) and redeploy.
