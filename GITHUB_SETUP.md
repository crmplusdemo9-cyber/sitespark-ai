# 🚀 GitHub + GitHub Pages Setup Guide

## Step 1: Create GitHub Repository

Go to: **https://github.com/new**

- **Repository name**: `sitespark-ai`
- **Description**: `AI-powered one-page website builder - SaaS with admin dashboard`
- **Visibility**: Public (required for free GitHub Pages)
- **DO NOT** initialize with README (we already have one)
- Click **Create repository**

## Step 2: Push Code (run in terminal)

```bash
cd /home/workspace/HTMLWorkspace/sitespark-ai
git remote add origin https://github.com/YOUR_USERNAME/sitespark-ai.git
git push -u origin main
```

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your password)
  - Create one at: https://github.com/settings/tokens
  - Scopes needed: `repo`

## Step 3: Enable GitHub Pages

1. Go to your repo: `https://github.com/YOUR_USERNAME/sitespark-ai`
2. Click **Settings** tab
3. Left sidebar → **Pages**
4. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/docs`
5. Click **Save**

## Step 4: Access Your Live Preview!

After 1-2 minutes, your site will be live at:

```
https://YOUR_USERNAME.github.io/sitespark-ai/
```

### Live Pages:
- **Landing Page**: `https://YOUR_USERNAME.github.io/sitespark-ai/`
- **Admin Dashboard**: `https://YOUR_USERNAME.github.io/sitespark-ai/admin.html`

## That's it! 🎉
