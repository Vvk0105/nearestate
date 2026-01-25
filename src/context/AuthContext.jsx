import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [loading, setLoading] = useState(true);

    // Initialize axios client base URL
    const apiClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor to add token
    apiClient.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Response interceptor for automatic token refresh
    apiClient.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // If error is 401 and we haven't tried to refresh yet
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Try to refresh the token
                    const refreshTokenValue = localStorage.getItem('refreshToken');

                    if (!refreshTokenValue) {
                        throw new Error('No refresh token available');
                    }

                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`,
                        { refresh: refreshTokenValue }
                    );

                    const { access } = response.data;

                    // Update the token
                    setToken(access);
                    localStorage.setItem('token', access);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh token is invalid or expired
                    console.error('Token refresh failed:', refreshError);
                    handleLogout();
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await apiClient.get('/auth/me/');
                const userData = response.data;
                if (userData.active_role) {
                    userData.role = userData.active_role;
                }

                // Check Exhibitor Profile
                if (userData.role === 'EXHIBITOR') {
                    try {
                        const profileRes = await apiClient.get('/exhibitions/exhibitor/profile/status/');
                        userData.profileCompleted = profileRes.data.exists;
                    } catch (e) {
                        console.warn('Profile check failed', e);
                        userData.profileCompleted = false;
                    }
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

    const handleLogin = (newToken, userData, newRefreshToken) => {
        setToken(newToken);
        setRefreshToken(newRefreshToken);

        // Ensure role is consistent
        if (userData?.active_role) {
            userData.role = userData.active_role;
        }
        setUser(userData);

        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }
    };

    const handleLogout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        googleLogout();
    };

    const handleRoleSwitch = async (newRole) => {
        try {
            await apiClient.post('/auth/switch-role/', { role: newRole });
            setUser(prev => ({ ...prev, role: newRole, active_role: newRole }));
            return true;
        } catch (error) {
            console.error("Switch role failed", error);
            return false;
        }
    };

    const handleSelectRole = async (role) => {
        try {
            const res = await apiClient.post('/auth/select-role/', { role });
            // Update user state with new roles and active role
            setUser(prev => ({
                ...prev,
                roles: res.data.roles,
                unique_id: res.data.unique_id, // If backend returns it, otherwise ignore
                active_role: res.data.active_role,
                role: res.data.active_role
            }));
            return true;
        } catch (error) {
            console.error("Select role failed", error);
            return false;
        }
    };

    const value = {
        user,
        setUser,
        token,
        refreshToken,
        loading,
        login: handleLogin,
        logout: handleLogout,
        apiClient,
        switchRole: handleRoleSwitch,
        selectRole: handleSelectRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;