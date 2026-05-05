// src/components/Topbar.jsx
import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, ChevronDown, Menu, LogOut, X } from 'lucide-react';
import api from '../api/axios';
import NotificationBell from './NotificationBell';
import Swal from 'sweetalert2';

export default function Topbar({ onToggleSidebar }) {
    const { user, theme, setTheme, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Deteksi layar mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Tutup mobile menu saat resize ke desktop
    useEffect(() => {
        if (!isMobile && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    },[isMobile, isMobileMenuOpen]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const goToProfile = () => {
        navigate('/profile');
        setIsMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan keluar dari akun ini',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-2xl shadow-xl dark:bg-slate-800',
                title: 'text-slate-800 dark:text-white',
                confirmButton: 'px-4 py-2 rounded-lg font-semibold',
                cancelButton: 'px-4 py-2 rounded-lg font-semibold'
            }
        });

        if (result.isConfirmed) {
            setIsLoggingOut(true);
            
            Swal.fire({
                title: 'Logout...',
                text: 'Sedang memproses logout',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                background: '#ffffff',
                customClass: {
                    popup: 'rounded-2xl dark:bg-slate-800'
                }
            });

            try {
                await api.post('/logout');
            } catch (error) {
                console.error("Gagal logout backend:", error);
            } finally {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lastNotifiedDate');
                logout();
                Swal.close();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Logout!',
                    text: 'Sampai jumpa kembali 👋',
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                
                setTimeout(() => {
                    window.location.replace('/');
                }, 500);
            }
        }
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/calendar') return 'Kalender';
        if (path === '/profile') return 'Profil';
        return 'StudentTask';
    };

    // Jika user belum login, tampilkan topbar sederhana (responsif)
    if (!user) {
        return (
            <header className="sticky top-0 z-30 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                    <img
                        src="/ST_Logo.png"
                        alt="StudentTask Logo"
                        className="h-8 sm:h-10 w-auto object-contain block dark:hidden"
                    />
                    <img
                        src="/ST_Logo_Dark.png"
                        alt="StudentTask Logo"
                        className="h-8 sm:h-10 w-auto object-contain hidden dark:block"
                    />
                    <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">StudentTask</h1>
                </Link>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link to="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 text-blue-600 hover:bg-indigo-50 dark:text-blue-400 rounded-lg transition text-sm sm:text-base">Login</Link>
                    <Link to="/register" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm sm:text-base">Daftar</Link>
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                        {theme === 'light' ? <Moon size={18} className="sm:w-5 sm:h-5" /> : <Sun size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                </div>
            </header>
        );
    }

    // Jika user sudah login - Topbar Responsif
    return (
        <>
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                <div className="px-3 sm:px-4 md:px-6 py-2 md:py-3 flex justify-between items-center">
                    {/* Bagian Kiri */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Tombol Toggle Sidebar */}
                        <button 
                            onClick={onToggleSidebar} 
                            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Menu size={20} className="sm:w-6 sm:h-6 text-slate-700 dark:text-slate-200" />
                        </button>

                        {/* Logo dan Nama Website */}
                        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
                            <img
                                src="/ST_Logo.png"
                                alt="StudentTask Logo"
                                className="h-7 sm:h-8 md:h-9 w-auto object-contain block dark:hidden"
                            />
                            <img
                                src="/ST_Logo_Dark.png"
                                alt="StudentTask Logo"
                                className="h-7 sm:h-8 md:h-9 w-auto object-contain hidden dark:block"
                            />
                            <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 hidden sm:inline-block">
                                StudentTask
                            </span>
                        </Link>

                        {/* Separator - hidden di mobile */}
                        <span className="text-slate-300 dark:text-slate-600 hidden md:inline-block">|</span>

                        {/* Page Title - hidden di mobile sangat kecil */}
                        <h1 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white hidden sm:block">
                            {getPageTitle()}
                        </h1>
                    </div>

                    {/* Bagian Kanan - Desktop */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-4">
                        <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
                            Beranda
                        </Link>
                        <Link to="/calendar" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
                            Calendar
                        </Link>
                        <Link to="/profile" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
                            Profil
                        </Link>
                        
                        <NotificationBell />

                        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <div className="relative group">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-indigo-50 dark:ring-slate-700 overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=96`} alt="Profile" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden lg:inline-block max-w-[100px] truncate">
                                    {user?.name}
                                </span>
                                <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                            </div>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                <button 
                                    onClick={goToProfile}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-xl transition-colors"
                                >
                                    <img 
                                        src={user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=96`} 
                                        alt="Profile" 
                                        className="w-5 h-5 rounded-full"
                                    />
                                    Profil Saya
                                </button>
                                <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                <button 
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl transition-all duration-300 ${
                                        isLoggingOut ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
                                    }`}
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logout...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={16} />
                                            Logout
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Kanan - Mobile (hamburger menu) */}
                    <div className="flex md:hidden items-center gap-2">
                        <NotificationBell />
                        
                        <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-700 ${
                    isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="p-4 space-y-2">
                        {/* Profile Info di mobile */}
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                            <div className="h-10 w-10 rounded-full ring-2 ring-indigo-50 dark:ring-slate-700 overflow-hidden">
                                {user?.avatar ? (
                                    <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=96`} alt="Profile" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>
                        </div>
                        
                        <Link 
                            to="/" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Beranda
                        </Link>
                        <Link 
                            to="/calendar" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Calendar
                        </Link>
                        <Link 
                            to="/profile" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Profil
                        </Link>
                        
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                            <button 
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logout...
                                    </>
                                ) : (
                                    <>
                                        <LogOut size={16} />
                                        Logout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}