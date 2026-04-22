// src/components/Topbar.jsx
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, ChevronDown, Menu } from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
    const { user, theme, setTheme } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    // Fungsi untuk mendapatkan judul halaman berdasarkan path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/calendar') return 'Kalender';
        if (path === '/profile') return 'Profil';
        return 'Dashboard';
    };

    return (
        <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Menu"
                >
                    <Menu size={24} className="text-slate-700 dark:text-slate-200" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Dropdown University */}
                <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white py-2">
                        University <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                        <a href="https://stmik-bandung.ac.id/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-xl">
                            STMIK Bandung
                        </a>
                        <a href="https://sso.stmik-bandung.ac.id/login?site=https://simak.stmik-bandung.ac.id" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-b-xl">
                            SIMAK
                        </a>
                    </div>
                </div>

                {/* Dropdown Contact */}
                <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white py-2">
                        Contact <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                        <a href="https://www.instagram.com/ariserdaduu/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-xl">
                            Ariya 3224012
                        </a>
                        <a href="https://www.instagram.com/nffkii/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-b-xl">
                            Difki 3224005
                        </a>
                    </div>
                </div>

                {/* Tombol Dark Mode */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* Profile Avatar + Nama (klikable) */}
                <div 
                    onClick={goToProfile}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className="h-10 w-10 rounded-full ring-2 ring-indigo-50 dark:ring-slate-700 overflow-hidden">
                        {user?.avatar ? (
                            <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} alt="Profile" />
                        )}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline-block">
                        {user?.name || 'User'}
                    </span>
                </div>
            </div>
        </header>
    );
}