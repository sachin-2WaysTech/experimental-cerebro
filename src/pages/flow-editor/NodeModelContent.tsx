import React, { type FC } from "react";
import * as Icons from "lucide-react";
import { type NodeType } from "../../service/nodeService";
import { useNodesStore } from "@/stores/nodes_store";

export interface NodesSidebarProps {
  onNodeDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => void;
  onNodeDblClick: (nodeType: NodeType) => void;
  onTestWorkflow?: () => void;
}

interface NodeModelContentProps extends NodesSidebarProps {
  isOnlyInput?: boolean;
}

const NodeModelContent: FC<NodeModelContentProps> = ({
  onNodeDragStart,
  onNodeDblClick,
  isOnlyInput = false,
}) => {
  const nodes = useNodesStore((state) => state.nodes);

  const getIcon = (iconName: string) => {
    const iconKey = iconName
      ?.split("-")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const IconsMap = Icons as unknown as Record<
      string,
      React.ComponentType<{ size?: number; className?: string }>
    >;
    return IconsMap[iconKey] || Icons.Circle;
  };

  const getListofNodes = () => {
    if (isOnlyInput) {
      return nodes.filter((node) => node.inputs?.length > 0);
    }
    return nodes;
  };

  return (
    <div className="h-full border-r border-gray-700 flex flex-col bg-[#121212]">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="border-b border-gray-800 last:border-b-0">
          <div className="grid grid-cols-2 gap-2">
            {getListofNodes().map((nodeType) => {
              const NodeIcon = nodeType.icon
                ? getIcon(nodeType.icon)
                : Icons.Circle;
              return (
                <div
                  key={nodeType.name}
                  draggable
                  onDragStart={(event) => onNodeDragStart(event, nodeType)}
                  onDoubleClick={() => onNodeDblClick(nodeType)}
                  className="p-2 bg-[#1e1e1e] rounded-md shadow hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: nodeType.icon_color }}
                    >
                      <NodeIcon size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-white truncate">
                        {nodeType.display_name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {nodeType.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeModelContent;
