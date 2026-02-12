import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import WebSocket from 'ws';

// WebSocket server for dashboard communication
const wss = new WebSocket.Server({ port: 8080 });
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
function broadcastToDashboard(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Store for monitoring data
const monitoringData = {
  sessions: new Map(),
  metrics: {
    totalTokens: 0,
    totalRequests: 0,
    activeAgents: 0,
    startTime: Date.now()
  }
};

// Create MCP server
const server = new Server(
  {
    name: "claude-monitor",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "log_session_start",
        description: "Log when a new Claude session starts",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Unique session identifier"
            },
            agentName: {
              type: "string",
              description: "Name of the agent/subagent"
            },
            model: {
              type: "string",
              description: "Model being used (e.g., claude-sonnet-4)"
            }
          },
          required: ["sessionId", "agentName"]
        }
      },
      {
        name: "log_session_end",
        description: "Log when a Claude session ends",
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
        description: "Log token usage for a request",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Session identifier"
            },
            inputTokens: {
              type: "number",
              description: "Input tokens used"
            },
            outputTokens: {
              type: "number",
              description: "Output tokens generated"
            },
            contextWindow: {
              type: "number",
              description: "Total context window size"
            }
          },
          required: ["sessionId", "inputTokens", "outputTokens"]
        }
      },
      {
        name: "log_task_start",
        description: "Log when a task begins",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Session identifier"
            },
            taskId: {
              type: "string",
              description: "Unique task identifier"
            },
            taskDescription: {
              type: "string",
              description: "Description of the task"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Task priority level"
            }
          },
          required: ["sessionId", "taskId", "taskDescription"]
        }
      },
      {
        name: "log_task_complete",
        description: "Log when a task completes",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Session identifier"
            },
            taskId: {
              type: "string",
              description: "Task identifier"
            },
            status: {
              type: "string",
              enum: ["success", "failed", "partial"],
              description: "Task completion status"
            },
            duration: {
              type: "number",
              description: "Task duration in milliseconds"
            }
          },
          required: ["sessionId", "taskId", "status"]
        }
      },
      {
        name: "log_error",
        description: "Log an error event",
        inputSchema: {
          type: "object",
          properties: {
            sessionId: {
              type: "string",
              description: "Session identifier"
            },
            errorType: {
              type: "string",
              description: "Type of error"
            },
            errorMessage: {
              type: "string",
              description: "Error message"
            },
            severity: {
              type: "string",
              enum: ["warning", "error", "critical"],
              description: "Error severity"
            }
          },
          required: ["sessionId", "errorType", "errorMessage"]
        }
      }
    ]
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "log_session_start": {
        const session = {
          id: args.sessionId,
          agentName: args.agentName,
          model: args.model || "unknown",
          startTime: Date.now(),
          tasks: [],
          tokenUsage: { input: 0, output: 0, total: 0 }
        };
        
        monitoringData.sessions.set(args.sessionId, session);
        monitoringData.metrics.activeAgents++;
        
        broadcastToDashboard({
          type: 'session_start',
          data: session
        });
        
        return {
          content: [{ 
            type: "text", 
            text: `Session ${args.sessionId} started for agent ${args.agentName}` 
          }]
        };
      }

      case "log_session_end": {
        const session = monitoringData.sessions.get(args.sessionId);
        if (session) {
          monitoringData.metrics.activeAgents = Math.max(0, monitoringData.metrics.activeAgents - 1);
          
          broadcastToDashboard({
            type: 'session_end',
            data: { sessionId: args.sessionId }
          });
        }
        
        return {
          content: [{ 
            type: "text", 
            text: `Session ${args.sessionId} ended` 
          }]
        };
      }

      case "log_token_usage": {
        const session = monitoringData.sessions.get(args.sessionId);
        if (session) {
          session.tokenUsage.input += args.inputTokens;
          session.tokenUsage.output += args.outputTokens;
          session.tokenUsage.total = session.tokenUsage.input + session.tokenUsage.output;
          
          monitoringData.metrics.totalTokens += args.inputTokens + args.outputTokens;
          monitoringData.metrics.totalRequests++;
          
          broadcastToDashboard({
            type: 'token_update',
            data: {
              sessionId: args.sessionId,
              tokenUsage: session.tokenUsage,
              contextWindow: args.contextWindow
            }
          });
        }
        
        return {
          content: [{ 
            type: "text", 
            text: `Logged ${args.inputTokens + args.outputTokens} tokens for session ${args.sessionId}` 
          }]
        };
      }

      case "log_task_start": {
        const session = monitoringData.sessions.get(args.sessionId);
        if (session) {
          const task = {
            id: args.taskId,
            description: args.taskDescription,
            priority: args.priority || "medium",
            status: "in_progress",
            startTime: Date.now()
          };
          
          session.tasks.push(task);
          
          broadcastToDashboard({
            type: 'task_start',
            data: { sessionId: args.sessionId, task }
          });
        }
        
        return {
          content: [{ 
            type: "text", 
            text: `Task ${args.taskId} started` 
          }]
        };
      }

      case "log_task_complete": {
        const session = monitoringData.sessions.get(args.sessionId);
        if (session) {
          const task = session.tasks.find(t => t.id === args.taskId);
          if (task) {
            task.status = args.status;
            task.endTime = Date.now();
            task.duration = args.duration || (task.endTime - task.startTime);
          }
          
          broadcastToDashboard({
            type: 'task_complete',
            data: { sessionId: args.sessionId, taskId: args.taskId, status: args.status }
          });
        }
        
        return {
          content: [{ 
            type: "text", 
            text: `Task ${args.taskId} completed with status: ${args.status}` 
          }]
        };
      }

      case "log_error": {
        const errorEvent = {
          sessionId: args.sessionId,
          type: args.errorType,
          message: args.errorMessage,
          severity: args.severity || "error",
          timestamp: Date.now()
        };
        
        broadcastToDashboard({
          type: 'error',
          data: errorEvent
        });
        
        return {
          content: [{ 
            type: "text", 
            text: `Error logged: ${args.errorMessage}` 
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

// Start the server
async function main() {
  console.log('Starting Claude Monitor MCP Server...');
  console.log('WebSocket server running on ws://localhost:8080');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('MCP Server ready and waiting for connections');
}

main().catch(console.error);
