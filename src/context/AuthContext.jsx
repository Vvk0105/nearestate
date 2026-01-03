import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Initialize axios client base URL
    const apiClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // Interceptor to add token
    apiClient.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await apiClient.get('/auth/me/');
                const userData = response.data;
                // Normalize active_role to role for frontend consistency
                if (userData.active_role) {
                    userData.role = userData.active_role;
                }
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user", error);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const handleLogin = (newToken, userData) => {
        setToken(newToken);
        // Ensure role is consistent
        if (userData?.active_role) {
            userData.role = userData.active_role;
        }
        setUser(userData);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        googleLogout();
    };

    const handleRoleSwitch = async (newRole) => {
        // Implement role switch logic if backend supports immediate switch or just update local
        // The backend has /auth/switch-role/
        try {
            await apiClient.post('/auth/switch-role/', { role: newRole });
            setUser(prev => ({ ...prev, role: newRole })); // Assuming response or optimistic update
            return true;
        } catch (error) {
            console.error("Switch role failed", error);
            return false;
        }
    };

    const value = {
        user,
        token,
        loading,
        login: handleLogin,
        logout: handleLogout,
        apiClient,
        switchRole: handleRoleSwitch
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
