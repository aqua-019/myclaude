interface Task {
  id: string;
  description: string;
  status: string;
  priority: string;
  sessionId?: string;
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'success' || t.status === 'failed');

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      
      {tasks.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-blue-400">Active Tasks ({activeTasks.length})</h3>
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <div key={task.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl ${getPriorityColor(task.priority)}`}>●</span>
                        <h4 className="font-semibold">{task.description}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>ID: {task.id}</span>
                      <span>Priority: {task.priority}</span>
                      <span>Started: {new Date(task.startTime).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-400">Recent Completed ({completedTasks.slice(-5).length})</h3>
              <div className="space-y-2">
                {completedTasks.slice(-5).reverse().map(task => (
                  <div key={task.id} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.description}</h4>
                        <div className="text-xs text-gray-500 mt-1">
                          Duration: {task.duration ? `${(task.duration / 1000).toFixed(1)}s` : 'N/A'}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
