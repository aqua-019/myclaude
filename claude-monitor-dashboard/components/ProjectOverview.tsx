export default function ProjectOverview({ project }) {
  return (
    <div className="mb-8 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-6 border-2 border-indigo-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{project.name}</h2>
          <p className="text-indigo-200 text-sm">{project.description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-indigo-200">{project.progress}%</div>
          <div className="text-xs text-indigo-300">Complete</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-black/20 rounded p-3">
          <div className="text-indigo-300 text-xs mb-1">Tasks Completed</div>
          <div className="text-2xl font-bold">{project.tasksCompleted}/{project.totalTasks}</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-indigo-300 text-xs mb-1">Agents Deployed</div>
          <div className="text-2xl font-bold">{project.agentsDeployed}</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-indigo-300 text-xs mb-1">Code Coverage</div>
          <div className="text-2xl font-bold">{project.codeCoverage}%</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-indigo-300 text-xs mb-1">Est. Completion</div>
          <div className="text-2xl font-bold">{project.estimatedCompletion}h</div>
        </div>
      </div>
      
      <div className="w-full bg-black/30 rounded-full h-3 relative">
        <div 
          className="bg-gradient-to-r from-indigo-400 to-purple-400 h-3 rounded-full transition-all flex items-center justify-end pr-2" 
          style={{ width: `${project.progress}%` }}
        >
          <span className="text-xs font-bold text-white">{project.progress}%</span>
        </div>
      </div>
    </div>
  );
}
