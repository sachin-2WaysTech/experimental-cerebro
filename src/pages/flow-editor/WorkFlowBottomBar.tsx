import Modal from "@/components/Modal";
import { Ellipsis, History, Plus } from "lucide-react";
import { useState, type FC } from "react";
import NodeModelContent, { type NodesSidebarProps } from "./NodeModelContent";
import { executeWorkflow } from "@/service/commonService";
import { useCredentialsStore } from "@/stores/nodes_store";
import type { Node, Edge } from "@xyflow/react";
import type { NodeData } from "../../service/nodeService";
import { useParams } from "react-router-dom";

type TabsType = "editor" | "execution";

interface WorkFlowBottomBarProps extends NodesSidebarProps {
  nodes?: Node<NodeData & Record<string, unknown>>[];
  edges?: Edge[];
}

const WorkFlowBottomBar: FC<WorkFlowBottomBarProps> = ({
  onNodeDragStart,
  onNodeDblClick,
  nodes = [],
  edges = [],
}) => {
  const { flowId } = useParams();
  const savedCredentials = useCredentialsStore((state) => state.savedCredentials);

  const [tabs, setTabs] = useState<TabsType>("editor");
  const [showModal, setShowModal] = useState(false);
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);

  // Function to format workflow data for API
  const formatWorkflowData = () => {
    if (nodes.length === 0) {
      alert("No nodes found in the workflow. Please add some nodes first.");
      return null;
    }

    // Format nodes according to API specification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedNodes: Record<string, any> = {};

    nodes.forEach((node) => {
      const nodeData = node.data;

      // Debug: Log node data to see what's available
      console.log(`Processing node ${nodeData.id}:`, {
        parameters: nodeData.parameters,
        credentialDefs: nodeData.nodeType.credentials
      });

      // Extract credentials from parameters
      const credentials: Record<string, unknown> = {};
      // Extract regular parameters (excluding credentials)
      const parameters: Record<string, unknown> = {};

      if (nodeData.parameters) {
        Object.entries(nodeData.parameters).forEach(([key, value]) => {
          const isCredential = nodeData.nodeType.credentials?.some(
            (cred) => cred.name === key
          );

          if (value !== undefined && value !== null && value !== "") {
            if (isCredential) {
              // Transform credential ID to proper format with id and name
              const credentialId = value as string;
              const savedCredential = savedCredentials.find(cred => cred.id === credentialId);

              if (savedCredential) {
                credentials[key] = {
                  id: savedCredential.id,
                  name: savedCredential.display_name || savedCredential.name
                };

              } else {
                // Fallback if credential not found in saved credentials
                credentials[key] = {
                  id: credentialId,
                  name: "Unknown Credential"
                };

              }
            } else {
              // Include non-credential fields in parameters object
              parameters[key] = value;
            }
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

      // Add credentials if they exist
      if (Object.keys(credentials).length > 0) {
        nodeObject.credentials = credentials;

      }

      // Add parameters if they exist
      if (Object.keys(parameters).length > 0) {
        nodeObject.parameters = parameters;
      }

      formattedNodes[nodeData.id] = nodeObject;
    });

    // Format connections from edges
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      work_flow: {
        nodes: formattedNodes,
        connections: connections,
      },
      input_data: {},
    };
  };

  // Function to test workflow
  const handleTestWorkflow = async () => {
    const workflowData = formatWorkflowData();
    if (!workflowData) return;

    if (!flowId) {
      alert("Workflow ID is required to execute the workflow.");
      return;
    }

    setIsTestingWorkflow(true);

    try {
      console.log(
        "Testing workflow with data:",
        JSON.stringify(workflowData, null, 2)
      );

      const response = await executeWorkflow(flowId, workflowData);

      console.log("API Response:", response);

      alert("Workflow test initiated successfully!");
      console.log("Test response:", response);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      alert("Error testing workflow: " + errorMessage);
    } finally {
      setIsTestingWorkflow(false);
    }
  };

  return (
    <>
      <div className="absolute top-4 flex justify-center  w-full ">
        <div className="rounded-[10px] border-black/30 bg-[#232323] p-2.5 shadow-xl flex gap-5 w-[80%] divide-x-2 divide-gray-700 text-lg font-semibold">
          <p className="text-brand-gradient">
            {tabs === "editor" ? "Editor" : "Executions"}
          </p>
          <p className="text-white">Cron to Start Webinar Reminders</p>
        </div>
      </div>

      <div className="absolute bottom-2 w-full flex justify-center items-center ">
        <div className="rounded-[20px] border-black/30 bg-[#232323] p-2.5 shadow-xl flex gap-5 ">
          <div className="flex items-center gap-5">
            <div
              className="flex items-center text-white cursor-pointer bg-brand-gradient p-2 hover:bg-black/10 rounded-lg"
              onClick={() => setShowModal(true)}
            >
              <Plus size={24} />
            </div>
            <div className="bg-[#0D0D0D] rounded-xl text-white p-[3px] text-sm font-semibold text-center">
              <button
                onClick={() => {
                  setTabs("editor");
                }}
                className={`rounded-[10px] p-[5px] ${tabs === "editor" ? "bg-[#434343]" : ""
                  } `}
              >
                Editor
              </button>
              <button
                onClick={() => {
                  setTabs("execution");
                }}
                className={`rounded-[10px] p-[5px] ${tabs === "execution" ? "bg-[#434343]" : ""
                  } `}
              >
                Executions
              </button>
            </div>
            <div className="flex items-center text-white cursor-pointer p-2 hover:bg-black/10 rounded-lg">
              <History size={24} />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#53B034] peer-focus:ring-2 transition-all duration-300 p-[3px] "></div>
              <div className="absolute left-1 top-0.6 w-[18px] h-[18px] bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
            </label>
            <button
              onClick={() => {
                setTabs("editor");
              }}
              className={`rounded-[10px] bg-[#434343] py-2 px-3 text-sm font-semibold text-center text-white `}
            >
              Save
            </button>
            <button
              onClick={() => {
                setTabs("editor");
              }}
              className={`rounded-[10px] bg-[#434343] p-2 text-sm font-semibold text-center text-white `}
            >
              <Ellipsis />
            </button>
          </div>
          <div className="border-l px-5 border-black/30">
            <button
              onClick={handleTestWorkflow}
              disabled={isTestingWorkflow}
              className={`rounded-[10px] py-2 px-3 text-sm font-semibold text-center text-white ${isTestingWorkflow
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-[#B72D26] hover:bg-[#A01E18]"
                }`}
            >
              {isTestingWorkflow ? "Testing..." : "Test workflow"}
            </button>
          </div>
        </div>
      </div>
      <Modal
        title="Nodes"
        isOpen={showModal}
        size="full"
        onClose={() => {
          setShowModal(false);
        }}
      >
        <NodeModelContent
          onNodeDragStart={(e, i) => (
            onNodeDragStart(e, i), setShowModal(false)
          )}
          onNodeDblClick={(e) => (onNodeDblClick(e), setShowModal(false))}
        />
      </Modal>
    </>
  );
};

export default WorkFlowBottomBar;
