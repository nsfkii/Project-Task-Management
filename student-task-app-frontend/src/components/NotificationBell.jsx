// src/components/NotificationBell.jsx
import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Clock, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import Swal from 'sweetalert2';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [nearDeadlineTasks, setNearDeadlineTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fungsi untuk mengambil tugas mendekati deadline (belum lewat)
    const fetchNearDeadlineTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks?all=true');
            const tasks = response.data;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const near = tasks.filter(task => {
                if (task.status === 'done') return false;
                const taskDate = new Date(task.deadline);
                taskDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays >= 0;
            }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            
            setNearDeadlineTasks(near);
            setUnreadCount(near.length);
        } catch (error) {
            console.error("Gagal mengambil notifikasi:", error);
        } finally {
            setLoading(false);
        }
    };

    // Ambil data saat komponen mount
    useEffect(() => {
        fetchNearDeadlineTasks();
        const interval = setInterval(fetchNearDeadlineTasks, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Fungsi untuk membersihkan URL yang bermasalah
    const cleanSourceUrl = (url) => {
        if (!url) return null;
        if (url === 'nullable|string') return null;
        return url;
    };

    // Fungsi untuk menampilkan detail tugas dengan SweetAlert2
    const showTaskDetail = (task) => {
        const cleanUrl = cleanSourceUrl(task.source_url);
        
        Swal.fire({
            title: task.title,
            html: `
                <div class="text-left space-y-3">
                    <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">📚 Mata Kuliah</p>
                        <p class="text-slate-800 dark:text-slate-200">${task.subject?.name || task.subject || 'Mata Kuliah'}</p>
                    </div>
                    
                    <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">📅 Deadline</p>
                        <p class="text-slate-800 dark:text-slate-200">${task.deadline}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">⚡ Prioritas</p>
                            <span class="inline-block px-2 py-1 rounded-full text-xs font-bold ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }">
                                ${task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MEDIUM' : 'LOW'}
                            </span>
                        </div>
                        
                        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">📌 Status</p>
                            <span class="inline-block px-2 py-1 rounded-full text-xs font-bold ${
                                task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                task.status === 'progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }">
                                ${task.status === 'done' ? 'SELESAI' : task.status === 'progress' ? 'PROGRESS' : 'PENDING'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">📝 Deskripsi</p>
                        <p class="text-slate-800 dark:text-slate-200">${task.description || 'Tidak ada deskripsi'}</p>
                    </div>
                    
                    ${cleanUrl ? `
                    <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                            <ExternalLink size={14} /> Sumber Tugas
                        </p>
                        <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" 
                           class="text-indigo-600 dark:text-indigo-400 hover:underline break-all text-sm flex items-center gap-1">
                            ${cleanUrl.length > 50 ? cleanUrl.substring(0, 50) + '...' : cleanUrl}
                            <ExternalLink size={12} class="inline" />
                        </a>
                    </div>
                    ` : ''}
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Tutup',
            showCancelButton: true,
            cancelButtonText: 'Lihat di Dashboard',
            cancelButtonColor: '#64748b',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-2xl shadow-xl dark:bg-slate-800',
                title: 'text-lg font-bold text-slate-800 dark:text-white',
                confirmButton: 'px-4 py-2 rounded-lg font-semibold',
                cancelButton: 'px-4 py-2 rounded-lg font-semibold'
            }
        }).then((result) => {
            if (!result.isConfirmed && result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = '/dashboard';
            }
        });
    };

    // Hitung sisa hari
    const getDaysLeft = (deadline) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(deadline);
        taskDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { text: 'Hari ini!', className: 'text-red-600 font-bold' };
        if (diffDays === 1) return { text: 'Besok', className: 'text-orange-500 font-semibold' };
        if (diffDays === 2) return { text: `${diffDays} hari lagi`, className: 'text-yellow-600' };
        return { text: `${diffDays} hari lagi`, className: 'text-slate-500' };
    };

    // Dapatkan warna badge berdasarkan prioritas
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        }
    };

    // Tutup modal saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen && !e.target.closest('.notification-dropdown')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative notification-dropdown">
            {/* Tombol Notifikasi */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Notifikasi */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-indigo-600" />
                            <h3 className="font-semibold text-slate-800 dark:text-white">Notifikasi Deadline</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X size={16} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Body - Daftar Notifikasi */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="text-sm text-slate-500 mt-2">Memuat...</p>
                            </div>
                        ) : nearDeadlineTasks.length === 0 ? (
                            <div className="p-8 text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                                <p className="text-slate-600 dark:text-slate-300 font-medium">Semua aman!</p>
                                <p className="text-sm text-slate-500 mt-1">Tidak ada tugas mendekati deadline</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {nearDeadlineTasks.map(task => {
                                    const daysLeft = getDaysLeft(task.deadline);
                                    return (
                                        <div 
                                            key={task.id} 
                                            onClick={() => {
                                                setIsOpen(false);
                                                showTaskDetail(task);
                                            }}
                                            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <AlertCircle size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        {task.subject?.name || task.subject || 'Mata Kuliah'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        <span className={`text-xs font-medium ${daysLeft.className}`}>
                                                            <Clock size={12} className="inline mr-1" />
                                                            {daysLeft.text}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                                                            {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            Deadline: {task.deadline}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {nearDeadlineTasks.length > 0 && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center">
                            <p className="text-xs text-slate-500">
                                Klik notifikasi untuk melihat detail tugas
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}