import { getAllWorkflow } from "@/service/commonService";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface WorkflowResponse {
  workflows: Workflow[];
  total: number;
  page: number;
  size: number;
}

interface WorkflowTag {
  id: number;
  name: string;
}

interface WorkflowConnection {
  main: string[][];
}

interface WorkflowNode {
  description: string;
  display_name: string;
  name: string;
  parameters: Record<string, unknown>;
  position: [number, number];
  type: string;
  version: number;
}

interface Workflow {
  active_version_id: number;
  created_at: string;
  created_by: number;
  is_active: boolean;
  name: string;
  tags: WorkflowTag[];
  id: string;
  updated_at: string;
  version_no: number;
  work_flow: {
    connections: Record<string, WorkflowConnection>;
    nodes: Record<string, WorkflowNode>;
    start_node: string;
  };
}

interface WorkflowStoreState {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  getAllWorkflows: () => Promise<Workflow[]>;
  getWorkflowByUid: (uid: string) => Workflow | undefined;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (uid: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (uid: string) => void;
  clearError: () => void;
  refreshWorkflows: () => Promise<Workflow[]>;
}

export const useWorkflowStore = create<WorkflowStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        workflows: [],
        isLoading: false,
        error: null,

        getAllWorkflows: async () => {
          const currentWorkflows = get().workflows;
          if (currentWorkflows.length > 0) {
            return currentWorkflows;
          }

          set({ isLoading: true, error: null });
          try {
            const response = (await getAllWorkflow()) as WorkflowResponse;
            set({ workflows: response?.workflows, isLoading: false });
            return response.workflows;
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch workflows";
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        getWorkflowByUid: (id: string) => {
          return get().workflows.find((workflow) => workflow.id === id);
        },

        addWorkflow: (workflow: Workflow) => {
          set((state) => ({
            workflows: [...state.workflows, workflow],
          }));
        },

        updateWorkflow: (id: string, updates: Partial<Workflow>) => {
          set((state) => ({
            workflows: state.workflows.map((workflow) =>
              workflow.id === id ? { ...workflow, ...updates } : workflow
            ),
          }));
        },

        deleteWorkflow: (id: string) => {
          set((state) => ({
            workflows: state.workflows.filter(
              (workflow) => workflow.id !== id
            ),
          }));
        },

        clearError: () => {
          set({ error: null });
        },

        refreshWorkflows: async () => {
          set({ workflows: [], isLoading: true, error: null });
          return get().getAllWorkflows();
        },
      }),
      {
        name: "workflow-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "workflow-store" }
  )
);

// Export types for use in other files
export type { Workflow, WorkflowTag, WorkflowNode, WorkflowConnection };
