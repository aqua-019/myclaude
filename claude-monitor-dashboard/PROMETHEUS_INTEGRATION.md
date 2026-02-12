# Prometheus Integration Example

This shows how to integrate the Claude Monitor with your existing Prometheus system.

## Architecture

```
User Input
    ↓
Keyword Detection
    ├─→ "PROMETHEUS" → Prometheus System (Task Decomposition)
    └─→ Regular Query → Claude Code (with Monitor logging)
         ↓
    Monitor Dashboard (Real-time Visibility)
```

## Example Workflow

### 1. User creates a project with Prometheus

```
User: "PROMETHEUS create project: Build a Solidity DEX with automated market maker"

Prometheus Response:
- Task 1: Design AMM algorithm
- Task 2: Write Solidity contracts
- Task 3: Implement security features
- Task 4: Write tests
- Task 5: Deploy to testnet
```

### 2. Claude Code works on tasks with monitoring

```javascript
// When Claude Code starts working on Task 2
// It automatically logs to the monitor:

await mcp.callTool('log_session_start', {
  sessionId: 'task-002-session',
  agentName: 'solidity-developer',
  model: 'claude-sonnet-4'
});

await mcp.callTool('log_task_start', {
  sessionId: 'task-002-session',
  taskId: 'task-002',
  taskDescription: 'Write Solidity contracts for DEX',
  priority: 'high'
});

// As work progresses
await mcp.callTool('log_token_usage', {
  sessionId: 'task-002-session',
  inputTokens: 3500,
  outputTokens: 1200,
  contextWindow: 200000
});

// When complete
await mcp.callTool('log_task_complete', {
  sessionId: 'task-002-session',
  taskId: 'task-002',
  status: 'success',
  duration: 45000
});
```

### 3. Dashboard shows real-time progress

The dashboard displays:
- Active session for solidity-developer agent
- Token usage tracking
- Task progress (Task 2: in progress)
- Real-time metrics

## Integration Points

### Option A: Automatic Logging (Recommended)

Add monitoring to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "prometheus": {
      "command": "node",
      "args": ["path/to/prometheus/server.js"]
    },
    "claude-monitor": {
      "command": "node",
      "args": ["path/to/claude-monitor-dashboard/mcp-server/index.js"]
    }
  }
}
```

Claude will have access to both systems simultaneously.

### Option B: Explicit Logging

Prompt Claude to use monitoring tools:

```
User: "Work on task-002 and log your progress to the monitor"

Claude will:
1. Start session logging
2. Begin work on task
3. Log token usage periodically
4. Log task completion
5. Handle errors with logging
```

### Option C: Prometheus Integration Layer

Create a middleware that bridges Prometheus and Monitor:

```javascript
// prometheus-monitor-bridge.js
import { PrometheusClient } from './prometheus-client.js';
import { MonitorClient } from './monitor-client.js';

class PrometheusMonitorBridge {
  constructor() {
    this.prometheus = new PrometheusClient();
    this.monitor = new MonitorClient();
  }

  async onTaskAssigned(task) {
    // When Prometheus assigns a task, log to monitor
    await this.monitor.logTaskStart({
      sessionId: task.sessionId,
      taskId: task.id,
      taskDescription: task.description,
      priority: task.priority
    });
  }

  async onTaskProgress(task, tokens) {
    // Log progress updates
    await this.monitor.logTokenUsage({
      sessionId: task.sessionId,
      inputTokens: tokens.input,
      outputTokens: tokens.output
    });
  }

  async onTaskComplete(task, result) {
    // Log completion
    await this.monitor.logTaskComplete({
      sessionId: task.sessionId,
      taskId: task.id,
      status: result.success ? 'success' : 'failed',
      duration: result.duration
    });
    
    // Update Prometheus
    await this.prometheus.updateTaskStatus(task.id, result);
  }
}

export default PrometheusMonitorBridge;
```

## Example: Multi-Agent Orchestration with Monitoring

```javascript
// Orchestrator agent coordinates multiple subagents

// 1. Infrastructure Agent
await monitor.logSessionStart({
  sessionId: 'infra-001',
  agentName: 'infrastructure-specialist',
  model: 'claude-sonnet-4'
});

// 2. Solidity Agent
await monitor.logSessionStart({
  sessionId: 'solidity-001',
  agentName: 'solidity-developer',
  model: 'claude-sonnet-4'
});

// 3. Security Agent
await monitor.logSessionStart({
  sessionId: 'security-001',
  agentName: 'security-auditor',
  model: 'claude-opus-4'
});

// Dashboard shows all three agents working in parallel
// with real-time token usage and task progress
```

## Dashboard Views for Different Scenarios

### Scenario 1: Single Agent Development
- Shows one active session
- Token usage chart for that session
- Task list for current work

### Scenario 2: Multi-Agent Orchestration
- Multiple session cards (one per agent)
- Aggregated token usage
- Tasks grouped by agent
- Metrics showing total system activity

### Scenario 3: Long-Running Projects
- Historical token usage trends
- Completed task archive
- Agent efficiency metrics
- System uptime tracking

## Commands for Claude

### Start Monitored Session
```
Please start a monitored session with:
- sessionId: "blockchain-dev-001"
- agentName: "blockchain-specialist"
- model: "claude-sonnet-4"
```

### Log Task Progress
```
Log this task:
- taskId: "implement-amm"
- description: "Implement automated market maker logic"
- priority: "high"
```

### Track Token Usage
```
After each significant operation, log your token usage to the monitor
```

### Report Errors
```
If you encounter any errors, log them with:
- errorType
- errorMessage
- severity
```

## Benefits of Integration

1. **Visibility**: See exactly what all agents are doing
2. **Debugging**: Track which agent used what resources
3. **Optimization**: Identify token usage patterns
4. **Coordination**: Monitor multi-agent orchestration
5. **History**: Review past sessions and tasks
6. **Alerts**: Get notified of errors in real-time

## Future Enhancements

- Auto-logging integration with Prometheus
- Task dependency visualization
- Agent performance comparisons
- Cost tracking per task/agent
- Automated reporting
- Slack/Discord notifications
- Agent collaboration graphs
