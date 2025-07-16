import React from 'react';
import * as Icons from 'lucide-react';

const WorkflowsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Workflows</h2>
          <p className="text-gray-400 mt-1">Manage your automation workflows</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <Icons.Workflow size={64} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Workflow store removed</h3>
        <p className="text-gray-400 mb-6">The workflow management system has been disabled for standalone operation</p>
      </div>
    </div>
  );
};

export default WorkflowsTab;
