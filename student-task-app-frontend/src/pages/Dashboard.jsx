import { useState, useEffect, useCallback } from 'react';
import { 
    Search, Plus, Trash2, Edit, Clock, CheckCircle, CircleDashed, 
    AlertCircle, X, ExternalLink
} from 'lucide-react';
import api from '../api/axios';

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
            const cleanTasks = response.data.tasks.data.map(task => ({
                ...task,
                source_url: (task.source_url && task.source_url !== 'nullable|string') ? task.source_url : null
            }));
            setStats(response.data.stats);
            setTasks(cleanTasks);
            setPaginationData({ ...response.data.tasks, data: cleanTasks });
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

    const progressPercentage = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

    const getPriorityColor = (priority) => {
        if (priority === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        if (priority === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    };

    const isNearDeadline = (deadline) => {
        const today = new Date();
        const taskDate = new Date(deadline);
        const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && diffDays >= 0;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
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
            fetchTasks();
        } catch (error) {
            console.error("Gagal menyimpan tugas", error);
            alert("Terjadi kesalahan! Pastikan semua kolom terisi dengan benar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus tugas ini?")) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchTasks();
            } catch (error) {
                console.error("Gagal menghapus tugas", error);
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/tasks/${id}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error("Gagal mengubah status", error);
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

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) {
            alert("Nama mata kuliah tidak boleh kosong");
            return;
        }
        setIsAddingSubject(true);
        try {
            const response = await api.post('/subjects', {
                name: newSubjectName.trim(),
                color: newSubjectColor || null,
            });
            const newSubject = response.data.data;
            // Refresh daftar mata kuliah
            await fetchSubjects();
            // Set pilihan ke mata kuliah yang baru ditambahkan
            setFormData(prev => ({ ...prev, subject_id: newSubject.id }));
            // Tutup modal tambah mata kuliah
            closeAddSubjectModal();
        } catch (error) {
            console.error("Gagal menambah mata kuliah", error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat menambah mata kuliah");
        } finally {
            setIsAddingSubject(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* STATISTIK CARDS - Klik untuk filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Tugas - klik untuk reset filter */}
                <div 
                    onClick={() => { setFilterStatus(''); setPage(1); }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 dark:border-slate-700 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tugas</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>Progress Keseluruhan</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Selesai - klik untuk filter status 'done' */}
                <div 
                    onClick={() => { setFilterStatus('done'); setPage(1); }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 dark:border-slate-700 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Selesai</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.done}</h3>
                    </div>
                </div>

                {/* Sedang Dikerjakan - klik untuk filter status 'progress' */}
                <div 
                    onClick={() => { setFilterStatus('progress'); setPage(1); }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 dark:border-slate-700 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <CircleDashed size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sedang Dikerjakan</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.progress}</h3>
                    </div>
                </div>

                {/* Belum Dimulai - klik untuk filter status 'pending' */}
                <div 
                    onClick={() => { setFilterStatus('pending'); setPage(1); }}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50 dark:border-slate-700 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Belum Dimulai</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.pending}</h3>
                    </div>
                </div>
            </div>

            {/* SEARCH, FILTER & TAMBAH BUTTON */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari judul tugas atau mata kuliah..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)} 
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="progress">Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <select 
                        value={filterPriority} 
                        onChange={(e) => setFilterPriority(e.target.value)} 
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                        <option value="">Semua Prioritas</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <button 
                        onClick={() => openModal()} 
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={20} /> Tambah
                    </button>
                </div>
            </div>

            {/* DAFTAR TUGAS (CARD BASED) */}
            <div className="space-y-4 mt-8">
                {loading ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">Memuat data...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">Tidak ada tugas ditemukan.</div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-black/20 border border-slate-100 dark:border-slate-700 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{task.title}</h4>
                                {task.subject && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {task.subject.name}
                                    </p>
                                )}
                                {task.source_url && (
                                    <a href={task.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors mt-1 w-fit">
                                        <ExternalLink size={14} /> Buka Sumber Tugas
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    className={`text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1.5 outline-none cursor-pointer ${
                                        task.status === 'done' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                        task.status === 'progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="progress">Progress</option>
                                    <option value="done">Selesai</option>
                                </select>
                                <div className="flex flex-col items-end">
                                    <div className={`flex items-center gap-1 text-xs font-medium ${isNearDeadline(task.deadline) && task.status !== 'done' ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {isNearDeadline(task.deadline) && task.status !== 'done' && <AlertCircle size={14} />}
                                        <span>{task.deadline}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(task)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* PAGINATION */}
            {!loading && tasks.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Halaman {paginationData.current_page || 1} dari {paginationData.last_page || 1}
                    </span>
                    <div className="flex gap-2">
                        <button disabled={!paginationData.prev_page_url} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                            Sebelumnya
                        </button>
                        <button disabled={!paginationData.next_page_url} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                            Berikutnya
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL TUGAS dengan dropdown mata kuliah + tombol tambah */}
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
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: Perancangan Strategis SI" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah *</label>
                                <div className="flex gap-2">
                                    <select
                                        required
                                        value={formData.subject_id}
                                        onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                                        className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                <input type="url" value={formData.source_url} onChange={(e) => setFormData({...formData, source_url: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://classroom.google.com/..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline *</label>
                                    <input type="date" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
                                    <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi (Opsional)</label>
                                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Detail tugas..."></textarea>
                            </div>

                            {/* Status dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                    className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="progress">Progress</option>
                                    <option value="done">Selesai</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Batal</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

            {/* MODAL TAMBAH MATA KULIAH */}
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
                                    className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                <p className="text-xs text-slate-500 mt-1">Warna akan otomatis dihasilkan jika tidak diisi</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                                <button type="button" onClick={closeAddSubjectModal} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isAddingSubject}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isAddingSubject ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Mata Kuliah'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}