'use client';

import { useState, useEffect } from 'react';
import SessionCard from '../components/SessionCard';
import MetricsOverview from '../components/MetricsOverview';
import ProjectOverview from '../components/ProjectOverview';
import TaskList from '../components/TaskList';
import TokenChart from '../components/TokenChart';
import AgentDistributionChart from '../components/AgentDistributionChart';
import PerformanceMetrics from '../components/PerformanceMetrics';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTokens: 0,
    totalRequests: 0,
    activeAgents: 0,
    startTime: Date.now(),
    inputTokens: 0,
    outputTokens: 0,
    avgResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    peakMemory: 0,
    completedTasks: 0,
    pendingTasks: 0,
    idleAgents: 0,
    costEstimate: 0,
    successRate: 0,
    avgSpeed: 0
  });
  const [project, setProject] = useState({
    name: 'Solidity DEX Development',
    description: 'Automated Market Maker with Multi-Token Support',
    progress: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    agentsDeployed: 0,
    codeCoverage: 0,
    estimatedCompletion: 0
  });
  const [tasks, setTasks] = useState([]);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [responseTimeHistory, setResponseTimeHistory] = useState([]);

  // Calculate metrics from current state
  const calculateMetrics = () => {
    const activeSessions = sessions.filter(s => s.active !== false);
    const totalInput = activeSessions.reduce((sum, s) => sum + (s.tokenUsage?.input || 0), 0);
    const totalOutput = activeSessions.reduce((sum, s) => sum + (s.tokenUsage?.output || 0), 0);
    const totalTokens = totalInput + totalOutput;
    
    const completedTasks = tasks.filter(t => t.status === 'success' || t.status === 'failed').length;
    const pendingTasks = tasks.filter(t => t.status === 'in_progress').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const totalTasks = tasks.length;
    
    const successRate = totalTasks > 0 ? ((completedTasks - failedTasks) / totalTasks * 100) : 100;
    const errorRate = totalTasks > 0 ? (failedTasks / totalTasks * 100) : 0;
    
    // Calculate average response time from history
    const avgResponseTime = responseTimeHistory.length > 0
      ? responseTimeHistory.reduce((sum, t) => sum + t, 0) / responseTimeHistory.length / 1000
      : 1.2;
    
    // Calculate cost estimate (rough: $15 per 1M tokens)
    const costEstimate = (totalTokens / 1000000) * 15;
    
    // Calculate average tokens per second
    const uptime = (Date.now() - metrics.startTime) / 1000; // seconds
    const avgSpeed = uptime > 0 ? Math.round(totalTokens / uptime) : 0;
    
    // Project metrics
    const projectProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const estimatedCompletion = pendingTasks > 0 && avgResponseTime > 0 
      ? (pendingTasks * avgResponseTime / 3600) 
      : 0;

    return {
      totalTokens,
      totalRequests: metrics.totalRequests,
      activeAgents: activeSessions.length,
      startTime: metrics.startTime,
      inputTokens: totalInput,
      outputTokens: totalOutput,
      avgResponseTime,
      cacheHitRate: Math.min(100, 60 + (activeSessions.length * 5)), // Simulated
      errorRate: Math.min(100, errorRate),
      peakMemory: Math.max(1.5, activeSessions.length * 0.7), // Simulated
      completedTasks,
      pendingTasks,
      idleAgents: Math.max(0, 5 - activeSessions.length), // Simulated based on max 5 agents
      costEstimate,
      successRate: Math.max(0, Math.min(100, successRate)),
      avgSpeed
    };
  };

  // Auto-refresh metrics every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = calculateMetrics();
      setMetrics(newMetrics);
      
      // Update project metrics
      setProject(prev => ({
        ...prev,
        progress: Math.min(100, Math.round((newMetrics.completedTasks / Math.max(1, tasks.length)) * 100)),
        tasksCompleted: newMetrics.completedTasks,
        totalTasks: tasks.length,
        agentsDeployed: sessions.length,
        codeCoverage: Math.min(100, 60 + (newMetrics.completedTasks * 2)), // Simulated
        estimatedCompletion: newMetrics.pendingTasks > 0 
          ? (newMetrics.pendingTasks * newMetrics.avgResponseTime / 3600).toFixed(1)
          : 0
      }));
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [sessions, tasks, responseTimeHistory]);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to monitoring server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const timestamp = Date.now();
      
      switch (message.type) {
        case 'session_start':
          setSessions(prev => [...prev, {
            ...message.data,
            active: true,
            startTime: timestamp
          }]);
          setMetrics(prev => ({
            ...prev,
            totalRequests: prev.totalRequests + 1
          }));
          break;

        case 'token_update':
          const requestTime = timestamp - (message.data.startTime || timestamp);
          setResponseTimeHistory(prev => [...prev, requestTime].slice(-20)); // Keep last 20
          
          setMetrics(prev => ({
            ...prev,
            totalRequests: prev.totalRequests + 1
          }));
          
          setTokenHistory(prev => [
            ...prev,
            {
              timestamp,
              input: message.data.tokenUsage.input,
              output: message.data.tokenUsage.output,
              total: message.data.tokenUsage.total,
              sessionId: message.data.sessionId
            }
          ].slice(-50));
          
          setSessions(prev => prev.map(session => 
            session.id === message.data.sessionId
              ? { 
                  ...session, 
                  tokenUsage: {
                    input: (session.tokenUsage?.input || 0) + message.data.tokenUsage.input,
                    output: (session.tokenUsage?.output || 0) + message.data.tokenUsage.output,
                    total: (session.tokenUsage?.total || 0) + message.data.tokenUsage.total
                  },
                  lastActivity: timestamp
                }
              : session
          ));
          break;

        case 'task_start':
          setTasks(prev => [...prev, {
            ...message.data.task,
            sessionId: message.data.sessionId,
            startTime: timestamp
          }]);
          break;

        case 'task_complete':
          setTasks(prev => prev.map(task =>
            task.id === message.data.taskId
              ? { 
                  ...task, 
                  status: message.data.status,
                  endTime: timestamp,
                  duration: message.data.duration || (timestamp - task.startTime)
                }
              : task
          ));
          break;

        case 'session_end':
          setSessions(prev => prev.map(session =>
            session.id === message.data.sessionId
              ? { ...session, active: false, endTime: timestamp }
              : session
          ));
          break;

        case 'error':
          console.error('Error from Claude:', message.data);
          setTasks(prev => [
            ...prev,
            {
              id: `error-${timestamp}`,
              sessionId: message.data.sessionId,
              description: message.data.errorMessage,
              status: 'failed',
              priority: message.data.severity,
              startTime: timestamp
            }
          ]);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from monitoring server');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-claude-orange to-orange-400 bg-clip-text text-transparent">
                Claude Monitor Dashboard
              </h1>
              <p className="text-gray-400">Real-time monitoring for Claude & Claude Code • Auto-refresh: 3s</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="text-gray-400">Last Update</div>
                <div className="font-mono text-xs">{new Date().toLocaleTimeString()}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-400">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Project */}
        <ProjectOverview project={project} />

        {/* Metrics Overview - 16 Panels */}
        <MetricsOverview metrics={metrics} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <TokenChart data={tokenHistory} />
          <AgentDistributionChart sessions={sessions.filter(s => s.active !== false)} />
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics metrics={metrics} responseHistory={responseTimeHistory} />

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Active Sessions ({sessions.filter(s => s.active !== false).length})
          </h2>
          {sessions.filter(s => s.active !== false).length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No active sessions. Waiting for Claude to connect...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.filter(s => s.active !== false).map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="mb-8">
          <TaskList tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
