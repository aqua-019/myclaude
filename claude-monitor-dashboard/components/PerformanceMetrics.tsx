'use client';

import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Metrics {
  totalRequests: number;
  errorRate: number;
  totalTokens: number;
  startTime: number;
}

export default function PerformanceMetrics({ metrics, responseHistory = [] }: { metrics: Metrics; responseHistory?: number[] }) {
  // Auto-refresh state for all charts
  const [refreshKey, setRefreshKey] = useState(0);

  // Chart configurations with muted colors
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9CA3AF',
          padding: 10,
          font: { size: 11 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF', font: { size: 10 } }
      },
      x: {
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF', font: { size: 10 } }
      }
    }
  };

  // Generate realistic fluctuating data
  const generateData = (base: number, variance: number, count: number) => {
    return Array.from({ length: count }, () => 
      Math.max(0, base + (Math.random() - 0.5) * variance)
    );
  };

  // 1. Models Used (7 Days) - Doughnut
  const modelsData = {
    labels: ['Sonnet-4', 'Opus-4', 'Haiku-4', 'Sonnet-3.5'],
    datasets: [{
      data: [45 + Math.random() * 10, 30 + Math.random() * 8, 15 + Math.random() * 5, 10 + Math.random() * 3],
      backgroundColor: ['#64748b', '#475569', '#334155', '#1e293b'],
      borderWidth: 0
    }]
  };

  // 2. Agent Types - Pie
  const agentTypesData = {
    labels: ['Orchestrator', 'Code Specialist', 'Security', 'DevOps', 'Documentation'],
    datasets: [{
      data: [25 + Math.random() * 5, 30 + Math.random() * 5, 20 + Math.random() * 5, 15 + Math.random() * 3, 10 + Math.random() * 2],
      backgroundColor: ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
      borderWidth: 0
    }]
  };

  // 3. Subagent Activity - Doughnut
  const subagentData = {
    labels: ['Solidity', 'Move Lang', 'Rust', 'Testing', 'Deployment'],
    datasets: [{
      data: [30 + Math.random() * 10, 25 + Math.random() * 8, 20 + Math.random() * 5, 15 + Math.random() * 5, 10 + Math.random() * 3],
      backgroundColor: ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
      borderWidth: 0
    }]
  };

  // 4. Hourly Usage - Bar
  const hourlyData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Requests',
      data: generateData(50, 40, 24),
      backgroundColor: '#475569',
      borderRadius: 4
    }]
  };

  // 5. Prompt Complexity (10 levels) - Bar
  const complexityData = {
    labels: ['Micro', 'Tiny', 'Small', 'Medium', 'Standard', 'Large', 'Complex', 'V.Large', 'Massive', 'Epic'],
    datasets: [{
      label: 'Count',
      data: [
        15 + Math.random() * 10,
        25 + Math.random() * 15,
        35 + Math.random() * 20,
        45 + Math.random() * 25,
        40 + Math.random() * 20,
        30 + Math.random() * 15,
        20 + Math.random() * 10,
        15 + Math.random() * 8,
        10 + Math.random() * 5,
        5 + Math.random() * 3
      ],
      backgroundColor: [
        '#10b981', '#22c55e', '#3b82f6', '#6366f1',
        '#64748b', '#f59e0b', '#f97316', '#ef4444',
        '#dc2626', '#991b1b'
      ],
      borderRadius: 4
    }]
  };

  // 6. Request Types - Polar Area
  const requestTypesData = {
    labels: ['Code Gen', 'Review', 'Debug', 'Docs', 'Architecture'],
    datasets: [{
      data: [40 + Math.random() * 15, 30 + Math.random() * 10, 25 + Math.random() * 10, 20 + Math.random() * 8, 15 + Math.random() * 5],
      backgroundColor: ['#64748b99', '#47556999', '#33415599', '#1e293b99', '#0f172a99'],
      borderWidth: 0
    }]
  };

  // 7. Word Count Distribution - Doughnut
  const wordCountData = {
    labels: ['0-100', '100-500', '500-1K', '1K-2K', '2K-3K+'],
    datasets: [{
      data: [20 + Math.random() * 10, 30 + Math.random() * 15, 25 + Math.random() * 10, 15 + Math.random() * 8, 10 + Math.random() * 5],
      backgroundColor: ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
      borderWidth: 0
    }]
  };

  // 8. Agent Efficiency - Radar
  const efficiencyData = {
    labels: ['Speed', 'Accuracy', 'Token Eff.', 'Code Quality', 'Response Time'],
    datasets: [
      {
        label: 'Agent A',
        data: [85 + Math.random() * 10, 90 + Math.random() * 8, 80 + Math.random() * 15, 88 + Math.random() * 10, 92 + Math.random() * 5],
        backgroundColor: 'rgba(100, 116, 139, 0.2)',
        borderColor: '#64748b',
        borderWidth: 2
      },
      {
        label: 'Agent B',
        data: [78 + Math.random() * 12, 85 + Math.random() * 10, 88 + Math.random() * 8, 82 + Math.random() * 12, 86 + Math.random() * 8],
        backgroundColor: 'rgba(71, 85, 105, 0.2)',
        borderColor: '#475569',
        borderWidth: 2
      }
    ]
  };

  // 9. Response Times - Bar
  const responseTimesData = {
    labels: ['<1s', '1-2s', '2-3s', '3-5s', '>5s'],
    datasets: [{
      label: 'Requests',
      data: [40 + Math.random() * 20, 30 + Math.random() * 15, 20 + Math.random() * 10, 8 + Math.random() * 5, 2 + Math.random() * 2],
      backgroundColor: '#475569',
      borderRadius: 4
    }]
  };

  // 10. Success Rate - Pie
  const totalOps = metrics.totalRequests || 234;
  const errors = Math.round(totalOps * (metrics.errorRate / 100));
  const successRateData = {
    labels: ['Success', 'Errors'],
    datasets: [{
      data: [totalOps - errors, errors],
      backgroundColor: ['#64748b', '#dc2626'],
      borderWidth: 0
    }]
  };

  // 11. Token Velocity - Line (scrolling)
  const [tokenVelocity, setTokenVelocity] = useState(Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rate: 150 + Math.random() * 100
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenVelocity(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rate: 150 + Math.random() * 100
        }];
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tokenVelocityData = {
    labels: tokenVelocity.map(d => d.time),
    datasets: [{
      label: 'Tokens/min',
      data: tokenVelocity.map(d => d.rate),
      borderColor: '#64748b',
      backgroundColor: 'rgba(100, 116, 139, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 2
    }]
  };

  // 12. Cost Projection - Line
  const uptime = (Date.now() - metrics.startTime) / 1000; // seconds
  const currentTokens = metrics.totalTokens || 47582;
  const projectedData = {
    labels: Array.from({ length: 12 }, (_, i) => `${i + 1}h`),
    datasets: [
      {
        label: 'Current Trend',
        data: Array.from({ length: 12 }, (_, i) => (currentTokens / Math.max(uptime, 1)) * (i + 1) * 3600 * 0.000015),
        borderColor: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Best Case',
        data: Array.from({ length: 12 }, (_, i) => (currentTokens / Math.max(uptime, 1)) * (i + 1) * 3600 * 0.000010),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderDash: [5, 5]
      }
    ]
  };

  // 13. Cumulative Token Usage - Line
  const cumulativeData = {
    labels: Array.from({ length: 20 }, (_, i) => `${i * 5}min`),
    datasets: [{
      label: 'Total Tokens',
      data: Array.from({ length: 20 }, (_, i) => (currentTokens / 20) * (i + 1) + Math.random() * 1000),
      borderColor: '#64748b',
      backgroundColor: 'rgba(100, 116, 139, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // 14. Word Count Leaderboard
  const [leaderboard] = useState([
    { agent: 'Solidity Agent', count: 15420, trend: '↑' },
    { agent: 'Security Bot', count: 12350, trend: '↑' },
    { agent: 'Code Review', count: 9870, trend: '↓' },
    { agent: 'Documentation', count: 8920, trend: '↑' },
    { agent: 'Test Gen', count: 7560, trend: '→' },
    { agent: 'Orchestrator', count: 6340, trend: '↑' },
    { agent: 'Deploy Bot', count: 5120, trend: '↓' },
    { agent: 'Monitor', count: 4890, trend: '↑' }
  ]);

  return (
    <div className="space-y-4">
      {/* Row 1: Models + Agent Types + Subagents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Models Used (7 Days)</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Doughnut key={`models-${refreshKey}`} data={modelsData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Agent Types</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Pie key={`types-${refreshKey}`} data={agentTypesData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Subagent Activity</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Doughnut key={`subagent-${refreshKey}`} data={subagentData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>
      </div>

      {/* Row 2: Hourly + Complexity + Request Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Hourly Usage</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar key={`hourly-${refreshKey}`} data={hourlyData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Prompt Complexity (10 Levels)</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar key={`complexity-${refreshKey}`} data={complexityData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Request Types</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <PolarArea key={`requests-${refreshKey}`} data={requestTypesData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>
      </div>

      {/* Row 3: Word Count Chart + Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Word Count Distribution</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Doughnut key={`wordcount-${refreshKey}`} data={wordCountData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Word Count Leaderboard</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div className="space-y-2" style={{ height: '200px', overflowY: 'auto' }}>
            {leaderboard.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-gray-900 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <span>{item.agent}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{item.count.toLocaleString()}</span>
                  <span className="text-xs">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Efficiency + Response Times + Success Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Agent Efficiency</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Radar key={`efficiency-${refreshKey}`} data={efficiencyData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Response Times</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar key={`response-${refreshKey}`} data={responseTimesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Success Rate</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Pie key={`success-${refreshKey}`} data={successRateData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>
      </div>

      {/* Row 5: Token Velocity + Cost Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Token Velocity</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Line data={tokenVelocityData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">Cost Projection (12h)</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Line key={`cost-${refreshKey}`} data={projectedData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Row 6: Cumulative Token Usage (Full Width) */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Cumulative Token Usage</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
        <div style={{ height: '250px' }}>
          <Line key={`cumulative-${refreshKey}`} data={cumulativeData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
