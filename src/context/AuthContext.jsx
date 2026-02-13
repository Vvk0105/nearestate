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

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
                const response = await apiClient.get('/auth/me/', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const userData = response.data;

                // Use active_role from backend
                if (userData.active_role) {
                    userData.role = userData.active_role;
                }

                // Profile completion is now tracked in User model
                // No need for separate API call

                setUser(userData);
            } catch (error) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    console.error('Auth check timed out - backend may be unreachable');
                } else {
                    console.error("Failed to fetch user", error);
                }

                // Clear user state but don't force logout - let user retry
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
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

    const handleLogout = async () => {
        try {
            // Call logout API to blacklist refresh token
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (refreshTokenValue) {
                await apiClient.post('/auth/logout/', { refresh: refreshTokenValue });
            }
        } catch (error) {
            console.error('Logout API failed:', error);
            // Continue with local logout even if API fails
        } finally {
            // Always clear local state
            setToken(null);
            setRefreshToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            googleLogout();
        }
    };

    const handleRoleSwitch = async (newRole) => {
        try {
            const res = await apiClient.post('/auth/switch-role/', { role: newRole });
            setUser(prev => ({
                ...prev,
                role: newRole,
                active_role: newRole,
                profile_completed: res.data.profile_completed
            }));
            return res.data; // Return full response
        } catch (error) {
            console.error("Switch role failed", error);
            return null;
        }
    };

    const handleSelectRole = async (role) => {
        try {
            const res = await apiClient.post('/auth/select-role/', { role });
            // Update user state with new roles and active role
            setUser(prev => ({
                ...prev,
                roles: res.data.roles,
                active_role: res.data.active_role,
                role: res.data.active_role,
                profile_completed: res.data.profile_completed // Use from backend
            }));
            return res.data; // Return full data for navigation logic
        } catch (error) {
            console.error("Select role failed", error);
            return null;
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
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;