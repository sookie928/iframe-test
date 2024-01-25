import ReactDOM from 'react-dom/client';
import './index.css';
import Select from './pages/Select';
import Font from './pages/Font';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <div>Hello world!</div>,
    },
    {
      path: '/font',
      element: <Font />,
    },
    {
      path: '/select',
      element: <Select />,
    },
  ],
  { basename: '/iframe-test' }
);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
