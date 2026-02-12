# Deployment Guide - Claude Monitor Dashboard

## Overview
Deploy the Claude Monitor Dashboard to the web using GitHub + Vercel for free hosting with automatic deployments.

---

## Part 1: GitHub Setup

### Step 1: Create GitHub Repository

1. **Go to GitHub** (https://github.com)
2. **Click "New Repository"** (green button)
3. **Fill in details:**
   - Repository name: `claude-monitor-dashboard`
   - Description: `Real-time monitoring dashboard for Claude and Claude Code with MCP integration`
   - Visibility: **Public** (required for free Vercel)
   - ✅ Add a README file
   - ✅ Add .gitignore: **Node**
4. **Click "Create repository"**

### Step 2: Prepare Your Local Files

Open Git Bash in your `claude-monitor-dashboard` folder:

```bash
cd /c/Users/nonsw/Downloads/claude-monitor-dashboard
```

### Step 3: Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Claude Monitor Dashboard with Liquid Glass 2.0"
```

### Step 4: Connect to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/claude-monitor-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important Files to Commit:**
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tailwind.config.js`
- ✅ `app/` directory (all React components)
- ✅ `components/` directory
- ✅ `mcp-server/` directory
- ✅ `README.md`
- ✅ `DEPLOYMENT.md`
- ✅ `.gitignore`

---

## Part 2: Vercel Deployment

### Step 1: Sign Up / Log In to Vercel

1. **Go to Vercel** (https://vercel.com)
2. **Click "Sign Up"** (or "Log In")
3. **Choose "Continue with GitHub"**
4. **Authorize Vercel** to access your GitHub repositories

### Step 2: Import Project

1. **Click "Add New..."** → **Project**
2. **Find your repository** (`claude-monitor-dashboard`)
3. **Click "Import"**

### Step 3: Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

**Framework Preset:** Next.js
**Root Directory:** `./` (leave as default)
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install` (auto-detected)

### Step 4: Environment Variables (Optional)

If you want to add any environment variables:

1. **Click "Environment Variables"**
2. **Add variables** (example):
   - `NEXT_PUBLIC_WS_URL` = `wss://your-mcp-server.com`
   - (Only needed if deploying MCP server separately)

### Step 5: Deploy!

1. **Click "Deploy"**
2. **Wait 2-3 minutes** for build to complete
3. **Your dashboard will be live!**

**Your URL will be:** `https://claude-monitor-dashboard.vercel.app`
(Or custom domain if configured)

---

## Part 3: Deploy MCP Server (Separate)

The dashboard (frontend) runs on Vercel, but the **MCP server needs to run separately** for WebSocket connections.

### Option A: Railway.app (Recommended)

1. **Go to Railway** (https://railway.app)
2. **Sign in with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Select** `claude-monitor-dashboard`
5. **Add these settings:**
   - **Start Command:** `node mcp-server/index.js`
   - **Port:** `8080`
6. **Deploy**
7. **Copy the Railway URL** (e.g., `https://your-app.railway.app`)

### Option B: Render.com

1. **Go to Render** (https://render.com)
2. **New Web Service**
3. **Connect GitHub** → Select your repo
4. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `node mcp-server/index.js`
   - **Port:** `8080`
5. **Create Web Service**

### Option C: Self-Hosted (Your Own Server)

```bash
# On your server
cd /path/to/claude-monitor-dashboard
npm install
npm run mcp-server

# Use PM2 to keep it running
npm install -g pm2
pm2 start mcp-server/index.js --name claude-monitor
pm2 save
pm2 startup
```

---

## Part 4: Connect Frontend to Backend

### Update WebSocket URL

Once your MCP server is deployed, update the dashboard:

**File:** `app/page.tsx`

```typescript
// Line ~110
const ws = new WebSocket('ws://localhost:8080'); // CHANGE THIS

// To your deployed URL:
const ws = new WebSocket('wss://your-mcp-server.railway.app');
```

**Commit and push:**
```bash
git add app/page.tsx
git commit -m "Update WebSocket URL to production"
git push
```

Vercel will **auto-deploy** the update!

---

## Part 5: Configure Claude Desktop

Update Claude Desktop to use the MCP server:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "claude-monitor": {
      "command": "node",
      "args": ["C:/path/to/your/claude-monitor-dashboard/mcp-server/index.js"],
      "env": {
        "WS_PORT": "8080"
      }
    }
  }
}
```

**Restart Claude Desktop** after saving.

---

## Part 6: Test Everything

### 1. Test Dashboard
Visit: `https://your-app.vercel.app`

You should see:
- ✅ Liquid Glass 2.0 design
- ✅ Animated gradient background
- ✅ 16 auto-refreshing metric panels
- ✅ All 13 charts rendering
- ✅ "Connected" or "Disconnected" indicator

### 2. Test MCP Connection

In Claude Desktop, ask Claude:
```
Please log a session start with sessionId "test-123" and agentName "test-agent"
```

**Expected result:**
- Dashboard shows new session
- Active Agents count increases
- Charts update with new data

### 3. Test Auto-Refresh

Watch the dashboard for 10 seconds:
- ✅ Metric values change every 3 seconds
- ✅ Charts update (models, agents, subagents, prompts)
- ✅ Token velocity scrolls
- ✅ Values flash green when updating

---

## Part 7: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. **Vercel Dashboard** → Your project
2. **Settings** → **Domains**
3. **Add Domain** → Enter your domain
4. **Follow DNS instructions** from Vercel
5. **Wait for verification** (5-60 minutes)

**Example:** `monitor.yourcompany.com`

---

## Troubleshooting

### Dashboard Not Loading
- Check Vercel deployment logs
- Verify all files committed to GitHub
- Clear browser cache

### "Disconnected" Status
- MCP server not running
- Wrong WebSocket URL in code
- Firewall blocking port 8080
- Check Railway/Render logs

### Metrics Not Updating
- Check browser console for errors
- Verify JavaScript is running
- Try hard refresh (Ctrl+Shift+R)

### Claude Not Logging Data
- MCP server in Claude Desktop config?
- Restarted Claude Desktop?
- Check MCP server logs
- Verify tools are available

---

## Automatic Deployments

### How It Works
Every time you push to GitHub, Vercel automatically:
1. Detects the change
2. Runs `npm install`
3. Runs `npm run build`
4. Deploys new version
5. Updates live site

**No manual deployment needed!**

### Make Updates

```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push

# Vercel deploys automatically in ~2 minutes
```

---

## Production Checklist

Before going live:

- [ ] GitHub repo created and pushed
- [ ] Vercel deployment successful
- [ ] MCP server deployed (Railway/Render/Self-hosted)
- [ ] WebSocket URL updated to production
- [ ] Claude Desktop config updated
- [ ] Tested end-to-end data flow
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS working (Vercel handles this)
- [ ] All charts rendering correctly
- [ ] Auto-refresh working
- [ ] Mobile responsive (test on phone)

---

## Monitoring Production

### Vercel Analytics (Free)

1. **Vercel Dashboard** → Your project
2. **Analytics** tab
3. See:
   - Page views
   - Visitor count
   - Load times
   - Geographic distribution

### MCP Server Monitoring

**Railway:**
```bash
railway logs
```

**Render:**
Check logs in Render dashboard

**Self-hosted (PM2):**
```bash
pm2 logs claude-monitor
pm2 monit
```

---

## Costs

### Free Tier (Hobby)
- ✅ **Vercel:** Free forever
  - Unlimited deployments
  - Automatic HTTPS
  - 100GB bandwidth/month
  - No credit card required

- ✅ **Railway:** $5/month credit free
  - Then $0.000463/GB-hour
  - ~$5-10/month for MCP server

- ✅ **Render:** Free tier available
  - Web service sleeps after 15 min
  - Wakes on request

### Recommended Setup (Total: ~$5-10/month)
- Vercel: **Free** (dashboard)
- Railway: **$5-10** (MCP server)

---

## Advanced: GitHub Actions CI/CD

Want automated testing before deploy?

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test # if you have tests
```

---

## Next Steps

1. ✅ **Deploy to Vercel** (5 minutes)
2. ✅ **Deploy MCP Server** (10 minutes)
3. ✅ **Test Everything** (5 minutes)
4. ✅ **Share with team** (send link!)
5. 🎉 **Monitor in real-time**

---

## Support

### Resources
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **MCP Docs:** https://github.com/anthropics/mcp

### Common Issues
- Search GitHub Issues in your repo
- Check Vercel community forum
- Review Railway/Render status page

---

## Summary

You now have:
- ✅ Professional dashboard on Vercel
- ✅ Auto-deploying from GitHub
- ✅ MCP server for live data
- ✅ Real-time metrics and charts
- ✅ Mobile-responsive design
- ✅ Free hosting (dashboard)
- ✅ Liquid Glass 2.0 aesthetic

**Deployment Time:** ~20 minutes total
**Maintenance:** Automatic via Git push

🚀 **You're ready to go live!**
