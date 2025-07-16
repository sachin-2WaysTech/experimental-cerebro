import React, { useState } from 'react';
import { Controls, ControlButton } from '@xyflow/react';
import type { LayoutAlgorithm } from '../../utils/layoutUtils';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Circle, Crosshair, Grid, Layers, Network, Sun, Zap, FolderOpen } from 'lucide-react';
import WorkflowManager from '@/components/WorkflowManager';

interface WorkflowControlsProps {
  onAutoArrange: (algorithm: LayoutAlgorithm) => void;
}

const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  onAutoArrange,
}) => {
  const [showWorkflowManager, setShowWorkflowManager] = useState(false);

  return (
    <>
      <Controls position="bottom-right" className="bg-glassmorphic rounded-lg border border-white/10 z-[1000] !bottom-20 !right-4">
        {/* Workflow Manager Button */}
        <ControlButton
          onClick={() => setShowWorkflowManager(true)}
          title="Workflow Manager"
          className="!bg-purple-600 !text-white hover:!bg-purple-700"
        >
          <FolderOpen size={10} />
        </ControlButton>

        {/* Auto-arrange dropdown */}
        <div className="flex items-center">
          <div className="relative group">
            <ControlButton
              title="Auto Arrange"
              className="!bg-blue-500 !text-white hover:!bg-blue-600"
            >
              <Network size={10} />
            </ControlButton>

            {/* Dropdown menu */}
            <div className="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Layout Algorithms</div>

                <button
                  onClick={() => onAutoArrange('dagre-tb')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <ArrowDown size={14} />
                  <span>Dagre Top-Bottom</span>
                </button>

                <button
                  onClick={() => onAutoArrange('dagre-lr')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <ArrowRight size={14} />
                  <span>Dagre Left-Right</span>
                </button>

                <button
                  onClick={() => onAutoArrange('dagre-bt')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <ArrowUp size={14} />
                  <span>Dagre Bottom-Top</span>
                </button>

                <button
                  onClick={() => onAutoArrange('dagre-rl')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <ArrowLeft size={14} />
                  <span>Dagre Right-Left</span>
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => onAutoArrange('force')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Zap size={14} />
                  <span>Force Layout</span>
                </button>

                <button
                  onClick={() => onAutoArrange('grid')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Grid size={14} />
                  <span>Grid Layout</span>
                </button>

                <button
                  onClick={() => onAutoArrange('circular')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Circle size={14} />
                  <span>Circular Layout</span>
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => onAutoArrange('elkjs-layered')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Layers size={14} />
                  <span>ELK Layered</span>
                </button>

                <button
                  onClick={() => onAutoArrange('elkjs-force')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Zap size={14} />
                  <span>ELK Force</span>
                </button>

                <button
                  onClick={() => onAutoArrange('elkjs-stress')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Crosshair size={14} />
                  <span>ELK Stress</span>
                </button>

                <button
                  onClick={() => onAutoArrange('elkjs-radial')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                >
                  <Sun size={14} />
                  <span>ELK Radial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Controls>

      {/* Workflow Manager Modal */}
      <WorkflowManager
        isOpen={showWorkflowManager}
        onClose={() => setShowWorkflowManager(false)}
      />
    </>
  );
};

export default WorkflowControls;
