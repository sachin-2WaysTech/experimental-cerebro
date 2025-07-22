import { privateClient } from "@/utils/privateClient";
import type { NodeType } from "./nodeService";
import type {  WorkflowResponse } from "@/stores/workflow_store";

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

export async function getAllWorkflow(): Promise<WorkflowResponse> {
  try {
    const response = await privateClient.get('/workflows/');
    const { data, status } = response

    if (status) {
      return data
    } else {
      return { workflows: [], total: 0, page: 1, size: 100 } as WorkflowResponse; // Default empty response
    }
  } catch (error) {
    console.error('Error fetching node types:', error);
    return { workflows: [], total: 0, page: 1, size: 100 } as WorkflowResponse; // Default empty response
  }
}
export async function createWorkflow(body: Record<string, unknown>): Promise<unknown> {
  try {
    const response = await privateClient.post('/workflows/', body);
    const { data, status } = response

    if (status) {
      return data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error creating workflow:', error);
    return [];
  }
}

export async function getCredentials(): Promise<any[]> {
  try {
    const response = await privateClient.get('/credentials/');
    const { data, status } = response

    if (status) {
      return data
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return [];
  }
}

export async function createCredential(credentialData: {
  name: string;
  display_name: string;
  type: string;
  data: Record<string, unknown>;
}): Promise<any> {
  try {
    const response = await privateClient.post('/credentials/', credentialData); // Adjust the endpoint as needed
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      throw new Error('Failed to create credential');
    }
  } catch (error) {
    console.error('Error creating credential:', error);
    throw error;
  }
}

export async function getSavedCredentials(): Promise<any[]> {
  try {
    const response = await privateClient.get('/credentials/saved/'); // Adjust the endpoint as needed
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching saved credentials:', error);
    return [];
  }
}