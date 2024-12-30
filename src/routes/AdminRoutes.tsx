import { RouteObject } from 'react-router';
import AdminLayout from '../layout/index';
import ImportExcel from '../pages/ImportExcel';

const AdminRoutes: Array<RouteObject> = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <ImportExcel />,
      },
    ],
  },
];

export default AdminRoutes;
