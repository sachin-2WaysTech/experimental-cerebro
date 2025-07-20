import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ProtectedWrapper } from "./components/ProtectedWrapper";

const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Overview = React.lazy(() => import("./pages/overview/Overview"));
const WebFlow = React.lazy(() => import("./pages/flows/WebFlow"));
const FlowEditor = React.lazy(() => import("./pages/flow-editor/FlowEditor"));
const RootLayout = React.lazy(() => import("./components/RootLayout"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <RootLayout />
      </Suspense>
    ),
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        ),
      },
      {
        index: true,
        element: (
          <ProtectedWrapper>
            <Home />
          </ProtectedWrapper>
        ),
      },
      {
        path: "overview",
        element: (
          <ProtectedWrapper>
            <Overview />
          </ProtectedWrapper>
        ),
      },
      {
        path: "flows",
        element: (
          <ProtectedWrapper>
            <WebFlow />
          </ProtectedWrapper>
        ),
      },
      {
        path: "flow/:flowId",
        element: (
          <ProtectedWrapper>
            <FlowEditor />
          </ProtectedWrapper>
        ),
      },
    ],
  },
]);

export default router;
