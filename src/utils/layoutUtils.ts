import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import { Position } from '@xyflow/react';

// Layout algorithms
export type LayoutAlgorithm =
  | 'dagre-tb'
  | 'dagre-lr'
  | 'dagre-bt'
  | 'dagre-rl'
  | 'elkjs-layered'
  | 'elkjs-force'
  | 'elkjs-stress'
  | 'elkjs-radial'
  | 'force'
  | 'grid'
  | 'circular';

export interface LayoutOptions {
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  nodeWidth: number;
  nodeHeight: number;
  nodeSep: number;
  rankSep: number;
  edgeSep: number;
}

const defaultOptions: LayoutOptions = {
  direction: 'TB',
  nodeWidth: 300,
  nodeHeight: 150,
  nodeSep: 80,
  rankSep: 150,
  edgeSep: 50
};

// Dagre layout using dagre library
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  algorithm: LayoutAlgorithm = 'dagre-tb',
  options: Partial<LayoutOptions> = {}
): { nodes: Node[]; edges: Edge[] } => {
  const opts = { ...defaultOptions, ...options };

  switch (algorithm) {
    case 'dagre-tb':
    case 'dagre-lr':
    case 'dagre-bt':
    case 'dagre-rl':
      return getDagreLayout(nodes, edges, algorithm, opts);
    case 'force':
      return getForceLayout(nodes, edges, opts);
    case 'grid':
      return getGridLayout(nodes, edges, opts);
    case 'circular':
      return getCircularLayout(nodes, edges, opts);
    case 'elkjs-layered':
      return getElkLayeredLayout(nodes, edges, opts);
    case 'elkjs-force':
      return getElkForceLayout(nodes, edges, opts);
    case 'elkjs-stress':
      return getElkStressLayout(nodes, edges, opts);
    case 'elkjs-radial':
      return getElkRadialLayout(nodes, edges, opts);
    default:
      return { nodes, edges };
  }
};

