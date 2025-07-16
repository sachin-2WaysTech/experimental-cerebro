import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeTypes, EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import WorkflowNode from './WorkflowNode';
import AnimatedConnectionLine from './AnimatedConnectionLine';
import WorkflowControls from './WorkflowControls';
import NodeModal from './NodeModal';
import NodeModelContent from './NodeModelContent';
import type { NodeData, NodeType } from '../../service/nodeService';
import { getLayoutedElements } from '../../utils/layoutUtils';
import type { LayoutAlgorithm } from '../../utils/layoutUtils';
import WorkFlowBottomBar from './WorkFlowBottomBar';
import Modal from '@/components/Modal';

const edgeTypes: EdgeTypes = {
  animatedEdge: AnimatedConnectionLine,
};

// Utility function to find a non-overlapping position for a new node
const findNonOverlappingPosition = (
  preferredPosition: { x: number; y: number },
  existingNodes: Node[],
  nodeSize: { width: number; height: number; minDistance: number }
) => {
  const isOverlapping = (pos: { x: number; y: number }) => {
    return existingNodes.some(node => {
      const distance = Math.sqrt(
        Math.pow(pos.x - node.position.x, 2) +
        Math.pow(pos.y - node.position.y, 2)
      );
      return distance < (nodeSize.width + nodeSize.minDistance);
    });
  };

  if (!isOverlapping(preferredPosition)) {
    return preferredPosition;
  }

  // Try positions in a spiral pattern around the preferred position
  const step = nodeSize.minDistance;
  for (let radius = step; radius <= 500; radius += step) {
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 4) {
      const candidate = {
        x: preferredPosition.x + radius * Math.cos(angle),
        y: preferredPosition.y + radius * Math.sin(angle)
      };

      if (!isOverlapping(candidate)) {
        return candidate;
      }
    }
  }

  // Fallback: return preferred position with some offset
  return {
    x: preferredPosition.x + 100,
    y: preferredPosition.y + 100
  };
};

