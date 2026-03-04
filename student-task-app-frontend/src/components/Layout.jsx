import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Calendar, LogOut, Sun, Moon, CheckSquare, User, ChevronDown } from 'lucide-react';
import api from '../api/axios';

export default function Layout({ children }) {
    const { user, logout, theme, setTheme } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await api.post('/logout'); // Beritahu backend untuk hapus token
        } catch (error) {
            console.error("Gagal logout di backend", error);
        } finally {
            logout(); // Hapus state di React
            navigate('/login');
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');

    };

    const menuItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' },
        { path: '/profile', icon: <User size={20} />, label: 'Profile' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
            <div className="p-6 border-b dark:border-gray-700">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <CheckSquare size={24} /> Student Task
                </h1>
            </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {/* LOGO KAMPUS */}
                    <div className="mt-6 pb-6 flex flex-col items-center border-b border-gray-200 dark:border-gray-700/60">
                        <img
                            src="https://sso.stmik-bandung.ac.id/images/stmikbdg_logo.png"
                            alt="Logo Kampus"
                            className="h-20 w-auto object-contain drop-shadow-sm"
                        />
                    </div>

                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                location.pathname.includes(item.path)
                                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                
                <div className="p-4 border-t dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full px-4 py-3 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-8 z-10 relative">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
                        {location.pathname.replace('/', '') || 'Dashboard'}
                    </h2>
                    
                <div className="flex items-center gap-6">
                
                {/* --- MENU --- */}
                <div className="flex items-center gap-4 mr-2">
                    
                    {/* Menu About */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 transition-colors">
                            University <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                        </button>
                        {/* Dropdown Content */}
                        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                            <a 
                                href="https://stmik-bandung.ac.id/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                STMIK Bandung
                            </a>

                             <a 
                                href="https://sso.stmik-bandung.ac.id/login?site=https://simak.stmik-bandung.ac.id" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                SIMAK
                            </a>
                        </div>
                    </div>

                    {/* Menu Contact */}
                    <div className="relative group">
                        <button className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 transition-colors">
                            Contact <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                        </button>
                        {/* Dropdown Content */}
                        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                            <a 
                                href="https://www.instagram.com/ariserdaduu/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700"
                            >
                                Ariya 3224012 
                            </a>

                            <a 
                                href="https://www.instagram.com/nffkii/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Difki 3224005
                            </a>
                        </div>
                    </div>

                </div>
                {/* -------------------------- */}

                {/* Tombol Dark Mode */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                
                {/* User Profile Info */}
                <div className="flex items-center gap-3 border-l pl-6 dark:border-gray-700">
                           <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm overflow-hidden bg-blue-600 border border-gray-200 dark:border-gray-700">
                                {user?.avatar ? (
                                    <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Mahasiswa</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Halaman Konten yang Dinamis (Dashboard / Calendar) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8">
                    {children}
                </main>
            </div>
            
        </div>
    );
}