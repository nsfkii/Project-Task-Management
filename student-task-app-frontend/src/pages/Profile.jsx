// src/pages/Profile.jsx
import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, GraduationCap, Edit2, Save, X, Camera, BookOpen, Calendar, CheckCircle, Clock, Github, Linkedin, Globe, Instagram, Award } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [taskStats, setTaskStats] = useState({ total: 0, done: 0, progress: 0, pending: 0 });
    const fileInputRef = useRef(null);

    // 1. State mahasiswaData diinisialisasi kosong (nilai default)
    const [mahasiswaData, setMahasiswaData] = useState({
        nim: '',
        program_studi: '',
        semester: 1,
        ipk: 0,
        bio: '',
        github: '',
        linkedin: '',
        website: '',
        instagram: ''
    });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        nim: mahasiswaData.nim,
        program_studi: mahasiswaData.program_studi,
        semester: mahasiswaData.semester,
        ipk: mahasiswaData.ipk,
        bio: mahasiswaData.bio,
        github: mahasiswaData.github,
        linkedin: mahasiswaData.linkedin,
        website: mahasiswaData.website,
        instagram: mahasiswaData.instagram
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(
        user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null
    );

    // 2. useEffect untuk memuat data dari localStorage saat halaman dimuat
    useEffect(() => {
        const saved = localStorage.getItem('mahasiswaData');
        if (saved) {
            const parsed = JSON.parse(saved);
            setMahasiswaData(parsed);
            setFormData(prev => ({ ...prev, ...parsed }));
        }
    }, []);

    const fetchTaskStats = async () => {
        try {
            const response = await api.get('/tasks?all=true');
            const tasks = response.data;
            const total = tasks.length;
            const done = tasks.filter(t => t.status === 'done').length;
            const progress = tasks.filter(t => t.status === 'progress').length;
            const pending = tasks.filter(t => t.status === 'pending').length;
            setTaskStats({ total, done, progress, pending });
        } catch (error) {
            console.error("Gagal mengambil statistik tugas", error);
        }
    };

    useEffect(() => {
        fetchTaskStats();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (avatarFile) data.append('avatar', avatarFile);
        try {
            const response = await api.post('/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(response.data.user);
            setMahasiswaData({
                nim: formData.nim,
                program_studi: formData.program_studi,
                semester: formData.semester,
                ipk: formData.ipk,
                bio: formData.bio,
                github: formData.github,
                linkedin: formData.linkedin,
                website: formData.website,
                instagram: formData.instagram
            });

            // 3. Simpan data ke localStorage setelah sukses
            localStorage.setItem('mahasiswaData', JSON.stringify({
                nim: formData.nim,
                program_studi: formData.program_studi,
                semester: formData.semester,
                ipk: formData.ipk,
                bio: formData.bio,
                github: formData.github,
                linkedin: formData.linkedin,
                website: formData.website,
                instagram: formData.instagram
            }));

            setIsEditing(false);
            alert("Profil berhasil diperbarui!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Gagal memperbarui profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            nim: mahasiswaData.nim,
            program_studi: mahasiswaData.program_studi,
            semester: mahasiswaData.semester,
            ipk: mahasiswaData.ipk,
            bio: mahasiswaData.bio,
            github: mahasiswaData.github,
            linkedin: mahasiswaData.linkedin,
            website: mahasiswaData.website,
            instagram: mahasiswaData.instagram
        });
        setPreviewUrl(user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null);
        setAvatarFile(null);
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Banner Cover */}
            <div className="h-24 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Kartu Profil */}
            <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-xl border border-slate-100 dark:border-slate-700 -mt-12 relative z-10">
                {/* Header dengan Avatar dan Tombol Edit */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 pt-4 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={previewUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=96`}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover object-center"
                            />
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 p-1 bg-indigo-600 text-white rounded-full shadow-md hover:scale-105 transition-transform"
                                >
                                    <Camera size={14} />
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium transition-all flex items-center gap-2"
                        >
                            <Edit2 size={16} /> Edit Profil
                        </button>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 px-6 pb-3">
                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                        <GraduationCap size={12} /> Mahasiswa Aktif
                    </span>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1">
                        <Award size={12} /> Semester {mahasiswaData.semester}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <BookOpen size={12} /> IPK {mahasiswaData.ipk}
                    </span>
                </div>

                {/* Form / Informasi */}
                <form onSubmit={handleSave} className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Nama */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <User size={16} /> Nama Lengkap
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">{user?.name}</div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Mail size={16} /> Alamat Email
                            </label>
                            {isEditing ? (
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">{user?.email}</div>
                            )}
                        </div>

                        {/* NIM */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <GraduationCap size={16} /> NIM
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.nim} onChange={(e) => setFormData({...formData, nim: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" />
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">{mahasiswaData.nim || '-'}</div>
                            )}
                        </div>

                        {/* Program Studi */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <BookOpen size={16} /> Program Studi
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.program_studi} onChange={(e) => setFormData({...formData, program_studi: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" />
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">{mahasiswaData.program_studi || '-'}</div>
                            )}
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Calendar size={16} /> Semester
                            </label>
                            {isEditing ? (
                                <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none">
                                    {[...Array(14).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                                </select>
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">{mahasiswaData.semester}</div>
                            )}
                        </div>

                        {/* IPK */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Award size={16} /> IPK
                            </label>
                            {isEditing ? (
                                <input type="number" step="0.01" min="0" max="4" value={formData.ipk} onChange={(e) => setFormData({...formData, ipk: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none" />
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">{mahasiswaData.ipk}</div>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Bio Singkat
                            </label>
                            {isEditing ? (
                                <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Ceritakan sedikit tentang diri Anda..."></textarea>
                            ) : (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white italic">{mahasiswaData.bio || "Belum ada bio"}</div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2"> Link Sosial Media / Website</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Github size={18} className="text-slate-500 shrink-0" />
                                    {isEditing ? (
                                        <input type="url" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-800 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="GitHub URL" />
                                    ) : (
                                        <a href={mahasiswaData.github} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm truncate">{mahasiswaData.github ? "GitHub" : "Tidak ada"}</a>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Linkedin size={18} className="text-slate-500 shrink-0" />
                                    {isEditing ? (
                                        <input type="url" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-800 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="LinkedIn URL" />
                                    ) : (
                                        <a href={mahasiswaData.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm truncate">{mahasiswaData.linkedin ? "LinkedIn" : "Tidak ada"}</a>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Instagram size={18} className="text-slate-500 shrink-0" />
                                    {isEditing ? (
                                        <input type="url" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-800 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Instagram URL" />
                                    ) : (
                                        <a href={mahasiswaData.instagram} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm truncate">{mahasiswaData.instagram ? "Instagram" : "Tidak ada"}</a>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <Globe size={18} className="text-slate-500 shrink-0" />
                                    {isEditing ? (
                                        <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-800 border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Website URL" />
                                    ) : (
                                        <a href={mahasiswaData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm truncate">{mahasiswaData.website ? "Website" : "Tidak ada"}</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                            <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                                <X size={18} /> Batal
                            </button>
                            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50">
                                <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Statistik Tugas */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                    <div className="text-2xl font-bold text-indigo-600">{taskStats.total}</div>
                    <div className="text-xs text-slate-500 mt-1">Total Tugas</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                    <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                    <div className="text-xs text-slate-500 mt-1">Selesai</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                    <div className="text-2xl font-bold text-amber-600">{taskStats.progress}</div>
                    <div className="text-xs text-slate-500 mt-1">Progress</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all">
                    <div className="text-2xl font-bold text-red-600">{taskStats.pending}</div>
                    <div className="text-xs text-slate-500 mt-1">Pending</div>
                </div>
            </div>
        </div>
    );
}