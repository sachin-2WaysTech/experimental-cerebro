import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useNodesStore } from "./stores/nodes_store";

function App() {
  const getNodes = useNodesStore((state) => state.getNodes);
  useEffect(() => {
    getNodes();
  }, [getNodes]);

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

export default App;
