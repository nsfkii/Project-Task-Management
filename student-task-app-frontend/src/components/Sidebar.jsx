// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Calendar, User, LogOut, Home, Building2, ChevronDown, ExternalLink, Settings } from 'lucide-react';
import api from '../api/axios';
import Swal from 'sweetalert2';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [isOrgOpen, setIsOrgOpen] = useState(false);
    const [orgLinks, setOrgLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        // Konfirmasi logout
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

    const navItems = [
        { name: 'Beranda', path: '/', icon: <Home size={20} /> },
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    ];

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col`}
            >
                <div className="pt-6 pb-4 flex flex-col items-center border-b border-slate-100 dark:border-slate-700">
                    <img
                        src="/ST_Logo.png"
                        alt="StudentTask Logo"
                        className="h-20 w-auto object-contain drop-shadow-sm mb-3 block dark:hidden"
                    />
                    <img
                        src="/ST_Logo_Dark.png"
                        alt="StudentTask Logo"
                        className="h-20 w-auto object-contain drop-shadow-sm mb-3 hidden dark:block"
                    />
                    
                    <Link
                        to="/"
                        onClick={onClose}
                        className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
                    >
                        StudentTask
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}

                    <div>
                        <button
                            onClick={() => setIsOrgOpen(!isOrgOpen)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200 transition-all duration-300 font-medium"
                        >
                            <div className="flex items-center gap-3">
                                <Building2 size={20} />
                                <span>Organization</span>
                            </div>
                            <ChevronDown 
                                size={16} 
                                className={`transition-transform duration-200 ${isOrgOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <div className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ${
                            isOrgOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                        }`}>
                            {loading ? (
                                <p className="text-xs text-slate-400 px-4 py-2">Memuat...</p>
                            ) : (
                                <>
                                    {orgLinks.map((link) => (
                                        <a
                                            key={link.id || link.name}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200 transition-all duration-300"
                                        >
                                            <ExternalLink size={16} />
                                            {link.name}
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
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-all duration-300 mt-1 border-t border-slate-100 dark:border-slate-700"
                                    >
                                        <Settings size={16} />
                                        Kelola Link
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300 font-medium ${
                            isLoggingOut ? 'opacity-50 cursor-not-allowed animate-pulse' : ''
                        }`}
                    >
                        {isLoggingOut ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logout...
                            </>
                        ) : (
                            <>
                                <LogOut size={20} /> Logout
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}