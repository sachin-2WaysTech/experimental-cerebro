import { getNodeTypes } from "@/service/commonService";
import type { NodeType } from "@/service/nodeService";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface NodesStore {
  nodes: NodeType[];
  getNodes: () => Promise<NodeType[]>
}

export const useNodesStore = create<NodesStore>()(
  devtools(
    persist(
      (set, get) => ({
        nodes: [],
        getNodes: async () => {
          const currentNode = get().nodes;
          if (currentNode.length > 0) {
            return currentNode
          }

          const response = await getNodeTypes();
          set({
            nodes: response,
          });
          return response;
        }
      }),
      {
        name: "nodes-storage",
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "nodes-Store" }
  )
);   