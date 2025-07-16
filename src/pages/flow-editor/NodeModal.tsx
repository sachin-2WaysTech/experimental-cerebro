import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { NodeData } from '../../service/nodeService';
import NodeParametersForm from './NodeParametersForm';

interface NodeModalProps {
  node: NodeData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (parameters: Record<string, unknown>) => void;
  connectedNodes: {
    inputs: (NodeData & Record<string, unknown>)[];
    outputs: (NodeData & Record<string, unknown>)[];
  };
}

const NodeModal: React.FC<NodeModalProps> = ({
  node,
  isOpen,
  onClose,
  onSave,
  connectedNodes
}) => {
  const [activeTab, setActiveTab] = useState<'inputs' | 'parameters' | 'outputs'>('parameters');

  if (!isOpen) return null;

  const handleSave = (parameters: Record<string, unknown>) => {
    onSave(parameters);
    onClose();
  };

  const getIcon = (iconName: string) => {
    const iconKey = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const IconsMap = Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
    return IconsMap[iconKey] || Icons.Circle;
  };

  const IconComponent = getIcon(node.nodeType.icon);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: node.nodeType.icon_color }}
            >
              <IconComponent size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {node.label || node.nodeType.display_name}
              </h2>
              <p className="text-sm text-gray-500">
                {node.nodeType.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icons.X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('inputs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inputs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Inputs ({connectedNodes.inputs.length})
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'parameters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Parameters ({node.nodeType.parameters.length})
            </button>
            <button
              onClick={() => setActiveTab('outputs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'outputs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Outputs ({connectedNodes.outputs.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex h-[60vh]">
          {/* Left Panel - Previous Nodes */}
          <div className="w-1/3 p-6 border-r border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Previous Nodes</h3>
            <div className="space-y-3">
              {connectedNodes.inputs.length > 0 ? (
                connectedNodes.inputs.map((inputNode, index) => {
                  const InputIcon = getIcon(inputNode.nodeType.icon);
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: inputNode.nodeType.icon_color }}
                      >
                        <InputIcon size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {inputNode.label || inputNode.nodeType.display_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {inputNode.nodeType.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No connected input nodes</p>
              )}
            </div>
          </div>

          {/* Center Panel - Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'inputs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Input Data</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 overflow-x-auto">
                    {JSON.stringify(node.executionData?.output || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Node Parameters</h3>
                <NodeParametersForm
                  node={node}
                  onSave={handleSave}
                  onCancel={onClose}
                />
              </div>
            )}

            {activeTab === 'outputs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Execution Output</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 overflow-x-auto">
                    {JSON.stringify(node.executionData?.output || {}, null, 2)}
                  </pre>
                </div>
                {node.executionData?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icons.AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-800">{node.executionData.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Next Nodes */}
          <div className="w-1/3 p-6 border-l border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Next Nodes</h3>
            <div className="space-y-3">
              {connectedNodes.outputs.length > 0 ? (
                connectedNodes.outputs.map((outputNode, index) => {
                  const OutputIcon = getIcon(outputNode.nodeType.icon);
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: outputNode.nodeType.icon_color }}
                      >
                        <OutputIcon size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {outputNode.label || outputNode.nodeType.display_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {outputNode.nodeType.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No connected output nodes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeModal;
