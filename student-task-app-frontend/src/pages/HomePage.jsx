// src/pages/HomePage.jsx
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Calendar, Clock, ArrowRight, Plus, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer';
import AppGallery from '../components/AppGallery';
import { buildAvatarUrl, parseTasksPayload, toArray } from '../utils/apiResponse';

export default function HomePage() {
    const { user, theme, setTheme, activeTheme } = useContext(AuthContext);
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
                    const { tasks: unsafeTasks } = parseTasksPayload(res.data);
                    const tasks = toArray(unsafeTasks);
                    
                    setStats({
                        total: tasks.length,
                        done: tasks.filter(t => t.status === 'done').length,
                        progress: tasks.filter(t => t.status === 'progress').length,
                        pending: tasks.filter(t => t.status === 'pending').length,
                    });
                    
                    const sorted = [...tasks].sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
                    setRecentTasks(sorted.slice(0,5));
                } catch (error) {
                    console.error("Gagal mengambil data:", error);
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
                {/* Topbar */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex justify-between items-center">
                        {/* Logo + Nama */}
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
                            <span className="text-base sm:text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                StudentTask
                            </span>
                        </Link>

                        {/* Navigasi + Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            <Link to="/" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition hidden sm:inline-block">
                                Beranda
                            </Link>
                            <Link to="/dashboard" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition hidden sm:inline-block">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition hidden sm:inline-block">
                                Profil
                            </Link>
                            
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme} 
                                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all"
                            >
                                {theme === 'light' ? 
                                    <Moon size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" /> : 
                                    <Sun size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
                                }
                            </button>
                            
                            {/* Profile Dropdown */}
                            <div className="relative group">
                                <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full ring-2 ring-indigo-50 dark:ring-slate-700 overflow-hidden shrink-0">
                                        {user?.avatar ? (
                                            <img 
                                                src={buildAvatarUrl(user.avatar)} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <img 
                                                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${activeTheme.primary.replace('#', '')}&color=fff&size=96`} 
                                                alt="Profile" 
                                            />
                                        )}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline-block max-w-[80px] sm:max-w-[120px] truncate">
                                        {user?.name}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                                </div>
                                
                                {/* Dropdown */}
                                <div className="absolute right-0 top-full mt-1 w-44 sm:w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                                    <button 
                                        onClick={() => navigate('/profile')}
                                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-xl transition-colors"
                                    >
                                        <img 
                                            src={user?.avatar ? buildAvatarUrl(user.avatar) : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${activeTheme.primary.replace('#', '')}&color=fff&size=96`} 
                                            alt="Profile" 
                                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                                        />
                                        Profil Saya
                                    </button>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-0.5 sm:my-1"></div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl transition-colors"
                                    >
                                        <LogOut size={14} className="sm:w-4 sm:h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content - sama seperti sebelumnya... */}
                <main className="flex-1 max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 w-full">
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1">
                            Hai, {user.name}! 👋
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                            Berikut ringkasan tugas Anda
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5 mb-6 sm:mb-8 md:mb-10">
                        <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-0.5 transition-transform cursor-pointer">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg sm:rounded-xl">
                                    <CheckCircle size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400"/>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total Tugas</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-0.5 transition-transform cursor-pointer">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-500/20 rounded-lg sm:rounded-xl">
                                    <CheckCircle size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400"/>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Selesai</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.done}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-0.5 transition-transform cursor-pointer">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg sm:rounded-xl">
                                    <Clock size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400"/>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Progress</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.progress}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-0.5 transition-transform cursor-pointer">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-500/20 rounded-lg sm:rounded-xl">
                                    <Calendar size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400"/>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Pending</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Tasks */}
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 dark:text-white mb-3 sm:mb-4">
                        📋 Berikut tugas-tugas Anda
                    </h2>
                    
                    {loading ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">Memuat...</p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {recentTasks.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <Clock className="mx-auto text-slate-300 dark:text-slate-600" size={36} />
                                    <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">Belum ada tugas.</p>
                                </div>
                            ) : (
                                recentTasks.map(task => (
                                    <div key={task.id} className="p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white truncate">
                                                    {task.title}
                                                </p>
                                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {task.subject?.name || '-'} • Deadline: {task.deadline}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full w-fit shrink-0 ${
                                                task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                task.status === 'progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="mt-6 sm:mt-8 text-center pb-6 sm:pb-8">
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
                        >
                            Buka Dashboard Lengkap <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
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
            {/* Navbar */}
            <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/ST_Logo.png" alt="Logo" className="h-8 sm:h-9 w-auto object-contain block dark:hidden" />
                        <img src="/ST_Logo_Dark.png" alt="Logo" className="h-8 sm:h-9 w-auto object-contain hidden dark:block" />
                        <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">StudentTask</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/login" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Login</Link>
                        <Link to="/register" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition text-sm sm:text-base">Daftar</Link>
                        <button onClick={toggleTheme} className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all">
                            {theme === 'light' ? <Moon size={16} className="sm:w-5 sm:h-5" /> : <Sun size={16} className="sm:w-5 sm:h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 leading-tight">
                        Kelola Tugas Kuliah Anda<br />
                        <span className="text-indigo-600">Menjadi Lebih Mudah & Terstruktur</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                        StudentTask membantu mahasiswa/pelajar mencatat deadline, memantau progress, dan tetap produktif sepanjang semester.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                        <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base">
                            <Plus size={18} /> Mulai Sekarang
                        </Link>
                        <a href="#fitur" className="w-full sm:w-auto px-6 py-3 border border-indigo-300 dark:border-indigo-600 rounded-xl text-indigo-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm sm:text-base text-center">
                            Lihat Fitur
                        </a>
                    </div>
                </div>
            </section>

            {/* Fitur */}
            <section id="fitur" className="py-12 sm:py-16 bg-white dark:bg-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 dark:text-white mb-8 sm:mb-12">Fitur Unggulan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center hover:-translate-y-1 transition-transform">
                            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800 dark:text-white">Manajemen Tugas</h3>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Catat semua tugas, deadline, dan prioritas.</p>
                        </div>
                        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center hover:-translate-y-1 transition-transform">
                            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800 dark:text-white">Kalender Deadline</h3>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Lihat jadwal tugas dalam tampilan kalender.</p>
                        </div>
                        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center hover:-translate-y-1 transition-transform">
                            <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800 dark:text-white">Pengingat</h3>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Dapatkan notifikasi tugas mendekati deadline.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 sm:py-16 bg-indigo-50 dark:bg-indigo-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4">Siap Meningkatkan Produktivitas?</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto">
                        Bergabunglah dengan ribuan mahasiswa & pelajar yang sudah menggunakan StudentTask.
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg text-sm sm:text-base">
                        <ArrowRight size={18} /> Daftar Sekarang
                    </Link>
                </div>
            </section>
            
            <AppGallery />
            <Footer />
        </div>
    );
}
