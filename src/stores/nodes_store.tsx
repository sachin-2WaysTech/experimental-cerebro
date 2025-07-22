import { getNodeTypes, getCredentials, getSavedCredentials, createCredential } from "@/service/commonService";
import type { NodeType } from "@/service/nodeService";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface CredentialParameter {
  name: string;
  type: string;
  display_name: string;
  description: string;
  required: boolean;
  sensitive?: boolean;
  default?: any;
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

export interface SavedCredential {
  id: string;
  name: string;
  display_name: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface CredentialsStore {
  credentials: CredentialType[];
  savedCredentials: SavedCredential[];
  getCredentials: () => Promise<CredentialType[]>;
  getSavedCredentials: () => Promise<SavedCredential[]>;
  createCredential: (credentialData: {
    name: string;
    display_name: string;
    type: string;
    data: Record<string, unknown>;
  }) => Promise<SavedCredential>;
  addSavedCredential: (credential: SavedCredential) => void;
  clearCredentials: () => void;
  isLoading: boolean;
}

export const useCredentialsStore = create<CredentialsStore>()(
  devtools(
    persist(
      (set, get) => ({
        credentials: [],
        savedCredentials: [],
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
        getSavedCredentials: async () => {
          try {
            const response = await getSavedCredentials();
            set({ savedCredentials: response });
            return response;
          } catch (error) {
            console.error("Error fetching saved credentials:", error);
            return get().savedCredentials;
          }
        },
        createCredential: async (credentialData) => {
          try {
            const newCredential = await createCredential(credentialData);
            const savedCredential: SavedCredential = {
              id: newCredential.id || Date.now().toString(),
              name: credentialData.name,
              display_name: credentialData.display_name,
              type: credentialData.type,
              data: credentialData.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set((state) => ({
              savedCredentials: [...state.savedCredentials, savedCredential],
            }));

            return savedCredential;
          } catch (error) {
            console.error("Error creating credential:", error);
            throw error;
          }
        },
        addSavedCredential: (credential: SavedCredential) => {
          set((state) => ({
            savedCredentials: [...state.savedCredentials, credential],
          }));
        },
        clearCredentials: () => {
          set({ credentials: [], savedCredentials: [] });
        },
      }),
      {
        name: "credentials-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          credentials: state.credentials,
          savedCredentials: state.savedCredentials
        }), // Persist both credential types and saved credentials
      }
    ),
    { name: "credentials-Store" }
  )
);
