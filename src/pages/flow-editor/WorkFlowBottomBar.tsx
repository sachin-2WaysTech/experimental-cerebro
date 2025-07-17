import Modal from "@/components/Modal";
import { Ellipsis, History, Plus } from "lucide-react"
import { useState, type FC } from "react"
import NodeModelContent, { type NodesSidebarProps } from "./NodeModelContent";
import { privateClient } from "@/utils/privateClient";
import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../../service/nodeService';


type TabsType = "editor" | "execution"

interface WorkFlowBottomBarProps extends NodesSidebarProps {
  nodes?: Node<NodeData & Record<string, unknown>>[];
  edges?: Edge[];
}

const WorkFlowBottomBar: FC<WorkFlowBottomBarProps> = ({
  onNodeDragStart,
  onNodeDblClick,
  nodes = [],
  edges = []
}) => {
  const [tabs, setTabs] = useState<TabsType>("editor");
  const [showModal, setShowModal] = useState(false);
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);

  // Function to format workflow data for API
  const formatWorkflowData = () => {
    if (nodes.length === 0) {
      alert('No nodes found in the workflow. Please add some nodes first.');
      return null;
    }

    // Find the first node as start node (you can modify this logic as needed)
    const startNode = nodes[0];
    
    // Format nodes according to API specification
    const formattedNodes: Record<string, any> = {};
    
    nodes.forEach((node) => {
      const nodeData = node.data;
      
      // Extract credentials from parameters if they exist
      const credentials: Record<string, any> = {};
      if (nodeData.nodeType.credentials && nodeData.nodeType.credentials.length > 0) {
        nodeData.nodeType.credentials.forEach((credentialDef) => {
          const credentialValue = nodeData.parameters?.[credentialDef.name];
          if (credentialValue) {
            credentials[credentialDef.name] = credentialValue;
          }
        });
      }

      // Extract parameters (excluding credentials)
      const parameters: Record<string, any> = {};
      if (nodeData.parameters) {
        Object.entries(nodeData.parameters).forEach(([key, value]) => {
          // Skip credential fields as they're handled separately
          const isCredential = nodeData.nodeType.credentials?.some(cred => cred.name === key);
          if (!isCredential && value !== undefined && value !== null && value !== '') {
            parameters[key] = value;
          }
        });
      }

      formattedNodes[nodeData.id] = {
        name: nodeData.id,
        type: nodeData.type,
        display_name: nodeData.nodeType.display_name,
        description: nodeData.nodeType.description,
        version: 1.0,
        position: [Math.round(node.position.x), Math.round(node.position.y)],
        credentials: Object.keys(credentials).length > 0 ? credentials : {},
        parameters: parameters
      };
    });

    // Format connections from edges
    const connections: Record<string, any> = {};
    edges.forEach((edge) => {
      if (!connections[edge.source]) {
        connections[edge.source] = {};
      }
      
      const outputHandle = 'main';
      if (!connections[edge.source][outputHandle]) {
        connections[edge.source][outputHandle] = [];
      }
      

      // Add target node to the connection array
      if (!connections[edge.source][outputHandle].some((conn: any) => conn.includes(edge.target))) {
        connections[edge.source][outputHandle].push([edge.target]);
      } else {
        // If connection already exists, add to existing array
        const existingConnection = connections[edge.source][outputHandle].find((conn: any) => Array.isArray(conn));
        if (existingConnection && !existingConnection.includes(edge.target)) {
          existingConnection.push(edge.target);
        }
      }
    });

    return {
      name: "Test Workflow",
      description: "Test workflow execution from editor",
      is_active: true,
      status: "published",
      tag_ids: [],
      version_name: "v0.1",
      work_flow: {
        work_flow_id: null,
        start_node: startNode.data.id,
        nodes: formattedNodes,
        connections: connections
      }
    };
  };

  // Function to test workflow
  const handleTestWorkflow = async () => {
    const workflowData = formatWorkflowData();
    if (!workflowData) return;

    setIsTestingWorkflow(true);
    
    try {
      console.log('Testing workflow with data:', JSON.stringify(workflowData, null, 2));
      
      const response = await privateClient.post('/workflows/execute/test', workflowData);
      
      console.log('API Response:', response.data);
      
      if (response.data?.status || response.status === 200) {
        alert('Workflow test initiated successfully!');
        console.log('Test response:', response.data);
      } else {
        alert('Failed to start workflow test: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error testing workflow:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert('Error testing workflow: ' + errorMessage);
    } finally {
      setIsTestingWorkflow(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 flex justify-center  w-full ">
        <div className="rounded-[10px] border-black/30 bg-[#232323] p-2.5 shadow-xl flex gap-5 w-[80%] divide-x-2 divide-gray-700 text-lg font-semibold">
          <p className="text-brand-gradient">{
            tabs === "editor" ? "Editor" : "Executions"
          }</p>
          <p className="text-white">Cron to Start Webinar Reminders</p>
        </div>
      </div>

      <div className="absolute bottom-2 w-full flex justify-center items-center ">
        <div className="rounded-[20px] border-black/30 bg-[#232323] p-2.5 shadow-xl flex gap-5 ">
          <div className="flex items-center gap-5">
            <div className="flex items-center text-white cursor-pointer bg-brand-gradient p-2 hover:bg-black/10 rounded-lg" onClick={() => setShowModal(true)} >
              <Plus size={24} />
            </div>
            <div className="bg-[#0D0D0D] rounded-xl text-white p-[3px] text-sm font-semibold text-center">
              <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] p-[5px] ${tabs === "editor" ? "bg-[#434343]" : ""} `}>Editor</button>
              <button onClick={() => { setTabs("execution") }} className={`rounded-[10px] p-[5px] ${tabs === "execution" ? "bg-[#434343]" : ""} `}>Executions</button>
            </div>
            <div className="flex items-center text-white cursor-pointer p-2 hover:bg-black/10 rounded-lg">
              <History size={24} />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#53B034] peer-focus:ring-2 transition-all duration-300 p-[3px] "></div>
              <div className="absolute left-1 top-0.6 w-[18px] h-[18px] bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
            </label>
            <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] bg-[#434343] py-2 px-3 text-sm font-semibold text-center text-white `}>Save</button>
            <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] bg-[#434343] p-2 text-sm font-semibold text-center text-white `}>
              <Ellipsis />
            </button>
          </div>
          <div className="border-l px-5 border-black/30">
            <button 
              onClick={handleTestWorkflow} 
              disabled={isTestingWorkflow}
              className={`rounded-[10px] py-2 px-3 text-sm font-semibold text-center text-white ${
                isTestingWorkflow ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#B72D26] hover:bg-[#A01E18]'
              }`}
            >
              {isTestingWorkflow ? 'Testing...' : 'Test workflow'}
            </button>
          </div>
        </div>
      </div>
      <Modal title="Nodes" isOpen={showModal} size="full" onClose={() => { setShowModal(false) }}>
        <NodeModelContent
          onNodeDragStart={(e, i) => (onNodeDragStart(e, i), setShowModal(false))}
          onNodeDblClick={(e) => (onNodeDblClick(e), setShowModal(false))}
        />
      </Modal>
    </>
  )
}

export default WorkFlowBottomBar