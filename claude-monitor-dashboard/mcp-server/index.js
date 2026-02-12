import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { WebSocketServer } from 'ws';

// WebSocket server for dashboard communication
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Dashboard client connected');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Dashboard client disconnected');
  });
});

// Broadcast to all connected dashboard clients
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// MCP Server setup
const server = new Server(
  {
    name: "claude-monitor",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: "log_session_start",
    description: "Log the start of a new Claude session",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "Unique identifier for this session"
        },
        agentName: {
          type: "string",
          description: "Name of the agent/assistant"
        },
        model: {
          type: "string",
          description: "Model being used (e.g., claude-sonnet-4)"
        }
      },
      required: ["sessionId", "agentName", "model"]
    }
  },
  {
    name: "log_session_end",
    description: "Log the end of a Claude session",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "Session identifier"
        }
      },
      required: ["sessionId"]
    }
  },
  {
    name: "log_token_usage",
    description: "Log token usage for a session",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "Session identifier"
        },
        inputTokens: {
          type: "number",
          description: "Number of input tokens"
        },
        outputTokens: {
          type: "number",
          description: "Number of output tokens"
        }
      },
      required: ["sessionId", "inputTokens", "outputTokens"]
    }
  },
  {
    name: "log_task_start",
    description: "Log the start of a task",
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "Unique identifier for this task"
        },
        sessionId: {
          type: "string",
          description: "Associated session ID"
        },
        description: {
          type: "string",
          description: "Task description"
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Task priority level"
        }
      },
      required: ["taskId", "sessionId", "description", "priority"]
    }
  },
  {
    name: "log_task_complete",
    description: "Log task completion",
    inputSchema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "Task identifier"
        },
        status: {
          type: "string",
          enum: ["success", "failed", "partial"],
          description: "Completion status"
        },
        duration: {
          type: "number",
          description: "Task duration in milliseconds"
        }
      },
      required: ["taskId", "status"]
    }
  },
  {
    name: "log_error",
    description: "Log an error or warning",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
          description: "Session identifier"
        },
        severity: {
          type: "string",
          enum: ["warning", "error", "critical"],
          description: "Error severity"
        },
        message: {
          type: "string",
          description: "Error message"
        }
      },
      required: ["sessionId", "severity", "message"]
    }
  }
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "log_session_start": {
        const data = {
          type: 'session_start',
          timestamp: Date.now(),
          data: {
            sessionId: args.sessionId,
            agentName: args.agentName,
            model: args.model
          }
        };
        broadcast(data);
        return {
          content: [{
            type: "text",
            text: `Session ${args.sessionId} started for ${args.agentName} using ${args.model}`
          }]
        };
      }

      case "log_session_end": {
        const data = {
          type: 'session_end',
          timestamp: Date.now(),
          data: {
            sessionId: args.sessionId
          }
        };
        broadcast(data);
        return {
          content: [{
            type: "text",
            text: `Session ${args.sessionId} ended`
          }]
        };
      }

      case "log_token_usage": {
        const data = {
          type: 'token_usage',
          timestamp: Date.now(),
          data: {
            sessionId: args.sessionId,
            tokenUsage: {
              input: args.inputTokens,
              output: args.outputTokens,
              total: args.inputTokens + args.outputTokens
            }
          }
        };
        broadcast(data);
        return {
          content: [{
            type: "text",
            text: `Logged ${args.inputTokens + args.outputTokens} total tokens for session ${args.sessionId}`
          }]
        };
      }

      case "log_task_start": {
        const data = {
          type: 'task_start',
          timestamp: Date.now(),
          data: {
            taskId: args.taskId,
            sessionId: args.sessionId,
            task: {
              id: args.taskId,
              description: args.description,
              priority: args.priority,
              status: 'in_progress',
              startTime: Date.now()
            }
          }
        };
        broadcast(data);
        return {
          content: [{
            type: "text",
            text: `Task ${args.taskId} started: ${args.description}`
          }]
        };
      }

      case "log_task_complete": {
        const data = {
          type: 'task_complete',
          timestamp: Date.now(),
          data: {
            taskId: args.taskId,
            status: args.status,
            duration: args.duration
          }
        };
        broadcast(data);
        return {
          content: [{
            type: "text",
            text: `Task ${args.taskId} completed with status: ${args.status}`
          }]
        };
      }

      case "log_error": {
        const data = {
          type: 'error',
          timestamp: Date.now(),
          data: {
            sessionId: args.sessionId,
            severity: args.severity,
            errorMessage: args.message
          }
        };
        broadcast(data);
        return {
          content: [{
            type: "text",
            text: `Logged ${args.severity}: ${args.message}`
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start MCP server
async function main() {
  console.log('MCP Server starting...');
  console.log('WebSocket server listening on port 8080');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('Claude Monitor MCP Server running');
  console.log('Available tools:', TOOLS.map(t => t.name).join(', '));
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
