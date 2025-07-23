// Test file to demonstrate copy-paste functionality for workflow nodes

// Example of how the copy-paste functionality works:

// 1. SELECTION
// Users can select multiple nodes by:
// - Clicking on a node (selects single node)
// - Shift + Click to add nodes to selection
// - Drag to create selection box (if implemented)

// 2. COPYING (Cmd+C / Ctrl+C)
// When user presses Cmd+C:
// - Gets all selected nodes
// - Gets edges that connect selected nodes (internal connections)
// - Stores them in clipboard state
// - Shows toast notification

// 3. PASTING (Cmd+V / Ctrl+V)
// When user presses Cmd+V:
// - Creates new nodes with new IDs
// - Positions them with offset (50px right, 50px down)
// - Updates edge connections to use new node IDs
// - Selects the newly pasted nodes
// - Shows toast notification

// Example workflow data structure after copy:
const exampleClipboardData = {
  nodes: [
    {
      id: "node-1",
      type: "workflowNode",
      position: { x: 100, y: 100 },
      selected: true,
      data: {
        id: "node-1",
        type: "manual_trigger",
        label: "Manual Trigger 1",
        parameters: {},
        nodeType: {
          name: "manual_trigger",
          display_name: "Manual Trigger",
          description: "Manually trigger the workflow",
          icon: "play",
          icon_color: "#4CAF50",
          group: ["trigger"],
          version: 1,
          parameters: [],
          inputs: [],
          outputs: ["main"],
          hidden: false
        },
        executionData: {
          status: "idle"
        }
      }
    },
    {
      id: "node-2", 
      type: "workflowNode",
      position: { x: 400, y: 100 },
      selected: true,
      data: {
        id: "node-2",
        type: "wait",
        label: "Wait 2",
        parameters: {
          wait_value: 5,
          wait_unit: "seconds"
        },
        nodeType: {
          name: "wait",
          display_name: "Wait",
          description: "Wait for a specified duration",
          icon: "clock",
          icon_color: "#FF9800",
          group: ["utility"],
          version: 1,
          parameters: [
            {
              name: "wait_value",
              type: "number",
              display_name: "Wait Time",
              description: "Time to wait",
              required: true,
              default: 1
            }
          ],
          inputs: ["main"],
          outputs: ["main"],
          hidden: false
        },
        executionData: {
          status: "idle"
        }
      }
    }
  ],
  edges: [
    {
      id: "edge-node-1-node-2",
      source: "node-1",
      target: "node-2",
      sourceHandle: "output-0",
      targetHandle: "input-0",
      type: "animatedEdge",
      animated: true,
      style: {
        stroke: "#6B7280",
        strokeWidth: 2
      }
    }
  ]
};

// After pasting, the data would be transformed to:
const examplePastedData = {
  nodes: [
    {
      id: "node-3", // New ID
      type: "workflowNode",
      position: { x: 150, y: 150 }, // Offset position
      selected: true, // Newly pasted nodes are selected
      data: {
        id: "node-3",
        type: "manual_trigger",
        label: "Manual Trigger 3", // Updated label with new counter
        parameters: {},
        nodeType: {
          // Same nodeType definition
          name: "manual_trigger",
          display_name: "Manual Trigger",
          // ... rest of nodeType
        },
        executionData: {
          status: "idle"
        }
      }
    },
    {
      id: "node-4", // New ID
      type: "workflowNode", 
      position: { x: 450, y: 150 }, // Offset position
      selected: true,
      data: {
        id: "node-4",
        type: "wait",
        label: "Wait 4", // Updated label
        parameters: {
          wait_value: 5, // Parameters preserved
          wait_unit: "seconds"
        },
        nodeType: {
          // Same nodeType definition
          name: "wait",
          display_name: "Wait",
          // ... rest of nodeType
        },
        executionData: {
          status: "idle"
        }
      }
    }
  ],
  edges: [
    {
      id: "edge-node-3-node-4", // New edge ID
      source: "node-3", // Updated source
      target: "node-4", // Updated target
      sourceHandle: "output-0",
      targetHandle: "input-0",
      type: "animatedEdge",
      animated: true,
      style: {
        stroke: "#6B7280",
        strokeWidth: 2
      }
    }
  ]
};

// Key features of the implementation:
// 1. Cross-platform keyboard shortcuts (Cmd on Mac, Ctrl on Windows/Linux)
// 2. Toast notifications for user feedback
// 3. Proper node ID generation to avoid conflicts
// 4. Edge relationship preservation
// 5. Visual feedback with node selection
// 6. Keyboard shortcuts help panel
// 7. Input field detection to avoid conflicts with form inputs

export { exampleClipboardData, examplePastedData };
