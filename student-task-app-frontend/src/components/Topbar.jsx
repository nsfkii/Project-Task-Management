// src/components/Topbar.jsx
import { useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, ChevronDown, Menu, LogOut } from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
    const { user, theme, setTheme } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const goToProfile = () => navigate('/profile');

    const handleLogout = () => {
        // Hapus data user dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastNotifiedDate');
        
        // Redirect ke halaman login
        navigate('/login');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/calendar') return 'Kalender';
        if (path === '/profile') return 'Profil';
        return 'StudentTask';
    };

    // Jika user belum login, tampilkan tombol login/register
    if (!user) {
        return (
            <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">StudentTask</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 rounded-lg transition">Login</Link>
                    <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Daftar</Link>
                    <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </header>
        );
    }

    // Jika user sudah login, tampilkan topbar lengkap dengan menu sejajar
    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onToggleSidebar} 
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Menu size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">{getPageTitle()}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Link Beranda */}
                    <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Beranda</Link>
                    
                    {/* Link Calendar (menggantikan Dashboard) */}
                    <Link to="/calendar" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Calendar</Link>

                    {/* Link Profil */}
                    <Link to="/profile" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Profil</Link>
                    
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Profile & Logout Dropdown */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="h-10 w-10 rounded-full ring-2 ring-indigo-50 dark:ring-slate-700 overflow-hidden">
                                {user?.avatar ? (
                                    <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} alt="Profile" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline-block">
                                {user?.name}
                            </span>
                            <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                        </div>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                            {/* Profil */}
                            <button 
                                onClick={goToProfile}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-xl transition-colors"
                            >
                                <img 
                                    src={user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} 
                                    alt="Profile" 
                                    className="w-5 h-5 rounded-full"
                                />
                                Profil Saya
                            </button>

                            {/* Garis pemisah */}
                            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

                            {/* Logout */}
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl transition-colors"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}