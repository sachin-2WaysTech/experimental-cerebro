import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

const RootLayout: React.FC = () => {
  const location = useLocation();

  // Don't show header on login page and flow editor pages
  const showHeader = location.pathname !== "/login" && !location.pathname.startsWith("/flow/");

  return (
    <div className="min-h-screen">
      {showHeader && <Header />}
      <Outlet />
    </div>
  );
};

export default RootLayout;
