import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WorkflowEditor from './WorkflowEditor';
import { getWorkflowById, getNodeTypes } from '../../service/commonService';
import { convertWorkflowToReactFlow } from '../../utils/workflowConverter';
import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../../service/nodeService';

interface FlowEditorProps {
  initialNodes?: Node<NodeData & Record<string, unknown>>[];
  initialEdges?: Edge[];
  initialNodeCounter?: number;
}

const FlowEditor: React.FC<FlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  initialNodeCounter = 1,
}) => {
  const { flowId } = useParams<{ flowId: string }>();
  const [workflowData, setWorkflowData] = useState<{
    nodes: Node<NodeData & Record<string, unknown>>[];
    edges: Edge[];
    nodeCounter: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!flowId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch workflow data and node types in parallel
        const [workflow, nodeTypes] = await Promise.all([
          getWorkflowById(flowId),
          getNodeTypes(),
        ]);

        if (!workflow) {
          setError('Workflow not found');
          return;
        }
        console.log("Workflow data:", workflow);
        console.log("Node types:", nodeTypes);

        // Convert API workflow data to ReactFlow format
        const convertedData = convertWorkflowToReactFlow(workflow, nodeTypes);
        console.log("Converted data:", convertedData);
        setWorkflowData(convertedData);

        // Log workflow loading info for debugging
        console.log('Loaded workflow:', workflow.name, {
          hasNodes: convertedData.nodes.length > 0,
          hasEdges: convertedData.edges.length > 0,
          nodeCounter: convertedData.nodeCounter,
        });
      } catch (err) {
        console.error('Error loading workflow:', err);
        setError('Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [flowId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <WorkflowEditor
      initialNodes={workflowData?.nodes || initialNodes}
      initialEdges={workflowData?.edges || initialEdges}
      initialNodeCounter={workflowData?.nodeCounter || initialNodeCounter}
    />
  );
};

export default FlowEditor;
