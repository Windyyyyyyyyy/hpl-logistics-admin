import { RouteObject } from 'react-router';
import AdminLayout from '../layout/index';
import ImportExcel from '../pages/ImportExcel';
import Messages from '../pages/Messages';
import MessageDetail from '../pages/Messages/messageDetail';

const AdminRoutes: Array<RouteObject> = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <ImportExcel />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'messages/:id',
        element: <MessageDetail />,
      },
    ],
  },
];

export default AdminRoutes;
