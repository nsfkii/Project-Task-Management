// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Calendar, User, LogOut, Home, Building2, ChevronDown, ExternalLink, Settings, X } from 'lucide-react';
import api from '../api/axios';
import Swal from 'sweetalert2';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [isOrgOpen, setIsOrgOpen] = useState(false);
    const [orgLinks, setOrgLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
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

    // Fetch organization links dari API
    const fetchOrgLinks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/organization-links');
            const links = response.data.data || response.data;
            if (links && links.length > 0) {
                setOrgLinks(links);
            } else {
                setOrgLinks([
                    { id: 'default-1', name: 'STMIK Bandung', url: 'https://stmik-bandung.ac.id/' },
                    { id: 'default-2', name: 'SIMAK', url: 'https://sso.stmik-bandung.ac.id/login?site=https://simak.stmik-bandung.ac.id' },
                ]);
            }
        } catch (error) {
            console.error("Gagal mengambil organization links:", error);
            setOrgLinks([
                { id: 'default-1', name: 'STMIK Bandung', url: 'https://stmik-bandung.ac.id/' },
                { id: 'default-2', name: 'SIMAK', url: 'https://sso.stmik-bandung.ac.id/login?site=https://simak.stmik-bandung.ac.id' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgLinks();
    }, []);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Anda akan keluar dari akun ini',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
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
                console.error("Gagal logout", error);
            } finally {
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

    // Menu Utama
    const mainMenuItems = [
        { name: 'Beranda', path: '/', icon: <Home size={20} /> },
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    ];

    // Menu Pengaturan
    const settingMenuItems = [
        { name: 'Profil Saya', path: '/profile', icon: <User size={20} /> },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Backdrop dengan efek blur yang lebih halus */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={onClose}
            />

            {/* Sidebar Panel - Responsif */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-800 shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isMobile ? 'w-4/5 max-w-xs' : 'w-64'}`}
            >
                {/* Header dengan Logo - Responsif */}
                <div className="pt-6 pb-4 px-4 flex flex-col items-center border-b border-slate-100 dark:border-slate-700 relative">
                    {/* Tombol Close untuk mobile */}
                    {isMobile && isOpen && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={20} className="text-slate-500 dark:text-slate-400" />
                        </button>
                    )}
                    
                    <img
                        src="/ST_Logo.png"
                        alt="StudentTask Logo"
                        className="h-16 md:h-20 w-auto object-contain drop-shadow-sm mb-3 block dark:hidden"
                    />
                    <img
                        src="/ST_Logo_Dark.png"
                        alt="StudentTask Logo"
                        className="h-16 md:h-20 w-auto object-contain drop-shadow-sm mb-3 hidden dark:block"
                    />
                    
                    <Link
                        to="/"
                        onClick={onClose}
                        className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
                    >
                        StudentTask
                    </Link>
                </div>

                {/* Navigasi Menu - Scrollable dengan Klasifikasi */}
                <nav className="flex-1 p-3 md:p-4 overflow-y-auto custom-scrollbar">
                    {/* Menu Utama Section */}
                    <div className="mb-4">
                        <h3 className="px-3 md:px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Menu Utama
                        </h3>
                        <div className="space-y-1">
                            {mainMenuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 font-medium text-sm md:text-base ${
                                        isActive(item.path)
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Organization Section - Bisa ditempatkan di Menu Utama atau terpisah */}
                    <div className="mb-4">
                        <h3 className="px-3 md:px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Lembaga
                        </h3>
                        <div>
                            <button
                                onClick={() => setIsOrgOpen(!isOrgOpen)}
                                className={`flex items-center justify-between w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 font-medium text-sm md:text-base ${
                                    isOrgOpen
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 size={20} className="shrink-0" />
                                    <span>Organization</span>
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform duration-200 shrink-0 ${isOrgOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <div className={`ml-6 md:ml-8 space-y-1 overflow-hidden transition-all duration-300 ${
                                isOrgOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                            }`}>
                                {loading ? (
                                    <p className="text-xs text-slate-400 px-3 md:px-4 py-2">Memuat...</p>
                                ) : (
                                    <>
                                        {orgLinks.map((link) => (
                                            <a
                                                key={link.id || link.name}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={onClose}
                                                className="flex items-center gap-3 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200 transition-all duration-300 truncate"
                                            >
                                                <ExternalLink size={14} className="shrink-0" />
                                                <span className="truncate">{link.name}</span>
                                            </a>
                                        ))}
                                        
                                        <Link
                                            to="/profile"
                                            onClick={() => {
                                                onClose();
                                                setTimeout(() => {
                                                    const orgSection = document.getElementById('organization-section');
                                                    if (orgSection) orgSection.scrollIntoView({ behavior: 'smooth' });
                                                }, 100);
                                            }}
                                            className="flex items-center gap-3 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-all duration-300 mt-1 border-t border-slate-100 dark:border-slate-700"
                                        >
                                            <Settings size={14} className="shrink-0" />
                                            <span className="truncate">Kelola Link</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pengaturan Section */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <h3 className="px-3 md:px-4 mb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Pengaturan
                        </h3>
                        <div className="space-y-1">
                            {settingMenuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-300 font-medium text-sm md:text-base ${
                                        isActive(item.path)
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Tombol Logout sebagai terpisah atau di dalam Pengaturan */}
                <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`flex items-center gap-3 w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300 font-medium text-sm md:text-base ${
                            isLoggingOut ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
                        }`}
                    >
                        {isLoggingOut ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-rose-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Logout...</span>
                            </>
                        ) : (
                            <>
                                <LogOut size={20} className="shrink-0" />
                                <span>Keluar</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
