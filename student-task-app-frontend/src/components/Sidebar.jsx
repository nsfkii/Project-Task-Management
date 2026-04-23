// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Calendar, User, LogOut, X, Home, Building2, ChevronDown, ExternalLink } from 'lucide-react';
import api from '../api/axios';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [isOrgOpen, setIsOrgOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Gagal logout", error);
        } finally {
            logout();
            window.location.replace('/')
        }
    };

    const navItems = [
        { name: 'Beranda', path: '/', icon: <Home size={20} /> },
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    ];

    const orgLinks = [
        { name: 'STMIK Bandung', url: 'https://stmik-bandung.ac.id/' },
        { name: 'SIMAK', url: 'https://sso.stmik-bandung.ac.id/login?site=https://simak.stmik-bandung.ac.id' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col`}
            >
                {/* Header dengan Logo Kampus + Judul StudentTask (bisa diklik) */}
                <div className="pt-6 pb-4 flex flex-col items-center border-b border-slate-100 dark:border-slate-700">
            {/* Logo untuk Light Mode */}
            <img
                src="/ST_Logo.png"
                alt="StudentTask Logo"
                className="h-20 w-auto object-contain drop-shadow-sm mb-3 block dark:hidden"
            />

            {/* Logo untuk Dark Mode */}
            <img
                src="/ST_Logo_Dark.png"
                alt="StudentTask Logo"
                className="h-20 w-auto object-contain drop-shadow-sm mb-3 hidden dark:block"
            />
                    {/* Jika ingin ukuran lebih besar/kecil, ubah h-20 menjadi h-16, h-24, dll */}
                    
                    <Link
                        to="/"
                        onClick={onClose}
                        className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
                    >
                        StudentTask
                    </Link>
                </div>

                {/* Navigasi Menu */}
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

                    {/* Organization Dropdown */}
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

                        {/* Dropdown Items */}
                        <div className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ${
                            isOrgOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
                        }`}>
                            {orgLinks.map((link) => (
                                <a
                                    key={link.name}
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
                        </div>
                    </div>
                </nav>

                {/* Tombol Logout */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>
        </>
    );
}