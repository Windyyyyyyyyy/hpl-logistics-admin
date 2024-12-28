import { createBrowserRouter } from "react-router";
import AdminRoutes from "./AdminRoutes";

const AppRoutes = createBrowserRouter([...AdminRoutes]);

export default AppRoutes;
