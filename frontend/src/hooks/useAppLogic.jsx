import { useState, useEffect, useMemo } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import axios from 'axios'
import Layout from '../components/Common/Layout/Layout'
import HomePage from '../pages/Home/Home'
import RequestsBoard from '../pages/Dashborad/Dashborad'
import ProfilePage from '../pages/Profile/Profile'
import NotFound from '../pages/NotFound/NotFound'

export function useAppLogic() {
    // Read user role from localStorage, defaulting to null if not logged in
    const [userRole, setUserRole] = useState(() => {
        try {
            const savedUserStr = localStorage.getItem('user');
            if (savedUserStr) {
                const savedUser = JSON.parse(savedUserStr);
                return savedUser.user_type || null;
            }
        } catch (e) {
            console.error('Error reading user role from localStorage:', e);
        }
        return null;
    });

    // Updates hook state immediately when a user logs in successfully
    const handleLoginSuccess = async () => {
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
            try {
                const savedUser = JSON.parse(savedUserStr);
                setUserRole(savedUser.user_type || null);
                return;
            } catch (e) {
                console.error(e);
            }
        }

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get('http://localhost:8000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userData = response.data;
                setUserRole(userData.user_type);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                console.error("Failed to fetch user info after login:", error);
                setUserRole(null);
            }
        }
    };

    useEffect(() => {
        const handleLogout = () => {
            setUserRole(null);
        };
        window.addEventListener('auth-logout', handleLogout);
        return () => {
            window.removeEventListener('auth-logout', handleLogout);
        };
    }, []);

    // Memoize router configuration to prevent unnecessary recreations unless userRole changes
    const router = useMemo(() => {
        return createBrowserRouter([
            {
                path: '/',
                element: <Layout userRole={userRole} />,
                errorElement: <NotFound />,
                children: [
                    {
                        index: true,
                        element: <HomePage />
                    },
                    {
                        path: 'profile',
                        element: (
                            <ProtectedRoute userRole={userRole}>
                                <ProfilePage />
                            </ProtectedRoute>
                        )
                    },
                    // Guest Protected Routes
                    {
                        path: 'find-host',
                        element: (
                            <ProtectedRoute allowedRoles={['guest']} userRole={userRole}>
                                <FindHost />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'my-requests',
                        element: (
                            <ProtectedRoute allowedRoles={['guest']} userRole={userRole}>
                                <MyRequests />
                            </ProtectedRoute>
                        )
                    },
                    // Host Protected Routes
                    {
                        path: 'requests-board',
                        element: (
                            <ProtectedRoute allowedRoles={['host']} userRole={userRole}>
                                <RequestsBoard />
                            </ProtectedRoute>
                        )
                    },
                    // Admin Protected Routes
                    {
                        path: 'admin',
                        element: (
                            <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                                <AdminLayout />
                            </ProtectedRoute>
                        ),
                        children: [
                            { index: true, element: <AdminDashboard /> },
                            { path: 'users', element: <AdminUsers /> },
                            { path: 'bookings', element: <AdminBookings /> },
                            { path: 'listings', element: <AdminListings /> }
                        ]
                    }
                ]
            },
            {
                path: '/login',
                element: userRole ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
            },
            {
                path: '/register', // Updated route path from /signup
                element: userRole ? <Navigate to="/" replace /> : <Register /> // Updated component from SignUp
            },
            {
                path: '*',
                element: <NotFound />
            }
        ]);
    }, [userRole]);

    return { router };
}