import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Store connected dashboard clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Dashboard client connected. Total clients:', clients.size);
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Dashboard client disconnected. Total clients:', clients.size);
  });
});

// Broadcast to all connected dashboards
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    clients: clients.size,
    uptime: process.uptime()
  });
});

// Log session start
app.post('/api/session/start', (req, res) => {
  const { sessionId, agentName, model } = req.body;
  
  const data = {
    type: 'session_start',
    timestamp: Date.now(),
    data: { sessionId, agentName, model }
  };
  
  broadcast(data);
  console.log('Session started:', sessionId);
  
  res.json({ success: true, sessionId });
});

// Log session end
app.post('/api/session/end', (req, res) => {
  const { sessionId } = req.body;
  
  const data = {
    type: 'session_end',
    timestamp: Date.now(),
    data: { sessionId }
  };
  
  broadcast(data);
  console.log('Session ended:', sessionId);
  
  res.json({ success: true, sessionId });
});

// Log token usage
app.post('/api/tokens', (req, res) => {
  const { sessionId, inputTokens, outputTokens } = req.body;
  
  const data = {
    type: 'token_usage',
    timestamp: Date.now(),
    data: {
      sessionId,
      tokenUsage: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      }
    }
  };
  
  broadcast(data);
  console.log('Token usage logged:', inputTokens + outputTokens, 'total');
  
  res.json({ success: true, total: inputTokens + outputTokens });
});

// Log task start
app.post('/api/task/start', (req, res) => {
  const { taskId, sessionId, description, priority } = req.body;
  
  const data = {
    type: 'task_start',
    timestamp: Date.now(),
    data: {
      taskId,
      sessionId,
      task: {
        id: taskId,
        description,
        priority: priority || 'medium',
        status: 'in_progress',
        startTime: Date.now()
      }
    }
  };
  
  broadcast(data);
  console.log('Task started:', description);
  
  res.json({ success: true, taskId });
});

// Log task complete
app.post('/api/task/complete', (req, res) => {
  const { taskId, status, duration } = req.body;
  
  const data = {
    type: 'task_complete',
    timestamp: Date.now(),
    data: {
      taskId,
      status: status || 'success',
      duration
    }
  };
  
  broadcast(data);
  console.log('Task completed:', taskId, status);
  
  res.json({ success: true, taskId });
});

// Log error
app.post('/api/error', (req, res) => {
  const { sessionId, severity, message } = req.body;
  
  const data = {
    type: 'error',
    timestamp: Date.now(),
    data: {
      sessionId,
      severity: severity || 'error',
      errorMessage: message
    }
  };
  
  broadcast(data);
  console.log('Error logged:', severity, message);
  
  res.json({ success: true });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Dashboard Server running on port ${PORT}`);
  console.log(`📊 WebSocket ready for dashboard connections`);
  console.log(`🔌 API endpoints ready`);
});
