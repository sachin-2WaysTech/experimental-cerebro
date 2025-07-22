import { useEffect } from "react";
import { useWorkflowStore } from "@/stores/workflow_store";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Tag, Play, Edit, Trash2 } from "lucide-react";
import { getAddWorkflow } from "@/service/commonService";

function WebFlow() {
  const {
    workflows,
    isLoading,
    error,
    getAllWorkflows,
    deleteWorkflow,
    clearError,
    addWorkflow,
  } = useWorkflowStore();

  const navigate = useNavigate();

  console.log("WebFlow component rendered:", { workflows: workflows.length, isLoading, error });

  // Load workflows on component mount
  useEffect(() => {
    getAllWorkflows().catch((err) => {
      console.error("Failed to load workflows:", err);
    });
  }, [getAllWorkflows]);

  const handleDeleteWorkflow = (uid: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteWorkflow(uid);
    }
  };

  const handleCreateNewWorkflow = async () => {
    try {
      const newWorkflow = await getAddWorkflow();

      if (newWorkflow && "id" in newWorkflow) {
        addWorkflow(newWorkflow);
        navigate(`/flow/${newWorkflow.id}`);
      } else {
        alert("Failed to create new workflow.");
      }
    } catch (error) {
      console.error("Error creating new workflow:", error);
      alert("An error occurred while creating a workflow.");
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (isLoading && workflows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading workflows...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && workflows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">Failed to load workflows</div>
              <div className="text-sm text-gray-500 mb-4">{error}</div>
              <button
                onClick={() => {
                  clearError();
                  getAllWorkflows();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-600 mt-2">
              Manage and execute your automation workflows
            </p>
          </div>
          <button
            onClick={handleCreateNewWorkflow}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Plus size={20} />
            <span>Add Workflow</span>
          </button>
        </div>

        {/* Error banner */}
        {error && workflows.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-700">{error}</div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No workflows yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first workflow to get started with automation
            </p>
            <button
              onClick={handleCreateNewWorkflow}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Workflow Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {workflow.name || "Untitled Workflow"}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>v{workflow.version_no}</span>
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${workflow.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {workflow.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {workflow.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          <Tag size={12} />
                          <span>{tag.name}</span>
                        </span>
                      ))}
                      {workflow.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{workflow.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {/* {Object.keys(workflow.work_flow.nodes).length} */}
                      </div>
                      <div className="text-xs text-gray-500">Nodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {/* {Object.keys(workflow.work_flow.connections).length} */}
                      </div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 mb-4">
                    <div>Created: {formatDate(workflow.created_at)}</div>
                    <div>Updated: {formatDate(workflow.updated_at)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      onClick={() =>
                        console.log("Execute workflow:", workflow.id)
                      }
                    >
                      <Play size={14} />
                      <span>Execute</span>
                    </button>
                    <button
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() =>
                        console.log("Edit workflow:", workflow.id)
                      }
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100 transition-colors"
                      onClick={() =>
                        handleDeleteWorkflow(workflow.id, workflow.name)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WebFlow;
