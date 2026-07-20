import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Common/Layout.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import Profile from './pages/Profile/Profile.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <HomePage />
        },
        {
          path: '/Profile',
          element: <Profile />
        },
        {
          path: '/dashboard',
          element: <Dashboard />
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