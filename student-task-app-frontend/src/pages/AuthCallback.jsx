import { useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthCallback = () => {
    const { login } = useContext(AuthContext);
    const hasProcessed = useRef(false); // Mencegah eksekusi ganda

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userParam = params.get('user');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                login(user, token);
                // Redirect ke dashboard
                window.location.replace('/dashboard');
            } catch (error) {
                console.error("Failed to parse user:", error);
                window.location.replace('/login?error=invalid_data');
            }
        } else {
            window.location.replace('/login?error=no_token');
        }
    }, [login]); // login mungkin stabil, tapi kita sudah pakai ref

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;