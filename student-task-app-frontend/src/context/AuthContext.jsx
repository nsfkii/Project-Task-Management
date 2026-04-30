import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // <-- Cache untuk profile
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);

    const logout = () => {
        setUser(null);
        setUserProfile(null); // <-- Clear cache profile
        setToken('');
        localStorage.removeItem('token');
        localStorage.removeItem('mahasiswaData');
        localStorage.removeItem('lastNotifiedDate');
    };

    const login = (userData, userToken) => {
        setUser(userData);
        setUserProfile(userData); // <-- Cache profile saat login
        setToken(userToken);
        setTheme(userData.theme || 'dark');
        localStorage.setItem('token', userToken);
    };

    // Fungsi untuk update profile (dipanggil setelah edit profile)
    const updateUserProfile = (profileData) => {
        setUserProfile(profileData);
        setUser(profileData);
    };

    useEffect(() => {
        const checkUser = async () => {
            if (token) {
                try {
                    const response = await api.get('/user');
                    setUser(response.data);
                    setUserProfile(response.data); // <-- Cache profile
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
            userProfile,      
            setUser,
            updateUserProfile,  
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