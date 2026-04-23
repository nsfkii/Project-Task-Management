import { Github, Mail, Instagram, Linkedin, MessageCircle } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Logo & Deskripsi */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">StudentTask</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-xs">
                            Platform manajemen tugas untuk Pelajar. Kelola deadline, pantau progress, 
                            dan tetap produktif dalam setiap semester.
                        </p>
                    </div>

                    {/* Menu Cepat */}
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2 text-sm">Tautan Cepat</h4>
                        <ul className="space-y-1 text-sm">
                            <li><a href="/login" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition">Login</a></li>
                            <li><a href="/register" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition">Daftar</a></li>
                        </ul>
                    </div>
        
                    {/* Menu Contact via WhatsApp */}
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2 text-sm">Hubungi Kami</h4>
                        <ul className="space-y-1 text-sm">
                            <li>
                                <a 
                                    href="https://wa.me/628998869283?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20StudentTask" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-500 hover:text-green-600 transition flex items-center gap-2"
                                >
                                    <MessageCircle size={16} /> 08998869283(WhatsApp)
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://wa.me/6283822579144?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20StudentTask" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-500 hover:text-green-600 transition flex items-center gap-2"
                                >
                                    <MessageCircle size={16} /> 083822579144 (WhatsApp)
                                </a>
                            </li>
                        </ul>
                    </div>
                    {/* Sosial Media */}
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2 text-sm">Ikuti Kami</h4>
                        <div className="flex gap-3">
                            <a href="https://github.com/nsfkii" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition">
                                <Github size={18} />
                            </a>
                            <a href="https://www.instagram.com/ariserdaduu" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-600 transition">
                                <Instagram size={18} />
                            </a>
                            <a href="https://linkedin.com/in/difki-junaedi-031389289" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition">
                                <Linkedin size={18} />
                            </a>
                            <a href="mailto:difkijunaedi03@gmail.com" className="text-slate-500 hover:text-red-600 transition">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                    <p>© {currentYear} StudentTask. Dibuat untuk pelajar di seluruh Indonesia.</p>
                </div>
            </div>
        </footer>
    );
}