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
  agentName: string;
  tokenUsage?: {
    total?: number;
  };
}

export default function AgentDistributionChart({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Token Distribution by Agent</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No agent data yet
        </div>
      </div>
    );
  }

  const data = {
    labels: sessions.map(s => s.agentName),
    datasets: [{
      data: sessions.map(s => s.tokenUsage?.total || 0),
      backgroundColor: [
        '#FF6B35',
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#8B5CF6',
        '#EC4899',
        '#14B8A6',
        '#F97316'
      ],
      borderColor: '#1F2937',
      borderWidth: 3
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9CA3AF',
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.toLocaleString() + ' tokens';
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Token Distribution by Agent</h2>
      <div style={{ height: '300px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
