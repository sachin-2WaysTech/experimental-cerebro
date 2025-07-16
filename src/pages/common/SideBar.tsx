import { Home, Workflow } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: "Overview",
      path: "/overview",
      isActive: location.pathname === "/overview"
    },
    {
      icon: Workflow,
      label: "Workflows",
      path: "/",
      isActive: location.pathname === "/" || location.pathname.startsWith("/flows/")
    }
  ];

  return (
    <div className="flex justify-center items-center">
      <div className="px-7 py-6 border-black/70 bg-[#232323] shadow-black flex flex-col w-80 rounded">
        <div className="mb-6">
          <h2 className="text-white font-bold text-lg">Cerebro</h2>
          <p className="text-gray-400 text-sm">Workflow Automation</p>
        </div>

        <ul className="flex-1 overflow-y-auto space-y-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex gap-3 items-center p-3 rounded-lg transition-colors ${item.isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
                    }`}
                >
                  <div className={`w-1 rounded-r ${item.isActive ? "bg-white" : "bg-transparent"}`}></div>
                  <IconComponent size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SideBar;