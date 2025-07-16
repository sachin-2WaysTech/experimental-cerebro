import React from 'react';
import { Handle, Position, useConnection } from '@xyflow/react';
import type { ConnectionState, NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { NodeData, NodeType } from '@/service/nodeService';
import { ButtonHandle } from '@/components/button-handle';

interface CustomNodeProps extends NodeProps {
  data: NodeData & Record<string, unknown>;
  onNodeDragStart?: (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => void;
  onNodeDblClick?: (nodeType: NodeType) => void;
  onCreateNodeWithConnection?: (nodeType: NodeType, sourceNodeId: string, sourceHandle: string) => void;
  onOpenNodeSelectionModal?: (sourceNodeId: string, sourceHandle: string) => void;
  connectedEdges?: Array<{ source: string; target: string; sourceHandle?: string; targetHandle?: string }>;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  onOpenNodeSelectionModal,
  connectedEdges = []
}) => {
  const { nodeType } = data;

  const selector = (connection: ConnectionState) => {
    return connection.inProgress;
  };

  const connectionInProgress = useConnection(selector);

  // Check if an output handle is already connected
  const isOutputConnected = (outputIndex: number) => {
    const handleId = `output-${outputIndex}`;
    return connectedEdges.some(edge =>
      edge.source === data.id && edge.sourceHandle === handleId
    );
  };
  console.log('CustomNode data:', data);

  // Check if connection is in progress

  const getIcon = (iconName: string) => {
    const iconKey = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const IconsMap = Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
    return IconsMap[iconKey] || Icons.Circle;
  };

  const IconComponent = getIcon(nodeType.icon);

  // Handle add new output - show modal for node selection
  const handleAddOutput = (outputIndex: number) => {
    console.log('Add new output clicked for node:', data.id, 'output:', outputIndex);
    if (onOpenNodeSelectionModal) {
      onOpenNodeSelectionModal(data.id, `output-${outputIndex}`);
    }
  };

  return (
    <>
      <div className="relative">
        {nodeType.inputs.map((_, index) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Top}
            id={`input-${index}`}
            style={{
              left: nodeType.inputs.length > 1 ? `${((index + 1) / (nodeType.inputs.length + 1)) * 100}%` : '50%'
            }}
            className="w-10 h-10 rounded-full border-2 border-gray-400 bg-white z-10"
          />
        ))}

        <div
          className={`relative w-full rounded-lg shadow-lg transition-all duration-200 bg-[#313131] text-brand-gradient min-w-50`}
        >
          <div
            className="px-3 py-2 rounded-t-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: nodeType.icon_color }}
              >
                <IconComponent size={16} className="text-white" />
              </div>

              <h3 className="font-semibold text-sm text-gray-800">
                {nodeType.display_name}
              </h3>
            </div>
          </div>
        </div>

        {nodeType.outputs.map((_, index) => (
          <ButtonHandle
            key={`output-${index}`}
            id={`output-${index}`}
            type="source"
            className="w-3 h-3 rounded-full border-2 border-gray-400 bg-white"
            position={Position.Bottom}
            showButton={!connectionInProgress && !isOutputConnected(index)}
            style={{
              left: nodeType.outputs.length > 1 ? `${((index + 1) / (nodeType.outputs.length + 1)) * 100}%` : '50%'
            }}
          >
            <Icons.PlusCircleIcon
              size={20}
              className='text-gray-400 cursor-pointer'
              onClick={() => handleAddOutput(index)}
            />
          </ButtonHandle>

        ))}

        {nodeType.output_names && nodeType.output_names.length > 1 && (
          <div className="absolute top-full mt-1 w-full flex justify-between text-[10px] text-gray-500">
            {nodeType.output_names.map((name, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-[#282828] rounded "
                style={{
                  // left: `${((index + 1) / (nodeType.output_names!.length + 1)) * 100}%`,
                  // transform: 'translateX(-50%)'
                  left: nodeType.outputs.length > 1 ? `${((index + 1) / (nodeType.outputs.length + 1)) * 100}%` : '50%'
                }}
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CustomNode;
