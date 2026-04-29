import { Github, Mail, Instagram, Linkedin, MessageCircle, Heart, Zap, Rocket, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Scroll to top functionality
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <footer className="relative bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/30 border-t border-slate-200 dark:border-slate-700 mt-auto overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {/* Logo untuk Light Mode */}
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white dark:bg-transparent">
                                    <img 
                                        src="/ST_Logo.png" 
                                        alt="StudentTask Logo" 
                                        className="w-full h-full object-cover block dark:hidden"
                                    />
                                    {/* Logo untuk Dark Mode */}
                                    <img 
                                        src="/ST_Logo_Dark.png" 
                                        alt="StudentTask Logo" 
                                        className="w-full h-full object-cover hidden dark:block"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    StudentTask
                                </h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                Platform manajemen tugas untuk Pelajar. Kelola deadline, pantau progress, 
                                dan tetap produktif.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Since 2026 - STMIK Bandung</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Rocket size={16} className="text-indigo-500" />
                                Tautan Cepat
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/dashboard" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-300 text-sm flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all"></span>
                                        Dashboard
                                    </a>
                                </li>
                                <li>
                                    <a href="/calendar" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-300 text-sm flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all"></span>
                                        Kalender
                                    </a>
                                </li>
                                <li>
                                    <a href="/profile" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-300 text-sm flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all"></span>
                                        Profil
                                    </a>
                                </li>
                                <li>
                                    <a href="/login" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-300 text-sm flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all"></span>
                                        Login
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Section - WhatsApp */}
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                <MessageCircle size={16} className="text-green-500" />
                                Hubungi Kami
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a 
                                        href="https://wa.me/628998869283?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20Website%20StudentTask" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-all duration-300 text-sm flex items-center gap-3 group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">08998869283</p>
                                            <p className="text-xs opacity-75">Ariya - 3224012</p>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="https://wa.me/6283822579144?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20Website%20StudentTask"
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 transition-all duration-300 text-sm flex items-center gap-3 group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">083822579144</p>
                                            <p className="text-xs opacity-75">Difki - 3224005</p>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Social Media & Newsletter */}
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                Ikuti Kami
                            </h4>
                            <div className="flex gap-4 mb-6">
                                <a 
                                    href="https://github.com/nsfkii" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 transition-all duration-300 hover:scale-110 hover:rotate-6"
                                >
                                    <Github size={20} />
                                </a>
                                <a 
                                    href="https://www.instagram.com/ariserdaduu" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-rotate-6"
                                >
                                    <Instagram size={20} />
                                </a>
                                <a 
                                    href="https://linkedin.com/in/difki-junaedi-031389289" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-3"
                                >
                                    <Linkedin size={20} />
                                </a>
                                <a 
                                    href="mailto:difkijunaedi03@gmail.com" 
                                    className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-rotate-3"
                                >
                                    <Mail size={20} />
                                </a>
                            </div>

                            {/* Stats / Fun Fact */}
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                     Siap membantu pelajar untuk <br />
                                    mengelola tugas dengan lebih baik
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Divider with Gradient */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 text-xs text-slate-400">
                                Stay Productive
                            </span>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            © {currentYear} StudentTask. Dibuat untuk mengelola tugas dengan baik.
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Version 2.0 | Built with React & Laravel
                        </p>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                    showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                aria-label="Scroll to top"
            >
                <ChevronUp size={20} />
            </button>
        </>
    );
}