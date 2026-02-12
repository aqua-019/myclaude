export default function MetricsOverview({ metrics }) {
  const uptime = Date.now() - metrics.startTime;
  const uptimeHours = Math.floor(uptime / 3600000);
  const uptimeMinutes = Math.floor((uptime % 3600000) / 60000);

  const panels = [
    { label: 'Total Tokens', value: (metrics.totalTokens / 1000).toFixed(1) + 'K', change: '↑ 12%', gradient: 'from-orange-500 to-orange-600' },
    { label: 'API Calls', value: metrics.totalRequests, change: '↑ 8%', gradient: 'from-blue-500 to-blue-700' },
    { label: 'Active Agents', value: metrics.activeAgents, change: '→ 0%', gradient: 'from-green-500 to-green-700' },
    { label: 'Uptime', value: `${uptimeHours}h ${uptimeMinutes}m`, change: '99.9%', gradient: 'from-purple-500 to-purple-700' },
    { label: 'Avg Response', value: (metrics.avgResponseTime || 1.2).toFixed(1) + 's', change: '↓ 15%', gradient: 'from-pink-500 to-pink-700' },
    { label: 'Cache Hits', value: (metrics.cacheHitRate || 78) + '%', change: '↑ 5%', gradient: 'from-cyan-500 to-cyan-700' },
    { label: 'Error Rate', value: (metrics.errorRate || 0.3).toFixed(1) + '%', change: '↓ 0.2%', gradient: 'from-yellow-500 to-yellow-700' },
    { label: 'Peak Memory', value: (metrics.peakMemory || 2.1).toFixed(1) + 'GB', change: '↑ 3%', gradient: 'from-red-500 to-red-700' },
    { label: 'Input Tokens', value: (metrics.inputTokens / 1000).toFixed(1) + 'K', change: '59.5%', gradient: 'from-indigo-500 to-indigo-700' },
    { label: 'Output Tokens', value: (metrics.outputTokens / 1000).toFixed(1) + 'K', change: '40.5%', gradient: 'from-teal-500 to-teal-700' },
    { label: 'Completed', value: metrics.completedTasks, change: 'Tasks', gradient: 'from-lime-500 to-lime-700' },
    { label: 'Pending', value: metrics.pendingTasks, change: 'Tasks', gradient: 'from-amber-500 to-amber-700' },
    { label: 'Agents Idle', value: metrics.idleAgents || 2, change: 'Ready', gradient: 'from-violet-500 to-violet-700' },
    { label: 'Cost Est.', value: '$' + (metrics.costEstimate || 2.34).toFixed(2), change: 'Today', gradient: 'from-fuchsia-500 to-fuchsia-700' },
    { label: 'Success Rate', value: (metrics.successRate || 97.2).toFixed(1) + '%', change: '↑ 1.1%', gradient: 'from-rose-500 to-rose-700' },
    { label: 'Avg Speed', value: metrics.avgSpeed || 203, change: 'tok/sec', gradient: 'from-sky-500 to-sky-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
      {panels.map((panel, index) => (
        <div key={index} className={`bg-gradient-to-br ${panel.gradient} rounded-lg p-4 shadow-lg`}>
          <div className="text-white/80 text-xs mb-1">{panel.label}</div>
          <div className="text-2xl font-bold">{panel.value}</div>
          <div className="text-xs text-white/60 mt-1">{panel.change}</div>
        </div>
      ))}
    </div>
  );
}