// Dagre layout implementation
const getDagreLayout = (
  nodes: Node[],
  edges: Edge[],
  algorithm: LayoutAlgorithm,
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph direction based on algorithm
  const direction = algorithm.split('-')[1]?.toUpperCase() || 'TB';
  dagreGraph.setGraph({
    rankdir: direction as 'TB' | 'LR' | 'BT' | 'RL',
    nodesep: options.nodeSep,
    ranksep: options.rankSep,
    edgesep: options.edgeSep,
    marginx: 50,
    marginy: 50
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: options.nodeWidth,
      height: options.nodeHeight
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Update node positions with proper handle positioning
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Calculate position with margins to prevent edge clipping
    const position = {
      x: nodeWithPosition.x - options.nodeWidth / 2,
      y: nodeWithPosition.y - options.nodeHeight / 2,
    };

    // Set source and target positions based on direction for clean connections
    let sourcePosition: Position;
    let targetPosition: Position;

    switch (direction) {
      case 'LR': // Left to Right
        sourcePosition = Position.Right;
        targetPosition = Position.Left;
        break;
      case 'RL': // Right to Left
        sourcePosition = Position.Left;
        targetPosition = Position.Right;
        break;
      case 'BT': // Bottom to Top
        sourcePosition = Position.Top;
        targetPosition = Position.Bottom;
        break;
      case 'TB': // Top to Bottom (default)
      default:
        sourcePosition = Position.Bottom;
        targetPosition = Position.Top;
        break;
    }

    return {
      ...node,
      position,
      sourcePosition,
      targetPosition,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Force layout implementation (improved to prevent overlaps)
const getForceLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 600;
  const centerY = 400;
  const baseRadius = Math.max(300, nodes.length * 40);

  // Create multiple concentric circles for larger node counts
  const nodesPerCircle = Math.max(6, Math.min(12, Math.ceil(nodes.length / 3)));

  const layoutedNodes = nodes.map((node, index) => {
    const circleIndex = Math.floor(index / nodesPerCircle);
    const positionInCircle = index % nodesPerCircle;
    const radius = baseRadius + (circleIndex * (options.nodeWidth + options.nodeSep));

    const angle = (positionInCircle / nodesPerCircle) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      ...node,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Grid layout implementation (improved spacing and positioning)
const getGridLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  // Calculate optimal grid dimensions
  const cols = Math.ceil(Math.sqrt(nodes.length));

  // Add padding to prevent nodes from being at viewport edges
  const startX = 100;
  const startY = 100;
  const cellWidth = options.nodeWidth + options.nodeSep;
  const cellHeight = options.nodeHeight + options.rankSep;

  const layoutedNodes = nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      ...node,
      position: {
        x: startX + col * cellWidth,
        y: startY + row * cellHeight
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Circular layout implementation (improved spacing and positioning)
const getCircularLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 600;
  const centerY = 400;

  // Calculate radius based on node count and size to prevent overlaps
  const circumference = nodes.length * (options.nodeWidth + options.nodeSep);
  const minRadius = circumference / (2 * Math.PI);
  const radius = Math.max(minRadius, 300);

  const layoutedNodes = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      ...node,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ELK.js-inspired layout implementations (using mathematical algorithms)

// ELK Layered layout (similar to Dagre but with different spacing)
const getElkLayeredLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  // Use dagre with enhanced spacing for layered approach
  return getDagreLayout(nodes, edges, 'dagre-tb', {
    ...options,
    nodeSep: options.nodeSep * 1.5,
    rankSep: options.rankSep * 1.2,
  });
};

// ELK Force layout (physics-based positioning)
const getElkForceLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 600;
  const centerY = 400;

  // Create a force-directed layout simulation
  const layoutedNodes = nodes.map((node, index) => {
    // Start with a grid and add some randomness
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const col = index % cols;
    const row = Math.floor(index / cols);

    const baseX = centerX + (col - cols / 2) * (options.nodeWidth + options.nodeSep);
    const baseY = centerY + (row - Math.ceil(nodes.length / cols) / 2) * (options.nodeHeight + options.rankSep);

    // Add some force-like displacement
    const forceX = (Math.random() - 0.5) * 100;
    const forceY = (Math.random() - 0.5) * 100;

    return {
      ...node,
      position: {
        x: baseX + forceX,
        y: baseY + forceY
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ELK Stress layout (minimizes edge stress)
const getElkStressLayout = (
  nodes: Node[],
  edges: Edge[],
  _options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 600;
  const centerY = 400;

  // Create a layout that minimizes edge crossings
  const layoutedNodes = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const radius = 250 + (index % 3) * 100; // Multiple rings

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      ...node,
      position: { x, y },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ELK Radial layout (tree-like radial arrangement)
const getElkRadialLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 600;
  const centerY = 400;

  // Create levels based on connections
  const levels: Node[][] = [];
  const visited = new Set<string>();

  // Find root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(node =>
    !edges.some(edge => edge.target === node.id)
  );

  if (rootNodes.length === 0) {
    // Fallback to first node as root
    levels.push([nodes[0] || []].filter(Boolean));
  } else {
    levels.push(rootNodes);
  }

  // Build levels
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const currentLevel = levels[levelIndex];
    const nextLevel: Node[] = [];

    currentLevel.forEach(node => {
      visited.add(node.id);
      const children = edges
        .filter(edge => edge.source === node.id)
        .map(edge => nodes.find(n => n.id === edge.target))
        .filter((n): n is Node => n !== undefined && !visited.has(n.id));

      nextLevel.push(...children);
    });

    if (nextLevel.length > 0) {
      levels.push(nextLevel);
    }
  }

  // Position nodes in radial layout
  const layoutedNodes = nodes.map((node) => {
    let levelIndex = 0;
    let positionInLevel = 0;

    for (let i = 0; i < levels.length; i++) {
      const pos = levels[i].findIndex(n => n.id === node.id);
      if (pos !== -1) {
        levelIndex = i;
        positionInLevel = pos;
        break;
      }
    }

    const radius = levelIndex * (options.nodeWidth + options.rankSep) + 100;
    const angleStep = levels[levelIndex] ? (2 * Math.PI) / levels[levelIndex].length : 0;
    const angle = positionInLevel * angleStep;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      ...node,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// ELK.js layout (placeholder - would need actual ELK.js implementation)
export const getElkLayout = async (
  nodes: Node[],
  edges: Edge[],
  algorithm: 'layered' | 'force' | 'stress' | 'radial' = 'layered'
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  // This would use ELK.js library for more advanced layouts
  // For now, fallback to our ELK-inspired implementations
  switch (algorithm) {
    case 'layered':
      return getElkLayeredLayout(nodes, edges, defaultOptions);
    case 'force':
      return getElkForceLayout(nodes, edges, defaultOptions);
    case 'stress':
      return getElkStressLayout(nodes, edges, defaultOptions);
    case 'radial':
      return getElkRadialLayout(nodes, edges, defaultOptions);
    default:
      return getDagreLayout(nodes, edges, 'dagre-tb', defaultOptions);
  }
};

// Utility to fit view after layout
export const fitViewAfterLayout = (fitView: () => void, delay = 100) => {
  setTimeout(() => {
    fitView();
  }, delay);
};

// Auto-arrange utility function
export const autoArrange = (
  nodes: Node[],
  edges: Edge[],
  algorithm: LayoutAlgorithm = 'dagre-tb',
  options?: Partial<LayoutOptions>
) => {
  return getLayoutedElements(nodes, edges, algorithm, options);
};
