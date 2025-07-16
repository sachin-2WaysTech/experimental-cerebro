import Modal from "@/components/Modal";
import { Ellipsis, History, Plus } from "lucide-react"
import { useState, type FC } from "react"
import NodeModelContent, { type NodesSidebarProps } from "./NodeModelContent";


type TabsType = "editor" | "execution"

const WorkFlowBottomBar: FC<NodesSidebarProps> = ({
  onNodeDragStart,
  onNodeDblClick
}) => {
  const [tabs, setTabs] = useState<TabsType>("editor");
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="absolute top-4 flex justify-center  w-full ">
        <div className="rounded-[10px] border-black/30 bg-[#232323] p-2.5 shadow-xl flex gap-5 w-[80%] divide-x-2 divide-gray-700 text-lg font-semibold">
          <p className="text-brand-gradient">{
            tabs === "editor" ? "Editor" : "Executions"
          }</p>
          <p className="text-white">Cron to Start Webinar Reminders</p>
        </div>
      </div>

      <div className="absolute bottom-2 w-full flex justify-center items-center ">
        <div className="rounded-[20px] border-black/30 bg-[#232323] p-2.5 shadow-xl flex gap-5 ">
          <div className="flex items-center gap-5">
            <div className="flex items-center text-white cursor-pointer bg-brand-gradient p-2 hover:bg-black/10 rounded-lg" onClick={() => setShowModal(true)} >
              <Plus size={24} />
            </div>
            <div className="bg-[#0D0D0D] rounded-xl text-white p-[3px] text-sm font-semibold text-center">
              <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] p-[5px] ${tabs === "editor" ? "bg-[#434343]" : ""} `}>Editor</button>
              <button onClick={() => { setTabs("execution") }} className={`rounded-[10px] p-[5px] ${tabs === "execution" ? "bg-[#434343]" : ""} `}>Executions</button>
            </div>
            <div className="flex items-center text-white cursor-pointer p-2 hover:bg-black/10 rounded-lg">
              <History size={24} />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#53B034] peer-focus:ring-2 transition-all duration-300 p-[3px] "></div>
              <div className="absolute left-1 top-0.6 w-[18px] h-[18px] bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
            </label>
            <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] bg-[#434343] py-2 px-3 text-sm font-semibold text-center text-white `}>Save</button>
            <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] bg-[#434343] p-2 text-sm font-semibold text-center text-white `}>
              <Ellipsis />
            </button>
          </div>
          <div className="border-l px-5 border-black/30">
            <button onClick={() => { setTabs("editor") }} className={`rounded-[10px] bg-[#B72D26] py-2 px-3 text-sm font-semibold text-center text-white `}>Test workflow</button>
          </div>
        </div>
      </div>
      <Modal title="Nodes" isOpen={showModal} size="full" onClose={() => { setShowModal(false) }}>
        <NodeModelContent
          onNodeDragStart={(e, i) => (onNodeDragStart(e, i), setShowModal(false))}
          onNodeDblClick={(e) => (onNodeDblClick(e), setShowModal(false))}
        />
      </Modal>
    </>
  )
}

export default WorkFlowBottomBar