const WorkflowEditorInner: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData & Record<string, unknown>>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeCounter, setNodeCounter] = useState(1);

  // State for node selection modal
  const [showNodeSelectionModal, setShowNodeSelectionModal] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    sourceHandle: string;
    sourceNodeId: string;
  } | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  // Create node with automatic connection
  const createNodeWithConnection = useCallback((nodeType: NodeType, sourceNodeId: string, sourceHandle: string) => {
    // Find the source node to calculate relative position
    const sourceNode = nodes.find(node => node.id === sourceNodeId);

    let position;
    if (sourceNode) {
      // Position new node to the right and slightly below the source node
      position = {
        x: sourceNode.position.x + 400, // 400px to the right
        y: sourceNode.position.y + (Math.random() - 0.5) * 100, // slight vertical offset
      };
    } else {
      // Fallback position
      position = screenToFlowPosition({
        x: 600,
        y: 300,
      });
    }

    const newNode: Node<NodeData & Record<string, unknown>> = {
      id: `node-${nodeCounter}`,
      type: 'workflowNode',
      position,
      data: {
        id: `node-${nodeCounter}`,
        type: nodeType.name,
        label: `${nodeType.display_name} ${nodeCounter}`,
        parameters: {},
        nodeType,
        executionData: {
          status: 'idle'
        }
      },
    };

    // Add the node
    setNodes((nds) => nds.concat(newNode));

    // Create the connection
    const edge: Edge = {
      id: `edge-${sourceNodeId}-${newNode.id}`,
      source: sourceNodeId,
      target: newNode.id,
      sourceHandle: sourceHandle,
      targetHandle: 'input-0', // Connect to first input
      type: 'animatedEdge',
      animated: true,
      style: {
        stroke: '#6B7280',
        strokeWidth: 2,
      },
    };

    setEdges((eds) => [...eds, edge]);
    setNodeCounter((prev) => prev + 1);
  }, [screenToFlowPosition, nodeCounter, setNodes, setEdges, nodes]);

  // Handle opening node selection modal
  const handleOpenNodeSelectionModal = useCallback((sourceNodeId: string, sourceHandle: string) => {
    setConnectionInfo({
      sourceHandle,
      sourceNodeId,
    });
    setShowNodeSelectionModal(true);
  }, []);

  // Handle node selection from modal
  const handleNodeFromModal = useCallback((nodeType: NodeType) => {
    if (connectionInfo && createNodeWithConnection) {
      createNodeWithConnection(nodeType, connectionInfo.sourceNodeId, connectionInfo.sourceHandle);
    }
    setShowNodeSelectionModal(false);
    setConnectionInfo(null);
  }, [connectionInfo, createNodeWithConnection]);

  // Enhanced node types with additional props
  const enhancedNodeTypes: NodeTypes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workflowNode: (props: any) => (
      <WorkflowNode
        {...props}
        onNodeDragStart={onNodeDragStart}
        onNodeDblClick={handleBottomBarNodeDblClick}
        onCreateNodeWithConnection={createNodeWithConnection}
        onOpenNodeSelectionModal={handleOpenNodeSelectionModal}
        connectedEdges={edges}
      />
    ),
  };

  // Handle node drag from sidebar
  const onNodeDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const nodeTypeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeTypeData) return;

      const nodeType: NodeType = JSON.parse(nodeTypeData);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check for nearby nodes and adjust position to prevent overlaps
      const adjustedPosition = findNonOverlappingPosition(position, nodes, {
        width: 300,
        height: 150,
        minDistance: 50
      });

      const newNode: Node<NodeData & Record<string, unknown>> = {
        id: `node-${nodeCounter}`,
        type: 'workflowNode',
        position: adjustedPosition,
        data: {
          id: `node-${nodeCounter}`,
          type: nodeType.name,
          label: `${nodeType.display_name} ${nodeCounter}`,
          parameters: {},
          nodeType,
          executionData: {
            status: 'idle'
          }
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeCounter((prev) => prev + 1);
    },
    [screenToFlowPosition, nodeCounter, setNodes, nodes]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle connection creation
  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        id: `edge-${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'animatedEdge',
        animated: true,
        style: {
          stroke: '#6B7280',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Handle node double-click
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node<NodeData & Record<string, unknown>>) => {
    setSelectedNode(node.data);
    setIsModalOpen(true);
  }, []);

  // Handle node parameter save
  const onNodeParameterSave = useCallback((parameters: Record<string, unknown>) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
            ...node,
            data: {
              ...node.data,
              parameters,
            },
          }
          : node
      )
    );
  }, [selectedNode, setNodes]);

  // Get connected nodes for modal
  const getConnectedNodes = useCallback((nodeId: string) => {
    const inputNodes = edges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => nodes.find((node) => node.id === edge.source)?.data)
      .filter((node): node is NodeData & Record<string, unknown> => node !== undefined);

    const outputNodes = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => nodes.find((node) => node.id === edge.target)?.data)
      .filter((node): node is NodeData & Record<string, unknown> => node !== undefined);

    return { inputs: inputNodes, outputs: outputNodes };
  }, [edges, nodes]);

  // Auto-arrange nodes
  const onAutoArrange = useCallback(
    (algorithm: LayoutAlgorithm) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        algorithm
      );

      setNodes(layoutedNodes as Node<NodeData & Record<string, unknown>>[]);
      setEdges(layoutedEdges);

      // Fit view after a short delay to allow the layout to be applied
      setTimeout(() => {
        fitView({ padding: 50 });
      }, 100);
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  // Handler for double-click from bottom bar
  const handleBottomBarNodeDblClick = useCallback((nodeType: NodeType) => {
    // Find a good position in the center of the viewport
    const defaultPosition = { x: 400, y: 300 };

    // Find non-overlapping position
    const adjustedPosition = findNonOverlappingPosition(defaultPosition, nodes, {
      width: 300,
      height: 150,
      minDistance: 50
    });

    const newNode: Node<NodeData & Record<string, unknown>> = {
      id: `node-${nodeCounter}`,
      type: 'workflowNode',
      position: adjustedPosition,
      data: {
        id: `node-${nodeCounter}`,
        type: nodeType.name,
        label: `${nodeType.display_name} ${nodeCounter}`,
        parameters: {},
        nodeType,
        executionData: {
          status: 'idle'
        }
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeCounter((prev) => prev + 1);
  }, [nodeCounter, setNodes, nodes]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={enhancedNodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          connectionLineStyle={{ stroke: '#123456', strokeWidth: 2 }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.5}
          maxZoom={2}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background
            bgColor='#1F1F1F'
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />

          <WorkflowControls
            onAutoArrange={onAutoArrange}
          />
        </ReactFlow>
        {selectedNode && (
          <NodeModal
            node={selectedNode}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedNode(null);
            }}
            onSave={onNodeParameterSave}
            connectedNodes={getConnectedNodes(selectedNode.id)}
          />
        )}


        <Modal isOpen={showNodeSelectionModal} onClose={() => {
          setShowNodeSelectionModal(false);
          setConnectionInfo(null);
        }}>
          <NodeModelContent
            isOnlyInput
            onNodeDragStart={(e, nodeType) => {
              if (onNodeDragStart) {
                onNodeDragStart(e, nodeType);
                setShowNodeSelectionModal(false);
                setConnectionInfo(null);
              }
            }}
            onNodeDblClick={handleNodeFromModal}
          />
        </Modal>
      </div>
      <WorkFlowBottomBar
        onNodeDragStart={onNodeDragStart}
        onNodeDblClick={handleBottomBarNodeDblClick}
      />
    </div>
  );
};

const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
