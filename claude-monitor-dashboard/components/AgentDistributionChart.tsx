'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Session {
  id: string;
  agentName: string;
  model: string;
  active: boolean;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

export default function AgentDistributionChart({ sessions }: { sessions: Session[] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Token Distribution by Agent</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No agent data yet
        </div>
      </div>
    );
  }

  // Filter sessions with token usage
  const sessionsWithTokens = sessions.filter(s => s.tokenUsage && s.tokenUsage.total > 0);

  if (sessionsWithTokens.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Token Distribution by Agent</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No token data for agents yet
        </div>
      </div>
    );
  }

  // Group by agent name and sum tokens
  const agentTokens: { [key: string]: number } = {};
  sessionsWithTokens.forEach(session => {
    const key = `${session.agentName} (${session.model})`;
    if (!agentTokens[key]) {
      agentTokens[key] = 0;
    }
    agentTokens[key] += session.tokenUsage!.total;
  });

  // Convert to arrays for chart
  const labels = Object.keys(agentTokens);
  const values = Object.values(agentTokens);

  // Generate vibrant colors
  const colors = [
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#14b8a6', // teal
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9CA3AF',
          padding: 12,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} tokens (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Token Distribution by Agent</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      <div style={{ height: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
