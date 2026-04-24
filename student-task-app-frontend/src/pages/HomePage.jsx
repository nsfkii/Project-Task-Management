// src/pages/HomePage.jsx
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Calendar, Clock, ArrowRight, Plus, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer';
import AppGallery from '../components/AppGallery';


export default function HomePage() {
    const { user, theme, setTheme } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, done: 0, progress: 0, pending: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastNotifiedDate');
        navigate('/login');
    };

    useEffect(() => {
        if (user) {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const res = await api.get('/tasks?all=true');
                    const tasks = res.data;
                    setStats({
                        total: tasks.length,
                        done: tasks.filter(t => t.status === 'done').length,
                        progress: tasks.filter(t => t.status === 'progress').length,
                        pending: tasks.filter(t => t.status === 'pending').length,
                    });
                    const sorted = [...tasks].sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
                    setRecentTasks(sorted.slice(0,3));
                } catch (error) {
                    console.error("Gagal mengambil data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    }, [user]);

    // ========== TAMPILAN UNTUK USER YANG SUDAH LOGIN ==========
    if (user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col">
                {/* Topbar dengan Logo */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                        {/* Bagian Kiri: Logo + Nama Website */}
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            {/* Logo untuk Light Mode */}
                            <img
                                src="/ST_Logo.png"
                                alt="StudentTask Logo"
                                className="h-9 w-auto object-contain block dark:hidden"
                            />
                            {/* Logo untuk Dark Mode */}
                            <img
                                src="/ST_Logo_Dark.png"
                                alt="StudentTask Logo"
                                className="h-9 w-auto object-contain hidden dark:block"
                            />
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                StudentTask
                            </span>
                        </Link>

                        {/* Bagian Kanan: Menu Navigasi */}
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Beranda</Link>
                            <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Dashboard</Link>
                            <Link to="/profile" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Profil</Link>
                            
                            {/* Button Theme */}
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
                                    <button 
                                        onClick={() => navigate('/profile')}
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

                {/* Main Content */}
                <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Hai, {user.name}! 👋</h1>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">Berikut ringkasan tugas Anda</p>

                    {/* Statistik Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl"><CheckCircle size={24} className="text-blue-600 dark:text-blue-400"/></div>
                                <div><p className="text-sm text-slate-500 dark:text-slate-400">Total Tugas</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p></div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl"><CheckCircle size={24} className="text-green-600 dark:text-green-400"/></div>
                                <div><p className="text-sm text-slate-500 dark:text-slate-400">Selesai</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.done}</p></div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl"><Clock size={24} className="text-amber-600 dark:text-amber-400"/></div>
                                <div><p className="text-sm text-slate-500 dark:text-slate-400">Progress</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.progress}</p></div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl"><Calendar size={24} className="text-red-600 dark:text-red-400"/></div>
                                <div><p className="text-sm text-slate-500 dark:text-slate-400">Pending</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Tugas terbaru */}
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">📋 Berikut tugas-tugas yang mendekati deadline</h2>
                    {loading ? <p className="text-slate-500 dark:text-slate-400">Memuat...</p> : (
                        <div className="space-y-3">
                            {recentTasks.length === 0 ? <p className="text-slate-500 dark:text-slate-400">Belum ada tugas.</p> : recentTasks.map(task => (
                                <div key={task.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">{task.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{task.subject?.name || '-'} • Deadline: {task.deadline}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                            task.status === 'progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-8 text-center">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition">
                            Buka Dashboard Lengkap <ArrowRight size={18} />
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ========== TAMPILAN UNTUK USER YANG BELUM LOGIN ==========
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col">
            <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                    {/* Logo + Nama Website bisa diklik ke Beranda */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        {/* Logo untuk Light Mode */}
                        <img
                            src="/ST_Logo.png"
                            alt="StudentTask Logo"
                            className="h-9 w-auto object-contain block dark:hidden"
                        />
                        {/* Logo untuk Dark Mode */}
                        <img
                            src="/ST_Logo_Dark.png"
                            alt="StudentTask Logo"
                            className="h-9 w-auto object-contain hidden dark:block"
                        />
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            StudentTask
                        </span>
                    </Link>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Login</Link>
                        <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">Daftar</Link>
                        {/* Theme Toggle untuk user belum login */}
                        <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </nav>
            {/* Hero, fitur, CTA */}
            <section className="flex-1">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6">Kelola Tugas Kuliah  Anda<br /><span className="text-indigo-600">Menjadi Lebih Mudah & Terstruktur</span></h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">StudentTask membantu mahasiswa/pelajar mencatat deadline, memantau progress, dan tetap produktif sepanjang semester.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg"><Plus size={18} /> Mulai Sekarang</Link>
                        <a href="#fitur" className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Lihat Fitur</a>
                    </div>
                </div>
            </section>
            <section id="fitur" className="py-16 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12">Fitur Unggulan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center"><CheckCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">Manajemen Tugas</h3><p className="text-slate-600 dark:text-slate-300">Catat semua tugas, deadline, dan prioritas.</p></div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center"><Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">Kalender Deadline</h3><p className="text-slate-600 dark:text-slate-300">Lihat jadwal tugas dalam tampilan kalender.</p></div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center"><Clock className="h-12 w-12 text-indigo-600 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">Pengingat</h3><p className="text-slate-600 dark:text-slate-300">Dapatkan notifikasi tugas mendekati deadline.</p></div>
                    </div>
                </div>
            </section>
            <section className="py-16 bg-indigo-50 dark:bg-indigo-900/20">
                <div className="max-w-7xl mx-auto px-6 text-center"><h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Siap Meningkatkan Produktivitas?</h2><p className="text-slate-600 dark:text-slate-300 mb-8">Bergabunglah dengan ribuan mahasiswa & pelajar yang sudah menggunakan StudentTask.</p><Link to="/register" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg"><ArrowRight size={18} /> Daftar Sekarang</Link></div>
            </section>
            
            <AppGallery />

            <Footer />
        </div>
    );
}