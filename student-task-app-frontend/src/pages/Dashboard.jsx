import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Clock, CheckCircle, CircleDashed, AlertCircle, X, ExternalLink} from 'lucide-react';
import api from '../api/axios';
import { useCallback } from "react";

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, done: 0, progress: 0, pending: 0 });
    const [page, setPage] = useState(1); // State untuk halaman
    const [paginationData, setPaginationData] = useState({}); // Info halaman terakhir dll
    const [loading, setLoading] = useState(true);
    
    // State untuk Search dan Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    // State untuk Modal (Tambah/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null); // null = tambah baru, isi = edit
    const [formData, setFormData] = useState({
        title: '', subject: '', source_url: '', description: '', deadline: '', priority: 'medium', status: 'pending'
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Mengambil data dari API
        const fetchTasks = useCallback(async () => {
        setLoading(true);

        try {
            let url = `/tasks?page=${page}&`;

            if (debouncedSearch) url += `search=${debouncedSearch}&`;
            if (filterStatus) url += `status=${filterStatus}&`;
            if (filterPriority) url += `priority=${filterPriority}&`;

            const response = await api.get(url);

            setStats(response.data.stats);
            setTasks(response.data.tasks.data);
            setPaginationData(response.data.tasks);

        } catch (error) {
            console.error("Gagal mengambil data tugas", error);
        } finally {
            setLoading(false);
        }

        }, [debouncedSearch, filterStatus, filterPriority, page]);

    // Jalankan fetchTasks setiap kali debounce search atau filter berubah
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    // --- FUNGSI AKSI CRUD ---

    // Buka Modal (Untuk Tambah atau Edit)
        const openModal = (task = null) => {
            if (task) {
                setCurrentTask(task);
                setFormData({
                    title: task.title, subject: task.subject, source_url: task.source_url || '', description: task.description || '',
                    deadline: task.deadline, priority: task.priority, status: task.status
                });
            } else {
            setCurrentTask(null);
            setFormData({
                title: '', subject: '', description: '', deadline: '', priority: 'medium', status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    // Simpan Data (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentTask) {
                await api.put(`/tasks/${currentTask.id}`, formData); // Update
            } else {
                await api.post('/tasks', formData); // Create
            }
            setIsModalOpen(false);
            fetchTasks(); // Refresh tabel
        } catch (error) {
            console.error("Gagal menyimpan tugas", error);
            alert("Terjadi kesalahan! Pastikan semua kolom terisi dengan benar.");
        }
    };

    // Hapus Data
    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus tugas ini?")) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchTasks(); // Refresh tabel
            } catch (error) {
                console.error("Gagal menghapus tugas", error);
            }
        }
    };

    // Ubah Status Langsung dari Dropdown Tabel
    const handleStatusChange = async (id, newStatus) => {
        try {
            // Kita gunakan PUT, tapi hanya mengirim status saja
            await api.put(`/tasks/${id}`, { status: newStatus });
            fetchTasks(); // Refresh tabel dan statistik
        } catch (error) {
            console.error("Gagal mengubah status", error);
        }
    };

    // --- Menghitung Statistik ---
        const progressPercentage =
        stats.total === 0
            ? 0
            : Math.round((stats.done / stats.total) * 100);

    // Fungsi Pembantu UI
    const getPriorityColor = (priority) => {
        if (priority === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        if (priority === 'medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    };

    const isNearDeadline = (deadline) => {
        const today = new Date();
        const taskDate = new Date(deadline);
        const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && diffDays >= 0;
    };

    return (
        <div className="space-y-6 relative">
            {/* Bagian 1: Kartu Statistik & Progress Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Tugas</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.task}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1 text-gray-500 dark:text-gray-400">
                            <span>Progress Keseluruhan</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Selesai (Done)</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.done}</h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sedang Dikerjakan</p>
                        <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.progress}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg">
                        <CircleDashed size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Belum Dimulai</p>
                        <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mt-1">{stats.pending}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Bagian 2: Bar Pencarian, Filter & Tombol Tambah */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari judul tugas atau mata kuliah..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="progress">Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option value="">Semua Prioritas</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    {/* Tombol Tambah sekarang memanggil openModal */}
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
                        <Plus size={20} /> Tambah
                    </button>
                </div>
            </div>

            {/* Bagian 3: Daftar Tugas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-sm border-b dark:border-gray-700">
                                <th className="p-4 font-medium">Judul Tugas & Mata Kuliah</th>
                                <th className="p-4 font-medium">Deadline</th>
                                <th className="p-4 font-medium text-center">Prioritas</th>
                                <th className="p-4 font-medium text-center">Status</th>
                                <th className="p-4 font-medium">Deskripsi</th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Tidak ada tugas ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">

                                        {/* Judul */}
                                       <td className="p-4">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{task.title}</p>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{task.subject}</span>
                                                
                                                {/* Tombol Link Sumber Tugas */}
                                                {task.source_url && (
                                                    <a 
                                                        href={task.source_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline w-fit mt-1 transition-colors"
                                                    >
                                                        <ExternalLink size={12} /> Sumber Tugas
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        {/* Deadline */}
                                        <td className="p-4">
                                            <div
                                                className={`flex items-center gap-1.5 text-sm ${
                                                    isNearDeadline(task.deadline) &&
                                                    task.status !== 'done'
                                                        ? 'text-red-600 font-semibold'
                                                        : 'text-gray-600 dark:text-gray-300'
                                                }`}
                                            >
                                                {isNearDeadline(task.deadline) &&
                                                    task.status !== 'done' && (
                                                        <AlertCircle size={16} />
                                                    )}
                                                {task.deadline}
                                            </div>
                                        </td>

                                        {/* Prioritas */}
                                        <td className="p-4 text-center">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                                                    task.priority
                                                )} uppercase`}
                                            >
                                                {task.priority}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="p-4 text-center">
                                            <select
                                                value={task.status}
                                                onChange={(e) =>
                                                    handleStatusChange(task.id, e.target.value)
                                                }
                                                className={`text-sm rounded-lg px-2 py-1 outline-none cursor-pointer font-medium ${
                                                    task.status === 'done'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : task.status === 'progress'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="progress">Progress</option>
                                                <option value="done">Done</option>
                                            </select>
                                        </td>

                                        {/* DESKRIPSI */}
                                        <td className="p-4">
                                            <p
                                                className="text-sm text-gray-600 dark:text-gray-300 max-w-[350px] line-clamp-2"
                                                title={task.description}
                                            >
                                                {task.description || '-'}
                                            </p>
                                        </td>

                                        {/* Aksi */}
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(task)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit size={25} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="p-2 text text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={23} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan halaman {paginationData.current_page || 1} dari {paginationData.last_page || 1}
                </span>

                <div className="flex gap-2">
                    <button 
                        disabled={!paginationData.prev_page_url}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                        Sebelumnya
                    </button>

                    <button 
                        disabled={!paginationData.next_page_url}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
            </div>

            {/* Bagian 4: Modal Form (Tambah/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {currentTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Tugas</label>
                                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Kuliah</label>
                                <input required type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sumber Tugas (Link URL)</label>
                                <input type="url" placeholder="https://classroom.google.com/..." value={formData.source_url} onChange={(e) => setFormData({...formData, source_url: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                                    <input required type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioritas</label>
                                    <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi (Opsional)</label>
                                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Simpan Tugas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}