import React from 'react';
import { createBrowserRouter } from 'react-router';

const Home = React.lazy(() => import('./pages/Home'));

const router = createBrowserRouter([
  {
    path: "/",
    Component: React.lazy(() => import('./App')),
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "overview",
        Component: React.lazy(() => import('./pages/overview/Overview')),
      },
      {
        path: "flows",
        Component: React.lazy(() => import('./pages/flows/WebFlow')),
      },
      {
        path: "flows/:flowId",
         Component: React.lazy(() => import('./pages/flow-editor/FlowEditor'))
      }
    ]
  }
])

export default router;