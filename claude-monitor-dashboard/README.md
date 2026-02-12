# Claude Monitor Dashboard

Real-time monitoring dashboard for Claude and Claude Code with MCP server integration.

## Features

- 🔴 **Live Session Monitoring** - Track all active Claude sessions in real-time
- 📊 **Token Usage Analytics** - Visualize token consumption with interactive charts
- 📝 **Task Tracking** - Monitor tasks across all agents and subagents
- 🚨 **Error Logging** - Centralized error tracking and alerts
- 🎯 **Multi-Agent Support** - Perfect for orchestrated subagent workflows
- ⚡ **WebSocket Updates** - Real-time data streaming from MCP server

## Architecture

```
┌─────────────────┐
│  Claude Code    │
│  or Claude AI   │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐
│  MCP Server     │
│  (Port: stdio)  │
└────────┬────────┘
         │
         │ WebSocket
         │
┌────────▼────────┐
│  Next.js        │
│  Dashboard      │
│  (Port: 3000)   │
└─────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MCP Server

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "claude-monitor": {
      "command": "node",
      "args": ["/path/to/claude-monitor-dashboard/mcp-server/index.js"]
    }
  }
}
```

### 3. Start the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Start the MCP Server

In a separate terminal:

```bash
npm run mcp-server
```

Or restart Claude Desktop to auto-start the MCP server.

## Usage

### Logging from Claude Code

The MCP server provides these tools for Claude to use:

#### Start a Session
```javascript
// Claude automatically calls this when starting work
{
  "tool": "log_session_start",
  "arguments": {
    "sessionId": "unique-session-id",
    "agentName": "blockchain-dev-agent",
    "model": "claude-sonnet-4"
  }
}
```

#### Log Token Usage
```javascript
{
  "tool": "log_token_usage",
  "arguments": {
    "sessionId": "unique-session-id",
    "inputTokens": 1500,
    "outputTokens": 800,
    "contextWindow": 200000
  }
}
```

#### Track Tasks
```javascript
// Start a task
{
  "tool": "log_task_start",
  "arguments": {
    "sessionId": "unique-session-id",
    "taskId": "task-123",
    "taskDescription": "Compile Solidity contract",
    "priority": "high"
  }
}

// Complete a task
{
  "tool": "log_task_complete",
  "arguments": {
    "sessionId": "unique-session-id",
    "taskId": "task-123",
    "status": "success",
    "duration": 5000
  }
}
```

#### Log Errors
```javascript
{
  "tool": "log_error",
  "arguments": {
    "sessionId": "unique-session-id",
    "errorType": "CompilationError",
    "errorMessage": "Syntax error in contract",
    "severity": "error"
  }
}
```

## Integration with Prometheus

This dashboard works alongside your existing Prometheus system:

1. **Prometheus** handles project decomposition and task assignment
2. **Claude Monitor** provides real-time visibility into execution
3. Use keyword triggers to control which system is active

Example workflow:
```
User: "PROMETHEUS create project: Build DEX smart contract"
→ Prometheus decomposes into tasks

User: "Start development on task-001"
→ Claude Code begins work
→ Monitor dashboard shows real-time progress
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/claude-monitor-dashboard.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click "Deploy"

### 3. Configure MCP Server for Production

For production, you'll need to:

1. Deploy the MCP server to a cloud service (Railway, Render, etc.)
2. Update WebSocket URL in `app/page.tsx` to your deployed server
3. Use environment variables for configuration

## Environment Variables

Create a `.env.local` file:

```env
# Dashboard
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# MCP Server
MCP_PORT=8080
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Node.js, WebSocket
- **Protocol**: Model Context Protocol (MCP)
- **Deployment**: Vercel (dashboard), Railway/Render (MCP server)

## Development

### Project Structure

```
claude-monitor-dashboard/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/
│   ├── SessionCard.tsx   # Session display
│   ├── MetricsOverview.tsx # Metrics cards
│   ├── TaskList.tsx      # Task management
│   └── TokenChart.tsx    # Token usage chart
├── mcp-server/
│   └── index.js          # MCP server implementation
└── package.json
```

### Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run mcp-server` - Start MCP monitoring server

## Troubleshooting

### Dashboard not connecting?

1. Ensure MCP server is running (`npm run mcp-server`)
2. Check WebSocket port (default: 8080)
3. Verify firewall settings

### Claude not logging data?

1. Confirm MCP server is in Claude Desktop config
2. Restart Claude Desktop after config changes
3. Check MCP server logs for connections

### Vercel deployment issues?

1. Ensure all dependencies are in `package.json`
2. Check build logs for errors
3. WebSocket requires separate backend deployment

## Security Notes

- Dashboard shows data from all connected Claude sessions
- Sensitive data is only stored in memory (not persisted)
- For production, implement authentication
- Use HTTPS for WebSocket in production

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Author

Built for autonomous Claude Code development workflows with MCP integration.
