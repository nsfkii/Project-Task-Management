// src/components/Topbar.jsx
import { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, ChevronDown, Menu, LogOut } from 'lucide-react';
import api from '../api/axios';
import NotificationBell from './NotificationBell';
import Swal from 'sweetalert2';

export default function Topbar({ onToggleSidebar }) {
    const { user, theme, setTheme, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const goToProfile = () => navigate('/profile');

    const handleLogout = async () => {
        // Konfirmasi logout dengan SweetAlert2
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
            
            // Animasi loading toast
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
                // Bersihkan localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lastNotifiedDate');
                
                // Panggil logout dari context
                logout();
                
                // Tutup loading
                Swal.close();
                
                // Notifikasi sukses
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
                
                // Redirect ke beranda
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

    // Jika user belum login, tampilkan topbar sederhana
    if (!user) {
        return (
            <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img
                        src="/ST_Logo.png"
                        alt="StudentTask Logo"
                        className="h-10 w-auto object-contain block dark:hidden"
                    />
                    <img
                        src="/ST_Logo_Dark.png"
                        alt="StudentTask Logo"
                        className="h-10 w-auto object-contain hidden dark:block"
                    />
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">StudentTask</h1>
                </Link>
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

    // Jika user sudah login
    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onToggleSidebar} 
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Menu size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>

                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img
                            src="/ST_Logo.png"
                            alt="StudentTask Logo"
                            className="h-9 w-auto object-contain block dark:hidden"
                        />
                        <img
                            src="/ST_Logo_Dark.png"
                            alt="StudentTask Logo"
                            className="h-9 w-auto object-contain hidden dark:block"
                        />
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline-block">
                            StudentTask
                        </span>
                    </Link>

                    <span className="text-slate-300 dark:text-slate-600 hidden sm:inline-block">|</span>

                    <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {getPageTitle()}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">
                        Beranda
                    </Link>
                    <Link to="/calendar" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">
                        Calendar
                    </Link>
                    <Link to="/profile" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">
                        Profil
                    </Link>
                    
                    <NotificationBell />

                    <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

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
                        
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
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
            </div>
        </header>
    );
}