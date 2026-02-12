# Deployment Guide

## Local Development

### 1. Start the MCP Server (Terminal 1)
```bash
npm run mcp-server
```

This starts the WebSocket server on port 8080 that receives data from Claude.

### 2. Start the Dashboard (Terminal 2)
```bash
npm run dev
```

This starts the Next.js dashboard on http://localhost:3000

### 3. Configure Claude Desktop

**Mac:**
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:**
Edit `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:
```json
{
  "mcpServers": {
    "claude-monitor": {
      "command": "node",
      "args": ["C:/Users/nonsw/claude-monitor-dashboard/mcp-server/index.js"]
    }
  }
}
```

**Update the path** to match where you saved the project!

### 4. Restart Claude Desktop

After updating the config, restart Claude Desktop to load the MCP server.

## Vercel Deployment (Dashboard Only)

### Step 1: Create GitHub Repository

```bash
cd claude-monitor-dashboard
git init
git add .
git commit -m "Initial commit - Claude Monitor Dashboard"
```

Create a new repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/claude-monitor-dashboard.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your `claude-monitor-dashboard` repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

### Step 3: Deploy MCP Server Separately

The MCP server needs to run separately since it's a Node.js WebSocket server.

**Option A: Railway.app (Recommended)**

1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub
4. Add this `Procfile` to your repo:
   ```
   web: node mcp-server/index.js
   ```
5. Set environment variable: `PORT=8080`
6. Railway will give you a URL like `https://your-app.railway.app`

**Option B: Render.com**

1. Go to https://render.com
2. New > Web Service
3. Connect your GitHub repo
4. Build Command: `npm install`
5. Start Command: `node mcp-server/index.js`
6. Set environment variable: `PORT=8080`

**Option C: Self-hosted VPS**

Run on your own server:
```bash
npm run mcp-server
```

Use PM2 to keep it running:
```bash
npm install -g pm2
pm2 start mcp-server/index.js --name claude-monitor
pm2 save
pm2 startup
```

### Step 4: Update WebSocket URL

Once your MCP server is deployed, update the WebSocket URL in `app/page.tsx`:

```typescript
// Change this:
const ws = new WebSocket('ws://localhost:8080');

// To your deployed URL:
const ws = new WebSocket('wss://your-mcp-server.railway.app');
```

Push the change and Vercel will auto-deploy.

## Production MCP Configuration

Update your Claude Desktop config to point to the production MCP server:

```json
{
  "mcpServers": {
    "claude-monitor": {
      "command": "node",
      "args": ["/full/path/to/mcp-server/index.js"],
      "env": {
        "WS_PORT": "8080"
      }
    }
  }
}
```

## Environment Variables

### Dashboard (.env.local)
```env
NEXT_PUBLIC_WS_URL=wss://your-mcp-server.railway.app
```

### MCP Server
```env
PORT=8080
NODE_ENV=production
```

## Testing the Setup

1. Open your dashboard: https://your-app.vercel.app
2. Start a conversation in Claude Desktop
3. Ask Claude to use the monitoring tools:
   ```
   Please log a session start with sessionId "test-123" and agentName "test-agent"
   ```
4. Watch the dashboard update in real-time!

## Troubleshooting

### Dashboard shows "Disconnected"
- Check if MCP server is running
- Verify WebSocket URL is correct
- Check browser console for connection errors

### Claude not logging data
- Ensure MCP server is in Claude Desktop config
- Restart Claude Desktop after config changes
- Check MCP server logs: `pm2 logs claude-monitor`

### CORS issues
If you get CORS errors, add this to `mcp-server/index.js`:
```javascript
wss.on('connection', (ws, req) => {
  ws.on('headers', (headers) => {
    headers['Access-Control-Allow-Origin'] = '*';
  });
  // ... rest of connection handler
});
```

## Monitoring Production

### Railway Logs
```bash
railway logs
```

### PM2 Logs
```bash
pm2 logs claude-monitor
```

### Vercel Logs
Check in Vercel dashboard under your project > Logs

## Scaling

For high-traffic scenarios:
- Deploy multiple MCP server instances
- Use Redis for shared state
- Implement load balancing
- Add database for persistence (PostgreSQL, MongoDB)

## Security Checklist

- [ ] Enable authentication for production dashboard
- [ ] Use HTTPS/WSS in production
- [ ] Set up rate limiting
- [ ] Implement CORS properly
- [ ] Add API key authentication for MCP server
- [ ] Use environment variables for sensitive config
- [ ] Enable Vercel password protection if needed

## Next Steps

1. Deploy and test locally first
2. Push to GitHub
3. Deploy dashboard to Vercel
4. Deploy MCP server to Railway/Render
5. Update Claude Desktop config
6. Test end-to-end
7. Monitor and iterate!
