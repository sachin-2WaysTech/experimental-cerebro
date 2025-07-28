import { privateClient } from "@/utils/privateClient";
import type { NodeType } from "./nodeService";
import type { Workflow, WorkflowResponse } from "@/stores/workflow_store";
import type { CreateCredentialConfig } from "@/stores/nodes_store";

export async function getNodeTypes(): Promise<NodeType[]> {
  try {
    const response = await privateClient.get("/nodes/");
    const { data, status } = response;
    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching node types:", error);
    return [];
  }
}

export async function getAllWorkflow(): Promise<WorkflowResponse> {
  try {
    const response = await privateClient.get("/workflows/");
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return {
        workflows: [],
        total: 0,
        page: 1,
        size: 100,
      } as WorkflowResponse; // Default empty response
    }
  } catch (error) {
    console.error("Error fetching node types:", error);
    return { workflows: [], total: 0, page: 1, size: 100 } as WorkflowResponse; // Default empty response
  }
}
export async function getAddWorkflow(): Promise<Workflow | []> {
  try {
    const response = await privateClient.get("/workflows/new");
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error ", error);
    return [];
  }
}

export async function createWorkflow(
  body: Record<string, unknown>
): Promise<unknown> {
  try {
    const response = await privateClient.post("/workflows/", body);
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error creating workflow:", error);
    return [];
  }
}

export async function getCredentials(): Promise<any[]> {
  try {
    const response = await privateClient.get("/credentials/");
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return [];
  }
}

export async function createCredential(
  credentialData: CreateCredentialConfig
): Promise<any> {
  try {
    console.log(credentialData, "credential data");
    const response = await privateClient.post("/credentials/", credentialData);

    const { data, status } = response;

    if (status) {
      return {
        ...data,
        parameters: data.parameters ?? credentialData.parameters,
      };
    } else {
      throw new Error("Failed to create credential");
    }
  } catch (error) {
    console.error("Error creating credential:", error);
    throw error;
  }
}

export async function getWorkflowById(workflowId: string): Promise<Workflow | null> {
  try {
    const response = await privateClient.get(`/workflows/${workflowId}`);
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching workflow by ID:", error);
    return null;
  }
}

export async function executeWorkflow(
  workflowId: string,
  workflowData: {
    work_flow: {
      nodes: Record<string, any>;
      connections: Record<string, any>;
    };
    input_data: Record<string, any>;
  }
): Promise<any> {
  try {
    const response = await privateClient.post(
      `/workflows/execute/${workflowId}`,
      workflowData
    );
    const { data, status } = response;

    if (status || response.status === 200) {
      return data;
    } else {
      throw new Error("Failed to execute workflow");
    }
  } catch (error) {
    console.error("Error executing workflow:", error);
    throw error;
  }
}

export async function getSavedCredentials(): Promise<any[]> {
  try {
    const response = await privateClient.get("/credentials/saved/"); // Adjust the endpoint as needed
    const { data, status } = response;

    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching saved credentials:", error);
    return [];
  }
}
