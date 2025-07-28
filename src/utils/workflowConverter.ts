import type { Node, Edge } from '@xyflow/react';
import type { NodeData, NodeType } from '../service/nodeService';
import type { Workflow, WorkflowNode as APIWorkflowNode, WorkflowConnection } from '../stores/workflow_store';
import { nodeService } from '../service/nodeService';

/**
 * Converts API workflow data to ReactFlow nodes and edges format
 */
export function convertWorkflowToReactFlow(
  workflow: Workflow,
  nodeTypes: NodeType[]
): {
  nodes: Node<NodeData & Record<string, unknown>>[];
  edges: Edge[];
  nodeCounter: number;
} {
  const nodes: Node<NodeData & Record<string, unknown>>[] = [];
  const edges: Edge[] = [];
  let maxNodeNumber = 0;

  // Set node types in the service for lookup
  nodeService.setNodeTypes(nodeTypes);

  // Convert API nodes to ReactFlow nodes
  Object.entries(workflow.work_flow.nodes??{}).forEach(([nodeId, apiNode]) => {
    // Extract node number from nodeId if it follows the pattern "node-X"
    const nodeNumberMatch = nodeId.match(/node-(\d+)/);
    if (nodeNumberMatch) {
      const nodeNumber = parseInt(nodeNumberMatch[1], 10);
      maxNodeNumber = Math.max(maxNodeNumber, nodeNumber);
    }

    // Find the corresponding NodeType
    const nodeType = nodeService.getNodeTypeByName(apiNode.type);
    if (!nodeType) {
      console.warn(`NodeType not found for: ${apiNode.type}`);
      return;
    }

    // Create ReactFlow node
    const reactFlowNode: Node<NodeData & Record<string, unknown>> = {
      id: nodeId,
      type: 'workflowNode',
      position: {
        x: apiNode?.position[0],
        y: apiNode?.position[1],
      },
      data: {
        id: nodeId,
        type: apiNode.type,
        label: apiNode.display_name || `${nodeType.display_name}`,
        parameters: apiNode.parameters || {},
        nodeType,
        executionData: {
          status: 'idle'
        }
      },
    };

    nodes.push(reactFlowNode);
  });

  // Convert API connections to ReactFlow edges
  Object.entries(workflow.work_flow.connections??{}).forEach(([sourceNodeId, connections]) => {
    Object.entries(connections).forEach(([outputHandle, targetArrays]) => {
      // targetArrays is an array of arrays, each containing target node IDs
      (targetArrays as string[][]).forEach((targetArray, arrayIndex) => {
        targetArray.forEach((targetNodeId, targetIndex) => {
          const edgeId = `edge-${sourceNodeId}-${targetNodeId}-${arrayIndex}-${targetIndex}`;
          
          const edge: Edge = {
            id: edgeId,
            source: sourceNodeId,
            target: targetNodeId,
            sourceHandle: outputHandle === 'main' ? 'output-0' : outputHandle,
            targetHandle: 'input-0', // Default to first input
            type: 'animatedEdge',
            animated: true,
            style: {
              stroke: '#6B7280',
              strokeWidth: 2,
            },
          };

          edges.push(edge);
        });
      });
    });
  });

  return {
    nodes,
    edges,
    nodeCounter: maxNodeNumber + 1, // Next available node number
  };
}

/**
 * Converts ReactFlow nodes and edges back to API workflow format
 */
export function convertReactFlowToWorkflow(
  nodes: Node<NodeData & Record<string, unknown>>[],
  edges: Edge[]
): {
  nodes: Record<string, any>;
  connections: Record<string, any>;
} {
  // Format nodes according to API specification
  const formattedNodes: Record<string, any> = {};
  
  nodes.forEach((node) => {
    const nodeData = node.data as NodeData;
    
    // Separate credentials from regular parameters
    const parameters: Record<string, any> = {};
    const credentials: Record<string, any> = {};
    
    if (nodeData.parameters) {
      Object.entries(nodeData.parameters).forEach(([key, value]) => {
        if (key.endsWith('_credential') || key === 'credential') {
          // Handle credential fields
          if (typeof value === 'object' && value !== null && 'id' in value) {
            credentials[key] = value;
          }
        } else {
          // Include non-credential fields in parameters object
          parameters[key] = value;
        }
      });
    }

    // Create node object with required fields
    const nodeObject: Record<string, any> = {
      name: nodeData.id,
      type: nodeData.type,
      display_name: nodeData.nodeType.display_name,
      description: nodeData.nodeType.description,
      version: 1.0,
      position: [Math.round(node.position.x), Math.round(node.position.y)],
    };

    // Add is_trigger field for trigger nodes
    if (nodeData.type === "manual_trigger" || nodeData.nodeType.name === "manual_trigger") {
      nodeObject.is_trigger = true;
    } else {
      nodeObject.is_trigger = false;
    }

    // Add parameters if they exist
    if (Object.keys(parameters).length > 0) {
      nodeObject.parameters = parameters;
    }

    // Add credentials if they exist
    if (Object.keys(credentials).length > 0) {
      nodeObject.credentials = credentials;
    }

    formattedNodes[nodeData.id] = nodeObject;
  });

  // Format connections from edges
  const connections: Record<string, any> = {};
  edges.forEach((edge) => {
    if (!connections[edge.source]) {
      connections[edge.source] = {};
    }

    const outputHandle = "main";
    if (!connections[edge.source][outputHandle]) {
      connections[edge.source][outputHandle] = [];
    }

    // Find existing connection array or create new one
    let targetArray = connections[edge.source][outputHandle].find(
      (conn: any[]) => Array.isArray(conn)
    );

    if (!targetArray) {
      targetArray = [];
      connections[edge.source][outputHandle].push(targetArray);
    }

    // Add target if not already present
    if (!targetArray.includes(edge.target)) {
      targetArray.push(edge.target);
    }
  });

  return {
    nodes: formattedNodes,
    connections: connections,
  };
}
