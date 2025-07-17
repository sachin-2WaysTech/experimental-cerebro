export const API_ROUTES = {
  WORKFLOWS: {
    GET_ALL: {route:"/workflows", method: "GET"},
    CREATE: {route:"/workflows", method: "POST"},
    UPDATE: (id: string) => ({route: `/workflows/${id}`, method: "PUT"}),
    DELETE: (id: string) => ({route: `/workflows/${id}`, method: "DELETE"}),
  },
  NODES: {
    GET_ALL: {route: "/nodes", method: "GET"},
    GET_BY_ID: (id: string) => ({route: `/nodes/${id}`, method: "GET"}),
    CREATE: {route: "/nodes", method: "POST"},
    UPDATE: (id: string) => ({route: `/nodes/${id}`, method: "PUT"}),
    DELETE: (id: string) => ({route: `/nodes/${id}`, method: "DELETE"}),
  },
};
