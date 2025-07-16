import { privateClient } from "@/utils/privateClient";
import type { NodeType } from "./nodeService";

export async function getNodeTypes(): Promise<NodeType[]> {
  try {
    const response = await privateClient.get('/nodes/');
    const { data, status } = response
    
    if (status) {
      return data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching node types:', error);
    return [];
  }
}