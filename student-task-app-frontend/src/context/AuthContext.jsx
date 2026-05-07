import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { parseUserPayload } from '../utils/apiResponse';

export const themes = {
    calm: {
        primary: '#5f8f87',
        primaryHover: '#4a7a72',
        primaryLight: '#e8f0ee',
        secondary: '#43615d',
        accent: '#8fb0aa',
        gradient: 'from-[#5f8f87] to-[#43615d]',
        sweetalert: '#5f8f87',
    },
    forest: {
        primary: '#4d8b68',
        primaryHover: '#3a7050',
        primaryLight: '#e4f0e8',
        secondary: '#365f48',
        accent: '#7aad8c',
        gradient: 'from-[#4d8b68] to-[#365f48]',
        sweetalert: '#4d8b68',
    },
    midnight: {
        primary: '#5d728f',
        primaryHover: '#485d75',
        primaryLight: '#e8ecf2',
        secondary: '#3d4d62',
        accent: '#8a9bb5',
        gradient: 'from-[#5d728f] to-[#3d4d62]',
        sweetalert: '#5d728f',
    },
};

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
        const selectedTheme = themes[colorTheme] ? colorTheme : 'calm';
        const palette = themes[selectedTheme];

        root.classList.remove('theme-default', 'theme-calm', 'theme-forest', 'theme-midnight');
        root.classList.add(`theme-${selectedTheme}`);
        root.style.setProperty('--st-primary', palette.primary);
        root.style.setProperty('--st-primary-hover', palette.primaryHover);
        root.style.setProperty('--st-primary-light', palette.primaryLight);
        root.style.setProperty('--st-secondary', palette.secondary);
        root.style.setProperty('--st-accent', palette.accent);
        root.style.setProperty('--st-sweetalert', palette.sweetalert);

        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.setAttribute('name', 'theme-color');
            document.head.appendChild(themeColorMeta);
        }
        themeColorMeta.setAttribute('content', palette.primary);

        if (selectedTheme !== colorTheme) setColorTheme(selectedTheme);
        localStorage.setItem('colorTheme', selectedTheme);
    }, [colorTheme]);

    const activeTheme = themes[colorTheme] || themes.calm;

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
            activeTheme,
            themes,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
