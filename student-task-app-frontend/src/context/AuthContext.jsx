import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { parseUserPayload } from '../utils/apiResponse';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // <-- Cache untuk profile
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [theme, setTheme] = useState('light');
    const [colorTheme, setColorTheme] = useState(localStorage.getItem('colorTheme') || 'calm');
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
                    const parsedUser = parseUserPayload(response.data);
                    setUser(parsedUser);
                    setUserProfile(parsedUser); // <-- Cache profile
                    setTheme(parsedUser?.theme || 'light');
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

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-calm', 'theme-forest', 'theme-midnight');
        root.classList.add(`theme-${colorTheme}`);
        localStorage.setItem('colorTheme', colorTheme);
    }, [colorTheme]);

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,      
            setUser,
            updateUserProfile,  
            token,
            theme,
            setTheme,
            colorTheme,
            setColorTheme,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};