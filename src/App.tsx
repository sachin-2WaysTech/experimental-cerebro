import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useNodesStore } from "./stores/nodes_store";
import Header from "./components/Header";

function App() {
  const getNodes = useNodesStore((state) => state.getNodes);
  useEffect(() => {
    getNodes();
  }, [getNodes]);

  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
}

export default App;
