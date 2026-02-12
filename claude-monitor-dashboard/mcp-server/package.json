import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 8080;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected dashboard clients
const clients = new Set();

// Initialize database tables
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        agent_name VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        created_at BIGINT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        created_at BIGINT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        task_id VARCHAR(255) UNIQUE NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        start_time BIGINT NOT NULL,
        end_time BIGINT,
        duration INTEGER
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Initialize database on startup
initDatabase();

// WebSocket connection handler
wss.on('connection', async (ws) => {
  clients.add(ws);
  console.log('Dashboard client connected. Total clients:', clients.size);

  // Send all existing data to new client
  try {
    const sessions = await pool.query('SELECT * FROM sessions ORDER BY created_at DESC LIMIT 50');
    const tokens = await pool.query('SELECT * FROM tokens ORDER BY created_at DESC LIMIT 100');
    const tasks = await pool.query('SELECT * FROM tasks ORDER BY start_time DESC LIMIT 100');

    ws.send(JSON.stringify({
      type: 'initial_data',
      data: {
        sessions: sessions.rows,
        tokens: tokens.rows,
        tasks: tasks.rows
      }
    }));

    console.log('📊 Sent initial data to client:', {
      sessions: sessions.rows.length,
      tokens: tokens.rows.length,
      tasks: tasks.rows.length
    });
  } catch (error) {
    console.error('❌ Error sending initial data:', error);
  }

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
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      clients: clients.size,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Log session start
app.post('/api/session/start', async (req, res) => {
  const { sessionId, agentName, model } = req.body;

  try {
    await pool.query(
      'INSERT INTO sessions (session_id, agent_name, model, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (session_id) DO NOTHING',
      [sessionId, agentName, model, Date.now()]
    );

    const data = {
      type: 'session_start',
      timestamp: Date.now(),
      data: { sessionId, agentName, model }
    };

    broadcast(data);
    console.log('Session started:', sessionId);

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error logging session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log session end
app.post('/api/session/end', async (req, res) => {
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
app.post('/api/tokens', async (req, res) => {
  const { sessionId, inputTokens, outputTokens } = req.body;

  try {
    await pool.query(
      'INSERT INTO tokens (session_id, input_tokens, output_tokens, total_tokens, created_at) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, inputTokens, outputTokens, inputTokens + outputTokens, Date.now()]
    );

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
  } catch (error) {
    console.error('Error logging tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log task start
app.post('/api/task/start', async (req, res) => {
  const { taskId, sessionId, description, priority } = req.body;

  try {
    await pool.query(
      'INSERT INTO tasks (task_id, session_id, description, priority, status, start_time) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (task_id) DO NOTHING',
      [taskId, sessionId, description, priority || 'medium', 'in_progress', Date.now()]
    );

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
  } catch (error) {
    console.error('Error logging task start:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log task complete
app.post('/api/task/complete', async (req, res) => {
  const { taskId, status, duration } = req.body;

  try {
    await pool.query(
      'UPDATE tasks SET status = $1, end_time = $2, duration = $3 WHERE task_id = $4',
      [status || 'success', Date.now(), duration, taskId]
    );

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
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log error
app.post('/api/error', async (req, res) => {
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
  console.log(`🗄️  PostgreSQL connected`);
  console.log(`🔌 API endpoints ready`);
});
