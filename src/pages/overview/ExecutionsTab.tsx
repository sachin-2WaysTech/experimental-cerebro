import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import Button from '@/components/Button';

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: Date;
  finishedAt?: Date;
  duration?: number;
  totalNodes: number;
  completedNodes: number;
  errorMessage?: string;
}

const ExecutionsTab: React.FC = () => {
  const [executions] = useState<Execution[]>([]); // This will be connected to a store later
  const [filter, setFilter] = useState<'all' | 'running' | 'success' | 'failed'>('all');

  const getStatusIcon = (status: Execution['status']) => {
    switch (status) {
      case 'running':
        return <Icons.Loader2 size={16} className="text-blue-400 animate-spin" />;
      case 'success':
        return <Icons.CheckCircle size={16} className="text-green-400" />;
      case 'failed':
        return <Icons.XCircle size={16} className="text-red-400" />;
      case 'cancelled':
        return <Icons.StopCircle size={16} className="text-gray-400" />;
      default:
        return <Icons.Circle size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: Execution['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-400 bg-blue-400/10';
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'cancelled':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const filteredExecutions = executions.filter(execution => {
    if (filter === 'all') return true;
    return execution.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Executions</h2>
          <p className="text-gray-400 mt-1">Monitor your workflow execution history</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {/* TODO: Implement refresh */ }}
            variant="outline"
            className="px-4 py-2 flex items-center gap-2"
          >
            <Icons.RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-[#2a2a2a] p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All', count: executions.length },
          { key: 'running', label: 'Running', count: executions.filter(e => e.status === 'running').length },
          { key: 'success', label: 'Success', count: executions.filter(e => e.status === 'success').length },
          { key: 'failed', label: 'Failed', count: executions.filter(e => e.status === 'failed').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'all' | 'running' | 'success' | 'failed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#333]'
              }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Executions List */}
      {filteredExecutions.length > 0 ? (
        <div className="space-y-4">
          {filteredExecutions.map((execution) => (
            <div
              key={execution.id}
              className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 hover:bg-[#333] transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getStatusIcon(execution.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{execution.workflowName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(execution.status)}`}>
                        {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Execution ID: {execution.id}</p>
                    {execution.errorMessage && (
                      <p className="text-red-400 text-sm mt-1">{execution.errorMessage}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-white p-2" title="View Details">
                    <Icons.Eye size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-white p-2" title="View Logs">
                    <Icons.FileText size={16} />
                  </button>
                  {execution.status === 'running' && (
                    <button className="text-gray-400 hover:text-red-400 p-2" title="Cancel">
                      <Icons.StopCircle size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Started</span>
                  <p className="text-white">{new Date(execution.startedAt).toLocaleString()}</p>
                </div>
                {execution.finishedAt && (
                  <div>
                    <span className="text-gray-400">Finished</span>
                    <p className="text-white">{new Date(execution.finishedAt).toLocaleString()}</p>
                  </div>
                )}
                {execution.duration && (
                  <div>
                    <span className="text-gray-400">Duration</span>
                    <p className="text-white">{formatDuration(execution.duration)}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Progress</span>
                  <div className="flex items-center gap-2">
                    <p className="text-white">{execution.completedNodes}/{execution.totalNodes}</p>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${(execution.completedNodes / execution.totalNodes) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icons.Activity size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'No executions yet' : `No ${filter} executions`}
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all'
              ? 'Workflow executions will appear here when you run your flows'
              : `No executions with ${filter} status found`
            }
          </p>
          {filter !== 'all' && (
            <Button
              onClick={() => setFilter('all')}
              variant="outline"
              className="px-4 py-2"
            >
              View All Executions
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionsTab;
