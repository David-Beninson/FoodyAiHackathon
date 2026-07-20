import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/Common/ProtectedRoute.jsx'
import Layout from './components/Common/Layout.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import Calendar from './pages/Calendar/Calendar.jsx'
import Profile from './pages/Profile/Profile.jsx'
import Planner from './pages/Planner/Planner.jsx'
import Pantry from './pages/Pantry/Pantry.jsx'
import ShoppingList from './pages/ShoppingList/ShoppingList.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
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
          path: '/planner',
          element: <Planner />
        },
        {
          path: '/pantry',
          element: <Pantry />
        },
        {
          path: '/shopping-list',
          element: <ShoppingList />
        }
      ]
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}