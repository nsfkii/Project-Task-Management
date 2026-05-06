import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    Search, Plus, Trash2, Edit, Clock, CheckCircle, CircleDashed, 
    AlertCircle, X, ExternalLink, Bell, Calendar, BookOpen
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { parseTasksPayload, toArray } from '../utils/apiResponse';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, done: 0, progress: 0, pending: 0 });
    const [page, setPage] = useState(1);
    const [paginationData, setPaginationData] = useState({});
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    // State untuk mata kuliah
    const [subjects, setSubjects] = useState([]);

    // State untuk near deadline tasks
    const [nearDeadlineTasks, setNearDeadlineTasks] = useState([]);
    
    // State untuk animasi tombol Done
    const [doneAnimating, setDoneAnimating] = useState(null);

    // Modal state untuk task
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '', subject_id: '', source_url: '', description: '', 
        deadline: '', priority: 'medium', status: 'pending'
    });

    // Modal state untuk tambah mata kuliah
    const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('');
    const [isAddingSubject, setIsAddingSubject] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Ambil nama user dari AuthContext
    const { user } = useContext(AuthContext); 

    // Ambil daftar mata kuliah
    const fetchSubjects = useCallback(async () => {
        try {
            const response = await api.get('/subjects');
            setSubjects(response.data.data || response.data);
        } catch (error) {
            console.error("Gagal mengambil data mata kuliah", error);
        }
    }, []);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/tasks?page=${page}&`;
            if (debouncedSearch) url += `search=${debouncedSearch}&`;
            if (filterStatus) url += `status=${filterStatus}&`;
            if (filterPriority) url += `priority=${filterPriority}&`;

            const response = await api.get(url);
            const { tasks, stats } = parseTasksPayload(response.data);
            const list = toArray(tasks);
            const cleanTasks = list.map(task => ({
                ...task,
                source_url: (task.source_url && task.source_url !== 'nullable|string') ? task.source_url : null
            }));
            setStats(stats);
            setTasks(cleanTasks);
            const paginationSource = response.data?.data?.tasks ?? response.data?.tasks ?? {};
            setPaginationData({ ...paginationSource, data: cleanTasks });
        } catch (error) {
            console.error("Gagal mengambil data tugas", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filterStatus, filterPriority, page]);

    useEffect(() => {
        fetchSubjects();
        fetchTasks();
    }, [fetchSubjects, fetchTasks]);

    // Filter tugas mendekati deadline (≤ 3 hari)
    useEffect(() => {
        if (tasks.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const near = tasks.filter(task => {
                if (task.status === 'done') return false;
                const taskDate = new Date(task.deadline);
                taskDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays >= 0;
            });
            setNearDeadlineTasks(near);
        } else {
            setNearDeadlineTasks([]);
        }
    }, [tasks]);

    // Notifikasi dengan SweetAlert2 Toast (muncul sekali sehari)
    useEffect(() => {
        if (nearDeadlineTasks.length > 0) {
            const lastNotified = localStorage.getItem('lastNotifiedDate');
            const today = new Date().toDateString();
            
            if (lastNotified !== today) {
                const taskList = nearDeadlineTasks.map(t => `• ${t.title} (${t.deadline})`).join('<br>');
                Swal.fire({
                    title: '⚠️ Perhatian!',
                    html: `Anda memiliki <strong>${nearDeadlineTasks.length} tugas</strong> yang mendekati deadline:<br><br>${taskList}`,
                    icon: 'warning',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: true,
                    confirmButtonText: 'Lihat',
                    timer: 8000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/dashboard';
                    }
                });
                localStorage.setItem('lastNotifiedDate', today);
            }
        }
    }, [nearDeadlineTasks]);

    // Refresh data secara berkala (realtime)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchTasks();
            fetchSubjects();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchTasks, fetchSubjects]);

    const progressPercentage = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

    const getPriorityColor = (priority) => {
        if (priority === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        if (priority === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    };

    // Fungsi untuk mendapatkan style berdasarkan deadline
    const getDeadlineStyle = (deadline, status) => {
        if (status === 'done') return '';
        const today = new Date();
        const taskDate = new Date(deadline);
        const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20';
        if (diffDays === 1) return 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20';
        return '';
    };

    const getDaysRemaining = (deadline) => {
        const today = new Date();
        const taskDate = new Date(deadline);
        const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Fungsi handle status dengan animasi
    const handleStatusChangeWithAnimation = async (id, newStatus) => {
        if (newStatus === 'done') {
            setDoneAnimating(id);
            setTimeout(async () => {
                try {
                    await api.put(`/tasks/${id}`, { status: newStatus });
                    await fetchTasks();
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Tugas telah diselesaikan 🎉',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                } catch (error) {
                    console.error("Gagal mengubah status", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                    });
                } finally {
                    setDoneAnimating(null);
                }
            }, 300);
        } else {
            try {
                await api.put(`/tasks/${id}`, { status: newStatus });
                await fetchTasks();
            } catch (error) {
                console.error("Gagal mengubah status", error);
            }
        }
    };

    // Modal handlers untuk task
    const openModal = (task = null) => {
        if (task) {
            let safeSourceUrl = (task.source_url && task.source_url !== 'nullable|string') ? task.source_url : '';
            setCurrentTask(task);
            setFormData({
                title: task.title,
                subject_id: task.subject_id || '',
                source_url: safeSourceUrl,
                description: task.description || '',
                deadline: task.deadline,
                priority: task.priority,
                status: task.status,
            });
        } else {
            setCurrentTask(null);
            setFormData({
                title: '', subject_id: '', source_url: '', description: '',
                deadline: '', priority: 'medium', status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTask(null);
    };

    // Fungsi Submit dengan SweetAlert2
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        Swal.fire({
            title: 'Menyimpan...',
            text: 'Sedang memproses data',
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
            const payload = {
                title: formData.title,
                subject_id: formData.subject_id,
                source_url: formData.source_url,
                description: formData.description,
                deadline: formData.deadline,
                priority: formData.priority,
                status: formData.status,
            };
            if (currentTask) {
                await api.put(`/tasks/${currentTask.id}`, payload);
            } else {
                await api.post('/tasks', payload);
            }
            closeModal();
            await fetchTasks();
            
            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: currentTask ? 'Tugas berhasil diperbarui ✏️' : 'Tugas berhasil ditambahkan ✅',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error("Gagal menyimpan tugas", error);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan! Pastikan semua kolom terisi dengan benar.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi Delete dengan SweetAlert2
    const handleDelete = async (id, taskTitle) => {
        const result = await Swal.fire({
            title: 'Hapus Tugas?',
            html: `Apakah Anda yakin ingin menghapus tugas <strong>"${taskTitle}"</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Ya, Hapus!',
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
            Swal.fire({
                title: 'Menghapus...',
                text: 'Sedang memproses penghapusan',
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
                await api.delete(`/tasks/${id}`);
                await fetchTasks();
                
                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Tugas berhasil dihapus 🗑️',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            } catch (error) {
                console.error("Gagal menghapus tugas", error);
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus tugas',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        }
    };

    // Handler untuk tambah mata kuliah
    const openAddSubjectModal = () => {
        setNewSubjectName('');
        setNewSubjectColor('');
        setIsAddSubjectModalOpen(true);
    };

    const closeAddSubjectModal = () => {
        setIsAddSubjectModalOpen(false);
    };

    // Fungsi Add Subject dengan SweetAlert2
    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Nama mata kuliah tidak boleh kosong',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }
        setIsAddingSubject(true);
        
        Swal.fire({
            title: 'Menyimpan...',
            text: 'Sedang menambah mata kuliah',
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
            const response = await api.post('/subjects', {
                name: newSubjectName.trim(),
                color: newSubjectColor || null,
            });
            const newSubject = response.data.data;
            await fetchSubjects();
            setFormData(prev => ({ ...prev, subject_id: newSubject.id }));
            closeAddSubjectModal();
            
            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Mata kuliah berhasil ditambahkan 📚',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
            });
        } catch (error) {
            console.error("Gagal menambah mata kuliah", error);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menambah mata kuliah',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setIsAddingSubject(false);
        }
    };

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full px-3 sm:px-4 md:px-6 lg:max-w-5xl xl:max-w-6xl lg:mx-auto">
            {/* HEADER WELCOME */}
            <div className="text-center py-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-2">
                    Selamat datang, {user?.name || 'User'}! 🎉
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Kelola Tugas-tugas Anda
                </p>
            </div>

            {/* TUGAS MENDEKATI DEADLINE */}
            {nearDeadlineTasks.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="text-red-500" size={20} />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Tugas Mendekati Deadline
                        </h2>
                        <span className="ml-auto text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                            {nearDeadlineTasks.length} tugas
                        </span>
                    </div>
                    <div className="space-y-3">
                        {nearDeadlineTasks.map(task => {
                            const daysRemaining = getDaysRemaining(task.deadline);
                            return (
                                <div 
                                    key={task.id} 
                                    id={`task-${task.id}`}
                                    className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 transition-all"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 dark:text-white">
                                            {task.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                Deadline: {formatDate(task.deadline)}
                                            </span>
                                            {task.subject && (
                                                <span className="flex items-center gap-1">
                                                    <BookOpen size={14} />
                                                    {task.subject.name}
                                                </span>
                                            )}
                                            <span className={`text-xs font-medium ${daysRemaining === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                                                {daysRemaining === 0 ? '⚠️ Hari ini!' : `⏰ ${daysRemaining} hari lagi`}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStatusChangeWithAnimation(task.id, 'done')}
                                        disabled={doneAnimating === task.id}
                                        className={`ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                                            doneAnimating === task.id ? 'opacity-50 scale-95 cursor-not-allowed' : 'hover:scale-105'
                                        }`}
                                    >
                                        {doneAnimating === task.id ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} /> Done
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* STATISTIK CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {/* Total Tugas */}
                <div 
                    onClick={() => { setFilterStatus(''); setPage(1); }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tugas</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</h3>
                        </div>
                    </div>
                </div>

                {/* Selesai */}
                <div 
                    onClick={() => { setFilterStatus('done'); setPage(1); }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Selesai</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.done}</h3>
                        </div>
                    </div>
                </div>

                {/* Sedang Dikerjakan */}
                <div 
                    onClick={() => { setFilterStatus('progress'); setPage(1); }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <CircleDashed size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.progress}</h3>
                        </div>
                    </div>
                </div>

                {/* Belum Dimulai */}
                <div 
                    onClick={() => { setFilterStatus('pending'); setPage(1); }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress Keseluruhan</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari tugas..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm transition-all"
                    />
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:flex gap-2 w-full md:w-auto">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)} 
                        className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="progress">Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <select 
                        value={filterPriority} 
                        onChange={(e) => setFilterPriority(e.target.value)} 
                        className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                    >
                        <option value="">Semua Prioritas</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <button 
                        onClick={() => openModal()} 
                        className="w-full xs:col-span-2 md:w-auto md:col-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm whitespace-nowrap"
                    >
                        <Plus size={18} /> Tambah
                    </button>
                </div>
            </div>

            {/* DAFTAR TUGAS - GRID CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-4">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-3 text-slate-500 dark:text-slate-400">Memuat data...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <Clock className="mx-auto text-slate-300 dark:text-slate-600" size={48} />
                        <p className="mt-3 text-slate-500 dark:text-slate-400">Tidak ada tugas ditemukan</p>
                    </div>
                ) : (
                    tasks.map((task) => {
                        let cardBg = 'bg-white dark:bg-slate-800';
                        let cardBorder = 'border-slate-100 dark:border-slate-700';
                        let priorityBadge = getPriorityColor(task.priority);
                        
                        if (task.priority === 'high') {
                            cardBg = 'bg-red-50/80 dark:bg-red-950/30';
                            cardBorder = 'border-red-200 dark:border-red-800/40';
                        } else if (task.priority === 'medium') {
                            cardBg = 'bg-amber-50/80 dark:bg-amber-950/20';
                            cardBorder = 'border-amber-200 dark:border-amber-800/40';
                        } else if (task.priority === 'low') {
                            cardBg = 'bg-green-50/80 dark:bg-green-950/20';
                            cardBorder = 'border-green-200 dark:border-green-800/40';
                        }

                        const deadlineStyle = getDeadlineStyle(task.deadline, task.status);
                        const daysRemaining = getDaysRemaining(task.deadline);
                        const isNearDeadline = daysRemaining <= 2 && daysRemaining >= 0;

                        return (
                            <div 
                                key={task.id} 
                                id={`task-${task.id}`}
                                className={`${cardBg} ${cardBorder} ${deadlineStyle} rounded-2xl shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-black/20 transition-all duration-300 border overflow-hidden flex flex-col`}
                            >
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-semibold text-slate-800 dark:text-white text-base leading-snug mb-2">
                                        {task.title}
                                    </h4>
                                    
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 space-y-0.5">
                                        {task.subject && (
                                            <p className="font-medium text-indigo-600 dark:text-indigo-400">
                                                📚 {task.subject.name}
                                            </p>
                                        )}
                                    </div>

                                    {task.description && (
                                        <div className="mb-3 pl-3 border-l-2 border-indigo-300 dark:border-indigo-700">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                                                {task.description}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex-1"></div>

                                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                                                isNearDeadline && task.status !== 'done' 
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' 
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                <Calendar size={12} />
                                                {task.deadline}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${priorityBadge}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChangeWithAnimation(task.id, e.target.value)}
                                            className={`text-xs font-bold uppercase rounded-full px-2.5 py-1 outline-none cursor-pointer border transition-all ${
                                                task.status === 'done' 
                                                    ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' 
                                                    : task.status === 'progress'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                                                    : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                            }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="progress">Progress</option>
                                            <option value="done">Selesai</option>
                                        </select>
                                    </div>

                                    {task.source_url && (
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <a 
                                                href={task.source_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                <ExternalLink size={13} /> Link Tugas
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex border-t border-slate-200 dark:border-slate-700">
                                    <button 
                                        onClick={() => openModal(task)} 
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(task.id, task.title)} 
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border-l border-slate-200 dark:border-slate-700"
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* PAGINATION */}
            {!loading && tasks.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Halaman {paginationData.current_page || 1} dari {paginationData.last_page || 1}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={!paginationData.prev_page_url} 
                            onClick={() => setPage(page - 1)} 
                            className="px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={!paginationData.next_page_url} 
                            onClick={() => setPage(page + 1)} 
                            className="px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL TUGAS - tetap sama */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {currentTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Tugas *</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Contoh: Perancangan Strategis SI" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah *</label>
                                <div className="flex gap-2">
                                    <select
                                        required
                                        value={formData.subject_id}
                                        onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                                        className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    >
                                        <option value="">Pilih Mata Kuliah</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={openAddSubjectModal}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        title="Tambah Mata Kuliah Baru"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sumber Tugas (URL)</label>
                                <input type="url" value={formData.source_url} onChange={(e) => setFormData({...formData, source_url: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="https://classroom.google.com/..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline *</label>
                                    <input type="date" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                                    <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                    className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="progress">Progress</option>
                                    <option value="done">Selesai</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan (Opsional)</label>
                                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm" placeholder="Detail tugas..."></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm">Batal</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Tugas'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH MATA KULIAH - tetap sama */}
            {isAddSubjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Tambah Mata Kuliah Baru
                            </h3>
                            <button onClick={closeAddSubjectModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubject} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Mata Kuliah *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Contoh: Pemrograman Web"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Warna (Opsional)</label>
                                <input 
                                    type="color" 
                                    value={newSubjectColor}
                                    onChange={(e) => setNewSubjectColor(e.target.value)}
                                    className="w-full h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                                <button type="button" onClick={closeAddSubjectModal} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm">
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isAddingSubject}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                                >
                                    {isAddingSubject ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}