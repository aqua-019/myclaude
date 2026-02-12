interface Session {
  agentName: string;
  startTime: number;
  model: string;
  tokenUsage: {
    total: number;
    input: number;
    output: number;
  };
}

export default function SessionCard({ session }: { session: Session }) {
  const uptime = Date.now() - session.startTime;
  const uptimeMinutes = Math.floor(uptime / 60000);
  const uptimeSeconds = Math.floor((uptime % 60000) / 1000);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-claude-orange transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-claude-orange">{session.agentName}</h3>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
          Active
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Model:</span>
          <span className="font-mono">{session.model}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime:</span>
          <span className="font-mono">{uptimeMinutes}m {uptimeSeconds}s</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Total Tokens:</span>
          <span className="font-mono">{session.tokenUsage.total.toLocaleString()}</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Input: {session.tokenUsage.input.toLocaleString()}</span>
            <span className="text-gray-500">Output: {session.tokenUsage.output.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Active Tasks: {session.tasks.length}</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-claude-orange h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(100, (session.tasks.length / 10) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
