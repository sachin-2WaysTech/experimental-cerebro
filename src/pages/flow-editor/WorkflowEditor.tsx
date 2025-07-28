import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { useToast } from '@/components/Toast';

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

interface WorkflowEditorInnerProps {
  initialNodes?: Node<NodeData & Record<string, unknown>>[];
  initialEdges?: Edge[];
  initialNodeCounter?: number;
}

const WorkflowEditorInner: React.FC<WorkflowEditorInnerProps> = ({
  initialNodes = [],
  initialEdges = [],
  initialNodeCounter = 1,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData & Record<string, unknown>>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeCounter, setNodeCounter] = useState(initialNodeCounter);

  // Toast notifications
  const { showToast, ToastContainer } = useToast();

  // Clipboard state for copy-paste functionality
  const [clipboard, setClipboard] = useState<{
    nodes: Node<NodeData & Record<string, unknown>>[];
    edges: Edge[];
  } | null>(null);


  // State for node selection modal
  const [showNodeSelectionModal, setShowNodeSelectionModal] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    sourceHandle: string;
    sourceNodeId: string;
  } | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  // Get selected nodes and edges
  const getSelectedElements = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedNodeIds = selectedNodes.map(node => node.id);

    // Get edges that connect selected nodes
    const selectedEdges = edges.filter(edge =>
      selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
    );

    return { selectedNodes, selectedEdges };
  }, [nodes, edges]);

  // Copy selected nodes and edges to clipboard
  const copyToClipboard = useCallback(() => {
    const { selectedNodes, selectedEdges } = getSelectedElements();

    if (selectedNodes.length === 0) {
      showToast('No nodes selected to copy', 'error');
      return;
    }

    setClipboard({
      nodes: selectedNodes,
      edges: selectedEdges
    });

    showToast(`Copied ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''} to clipboard`, 'success');
  }, [getSelectedElements, setClipboard, showToast]);

  // Paste nodes and edges from clipboard
  const pasteFromClipboard = useCallback(() => {
    if (!clipboard || clipboard.nodes.length === 0) {
      showToast('Nothing to paste', 'error');
      return;
    }

    const pasteOffset = { x: 50, y: 50 }; // Offset for pasted nodes

    // Create new node IDs and update positions
    const nodeIdMap = new Map<string, string>();
    const newNodes = clipboard.nodes.map((node, index) => {
      const newId = `node-${nodeCounter + index}`;
      nodeIdMap.set(node.id, newId);

      return {
        ...node,
        id: newId,
        selected: true, // Select the pasted nodes
        position: {
          x: node.position.x + pasteOffset.x,
          y: node.position.y + pasteOffset.y
        },
        data: {
          ...node.data,
          id: newId,
          label: `${node.data.nodeType.display_name} ${nodeCounter + index}`
        }
      };
    });

    // Update edges with new node IDs
    const newEdges = clipboard.edges.map(edge => {
      const newSourceId = nodeIdMap.get(edge.source);
      const newTargetId = nodeIdMap.get(edge.target);

      if (newSourceId && newTargetId) {
        return {
          ...edge,
          id: `edge-${newSourceId}-${newTargetId}`,
          source: newSourceId,
          target: newTargetId
        };
      }
      return null;
    }).filter((edge): edge is Edge => edge !== null);

    // Deselect all existing nodes first
    setNodes(nds => nds.map(node => ({ ...node, selected: false })));

    // Add new nodes and edges
    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);

    // Update node counter
    setNodeCounter(prev => prev + clipboard.nodes.length);

    showToast(`Pasted ${newNodes.length} node${newNodes.length > 1 ? 's' : ''}`, 'success');
  }, [clipboard, nodeCounter, setNodes, setEdges, setNodeCounter, showToast]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if we're in an input field or textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

    if (isCtrlOrCmd && event.key === 'c') {
      event.preventDefault();
      copyToClipboard();
    } else if (isCtrlOrCmd && event.key === 'v') {
      event.preventDefault();
      pasteFromClipboard();
    }
  }, [copyToClipboard, pasteFromClipboard]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle selection changes
  const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[], edges: Edge[] }) => {
    console.log(`Selected: ${selectedNodes.length} nodes, ${selectedEdges.length} edges`);
  }, []);

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
          onSelectionChange={onSelectionChange}
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
          multiSelectionKeyCode="Shift"
          selectionKeyCode="Shift"
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

        {/* Empty state message */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-xl mb-2">No workflow nodes yet</div>
              <div className="text-sm">
                Drag nodes from the sidebar or double-click to add nodes to your workflow
              </div>
            </div>
          </div>
        )}
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
        nodes={nodes}
        edges={edges}
      />
      <ToastContainer />
    </div>
  );
};

interface WorkflowEditorProps {
  initialNodes?: Node<NodeData & Record<string, unknown>>[];
  initialEdges?: Edge[];
  initialNodeCounter?: number;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  initialNodes,
  initialEdges,
  initialNodeCounter,
}) => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        initialNodeCounter={initialNodeCounter}
      />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
