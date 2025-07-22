import { getNodeTypes, getCredentials } from "@/service/commonService";
import type { NodeType } from "@/service/nodeService";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface CredentialParameter {
  name: string;
  type: string;
  display_name: string;
  description: string;
  required: boolean;
  sensitive?: boolean;
  default?: string;
  placeholder?: string;
  options?: Array<{
    name: string;
    value: string;
    description?: string;
  }>;
  display_options?: {
    show: {
      [key: string]: string[];
    };
  };
  type_options?: {
    max_value?: number;
    min_value?: number;
    number_precision?: number;
  };
}

interface CredentialType {
  name: string;
  display_name: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_url: string;
  documentation_url: string;
  subtitle: string;
  version: number;
  parameters: CredentialParameter[];
  allowed_nodes: string[];
  base_url: string;
}

interface NodesStore {
  nodes: NodeType[];
  isLoading: boolean;
  getNodes: () => Promise<NodeType[]>;
}

export const useNodesStore = create<NodesStore>()(
  devtools(
    persist(
      (set, get) => ({
        nodes: [],
        isLoading: false,
        getNodes: async () => {
          const currentNode = get().nodes;
          const { isLoading } = get();

          // Return cached nodes if already loaded
          if (currentNode.length > 0) {
            return currentNode;
          }

          // Prevent multiple simultaneous calls
          if (isLoading) {
            return currentNode;
          }

          set({ isLoading: true });

          try {
            const response = await getNodeTypes();
            set({
              nodes: response,
              isLoading: false,
            });
            return response;
          } catch (error) {
            console.error(error)
            set({ isLoading: false });
            return [];
          }
        },
      }),
      {
        name: "nodes-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "nodes-Store" }
  )
);

interface CredentialsStore {
  credentials: CredentialType[];
  getCredentials: () => Promise<CredentialType[]>;
  clearCredentials: () => void;
  isLoading: boolean;
}

export const useCredentialsStore = create<CredentialsStore>()(
  devtools(
    persist(
      (set, get) => ({
        credentials: [],
        isLoading: false,
        getCredentials: async () => {
          const currentCredentials = get().credentials;
          if (currentCredentials.length > 0) {
            return currentCredentials;
          }

          set({ isLoading: true });

          try {
            const response = await getCredentials();
            console.log("Credentials Response:", response);
            set({
              credentials: response,
              isLoading: false,
            });
            return response;
          } catch (error) {
            console.error("Error fetching credentials:", error);
            set({ isLoading: false });
            return [];
          }
        },
        clearCredentials: () => {
          set({ credentials: [] });
        },
      }),
      {
        name: "credentials-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ credentials: state.credentials }), // Only persist credentials
      }
    ),
    { name: "credentials-Store" }
  )
);
