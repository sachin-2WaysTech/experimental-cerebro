import { privateClient } from "../utils/privateClient";

export interface NodeParameter {
	name: string;
	type: string;
	default?: unknown;
	display_name: string;
	description: string;
	required: boolean;
	placeholder?: string;
	depends_on?: string[];
	options?: Array<{ name: string; value: string; description?: string }>;
	display_options?: {
		show?: { [key: string]: string[] };
	};
	type_options?: {
		min_value?: number;
		max_value?: number;
		multiple_values?: boolean;
		multiple_value_button_text?: string;
		number_precision?: number;
		load_options_depends_on?: string[];
		load_options?: {
			function: string;
		};
	};
}

export interface NodeType {
	name: string;
	display_name: string;
	description: string;
	icon: string;
	icon_color: string;
	group: string[];
	version: number;
	parameters: NodeParameter[];
	inputs: string[];
	outputs: string[];
	output_names?: string[];
	input_names?: string[];
	hidden: boolean;
	credentials?: Array<{
		name: string;
		display_name: string;
		required: boolean;
	}>;
}

export interface NodeData {
	id: string;
	type: string;
	label: string;
	parameters: { [key: string]: unknown };
	nodeType: NodeType;
	executionData?: {
		startTime?: number;
		endTime?: number;
		status?: "idle" | "running" | "success" | "error";
		error?: string;
		output?: unknown;
	};
}

class NodeService {
	private nodeTypes: NodeType[] = [];

	setNodeTypes(nodeTypes: NodeType[]) {
		this.nodeTypes = nodeTypes;
	}

	getNodeTypeByName(name: string): NodeType | undefined {
		return this.nodeTypes.find((type) => type.name === name);
	}

	getNodesByGroup(): { [group: string]: NodeType[] } {
		const grouped: { [group: string]: NodeType[] } = {};
		this.nodeTypes.forEach((nodeType) => {
			nodeType.group.forEach((group) => {
				if (!grouped[group]) {
					grouped[group] = [];
				}
				grouped[group].push(nodeType);
			});
		});

		return grouped;
	}

	async executeNode(nodeId: string, nodeData: NodeData): Promise<unknown> {
		try {
			// In a real app, this would call your execution API
			const response = await privateClient.post(`/api/execute/${nodeId}`, {
				type: nodeData.type,
				parameters: nodeData.parameters,
			});
			return response.data;
		} catch (error) {
			console.error("Error executing node:", error);
			throw error;
		}
	}
}

export const nodeService = new NodeService();
