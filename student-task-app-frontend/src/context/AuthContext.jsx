import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setUser(null);
        setToken('');
        localStorage.removeItem('token');
    };

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setTheme(userData.theme || 'light');
        localStorage.setItem('token', userToken);
    };

    useEffect(() => {
        const checkUser = async () => {
            if (token) {
                try {
                    const response = await api.get('/user');
                    setUser(response.data);
                    setTheme(response.data.theme || 'light');
                } catch (error) {
                    console.error("Token tidak valid", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkUser();
    }, [token]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            token,
            theme,
            setTheme,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};