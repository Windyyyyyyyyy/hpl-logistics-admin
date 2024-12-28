import { RouteObject } from "react-router";
import AdminLayout from "../layout";

const AdminRoutes: Array<RouteObject> = [
  {
    path: "/",
    element: <AdminLayout />,
    children: [ ],
  },
];

export default AdminRoutes;
