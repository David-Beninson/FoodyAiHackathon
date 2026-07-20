import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Common/Layout.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import Calendar from './pages/Calendar/Calendar.jsx'
import Profile from './pages/Profile/Profile.jsx'

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <Calendar />
        },
        {
          path: '/Profile',
          element: <Profile />
        },
        {
          path: '*',
          element: <NotFound />
        }
      ]
    }
  ])
  return <RouterProvider router={router} />
}