import { useEffect, useState } from "react";
import { useWorkflowStore } from "@/stores/workflow_store";
import { createWorkflow } from "@/service/commonService";
import { Plus, Calendar, Tag, Play, Edit, Trash2 } from "lucide-react";

function WebFlow() {
  const {
    workflows,
    isLoading,
    error,
    getAllWorkflows,
    deleteWorkflow,
    clearError,
  } = useWorkflowStore();

  console.log(workflows, "workflows");

  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    is_active: true,
    status: "draft",
    version_name: "Initial Version",
    environment: "production",
    trigger: "webhook",
    webhook_url: "",
  });

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

  const handleCreateWorkflow = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a workflow name");
      return;
    }

    setIsCreating(true);
    try {
      // Parse tags into array of IDs (for now using dummy IDs 1,2,3)
      const tagIds = formData.tags ? [1, 2, 3] : [];

      const workflowBody = {
        description:
          formData.description ||
          "Automated workflow for onboarding new customers",
        initial_data: {
          environment: formData.environment,
          trigger: formData.trigger,
        },
        is_active: formData.is_active,
        name: formData.name,
        status: formData.status,
        tag_ids: tagIds,
        version_name: formData.version_name,
        work_flow: {
          connections: [],
          nodes: [
            {
              config: {
                webhook_url: formData.webhook_url || "",
              },
              id: "start",
              position: [100, 100],
              type: "trigger",
            },
          ],
          start_node: "wait_1",
          version_name: formData.version_name,
        },
      };

      const response = await createWorkflow(workflowBody);
      console.log("Workflow creation response:", response);

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        tags: "",
        is_active: true,
        status: "draft",
        version_name: "Initial Version",
        environment: "production",
        trigger: "webhook",
        webhook_url: "",
      });
      setShowAddModal(false);

      // Refresh workflows list
      getAllWorkflows();
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Failed to create workflow. Please try again.");
    } finally {
      setIsCreating(false);
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
            onClick={() => setShowAddModal(true)}
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
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.uid}
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            workflow.is_active
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
                        {Object.keys(workflow.work_flow.nodes).length}
                      </div>
                      <div className="text-xs text-gray-500">Nodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {Object.keys(workflow.work_flow.connections).length}
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
                        console.log("Execute workflow:", workflow.uid)
                      }
                    >
                      <Play size={14} />
                      <span>Execute</span>
                    </button>
                    <button
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() =>
                        console.log("Edit workflow:", workflow.uid)
                      }
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 text-sm rounded-md hover:bg-red-100 transition-colors"
                      onClick={() =>
                        handleDeleteWorkflow(workflow.uid, workflow.name)
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

        {/* Add Workflow Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create New Workflow</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateWorkflow();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter workflow name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your workflow"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., automation, sales, marketing"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Environment
                    </label>
                    <select
                      value={formData.environment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          environment: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger Type
                    </label>
                    <select
                      value={formData.trigger}
                      onChange={(e) =>
                        setFormData({ ...formData, trigger: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="webhook">Webhook</option>
                      <option value="schedule">Schedule</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) =>
                      setFormData({ ...formData, webhook_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/webhook"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Set as active workflow
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        name: "",
                        description: "",
                        tags: "",
                        is_active: true,
                        status: "draft",
                        version_name: "Initial Version",
                        environment: "production",
                        trigger: "webhook",
                        webhook_url: "",
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !formData.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Creating..." : "Create Workflow"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebFlow;
