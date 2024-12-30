import { RouterProvider } from "react-router/dom";
import AppRoutes from "./routes/AppRoutes";
import './i18n';

function App() {
  return <RouterProvider router={AppRoutes} />;
}

export default App;
