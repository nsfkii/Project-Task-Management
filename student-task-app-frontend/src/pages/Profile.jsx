// src/pages/Profile.jsx
import { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    User, Mail, GraduationCap, Edit2, Save, X, Camera, BookOpen, 
    Calendar, Award, Plus, Trash2, ExternalLink, Building2,
    Globe, Github, Linkedin, Instagram, Loader2, Palette
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { buildAvatarUrl, parseTasksPayload, parseUserPayload, toArray } from '../utils/apiResponse';

export default function Profile() {
    const { user, userProfile, updateUserProfile, setUser, colorTheme, setColorTheme } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [taskStats, setTaskStats] = useState({ total: 0, done: 0, progress: 0, pending: 0 });
    const fileInputRef = useRef(null);

    // State untuk form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // State untuk Organization Links
    const [orgLinks, setOrgLinks] = useState([]);
    const [newLink, setNewLink] = useState({ name: '', url: '' });
    const [addingLink, setAddingLink] = useState(false);

    // Fungsi fetchUserData dibungkus useCallback
    const fetchUserData = useCallback(async () => {
        try {
            const response = await api.get('/user');
            const userData = parseUserPayload(response.data);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                nim: userData.nim || '',
                program_studi: userData.program_studi || '',
                semester: userData.semester || 1,
                ipk: userData.ipk || 0,
                bio: userData.bio || '',
                github: userData.github || '',
                linkedin: userData.linkedin || '',
                website: userData.website || '',
                instagram: userData.instagram || ''
            });
            setPreviewUrl(buildAvatarUrl(userData?.avatar));
            updateUserProfile(userData);
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
        }
    }, [updateUserProfile]);

    // Fetch data user dari cache atau API
    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                nim: userProfile.nim || '',
                program_studi: userProfile.program_studi || '',
                semester: userProfile.semester || 1,
                ipk: userProfile.ipk || 0,
                bio: userProfile.bio || '',
                github: userProfile.github || '',
                linkedin: userProfile.linkedin || '',
                website: userProfile.website || '',
                instagram: userProfile.instagram || ''
            });
            setPreviewUrl(buildAvatarUrl(userProfile.avatar));
        } else {
            fetchUserData();
        }
    }, [userProfile, fetchUserData]);

    // Fetch organization links
    const fetchOrgLinks = useCallback(async () => {
        try {
            const response = await api.get('/organization-links');
            setOrgLinks(response.data.data || response.data || []);
        } catch (error) {
            console.error("Gagal mengambil organization links:", error);
        }
    }, []);

    useEffect(() => {
        fetchOrgLinks();
    }, [fetchOrgLinks]);

    // FIX PENTING: Fetch task stats dengan safety handler
    const fetchTaskStats = useCallback(async () => {
        try {
            const response = await api.get('/tasks?all=true');
            const { tasks } = parseTasksPayload(response.data);
            const safeTasks = toArray(tasks);
            
            // Validasi array
            if (!Array.isArray(safeTasks)) {
                console.error("Tasks bukan array:", safeTasks);
                setTaskStats({ total: 0, done: 0, progress: 0, pending: 0 });
                return;
            }
            
            setTaskStats({
                total: safeTasks.length,
                done: safeTasks.filter(t => t.status === 'done').length,
                progress: safeTasks.filter(t => t.status === 'progress').length,
                pending: safeTasks.filter(t => t.status === 'pending').length
            });
        } catch (error) {
            console.error("Gagal mengambil statistik tugas:", error);
            setTaskStats({ total: 0, done: 0, progress: 0, pending: 0 });
        }
    }, []);

    useEffect(() => {
        fetchTaskStats();
    }, [fetchTaskStats]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Terlalu Besar',
                    text: 'Ukuran file maksimal 2MB',
                    confirmButtonColor: '#4F46E5'
                });
                return;
            }
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Format Tidak Didukung',
                    text: 'Hanya file gambar yang diperbolehkan',
                    confirmButtonColor: '#4F46E5'
                });
                return;
            }
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
        data.append('nim', formData.nim);
        data.append('program_studi', formData.program_studi);
        data.append('semester', formData.semester);
        data.append('ipk', formData.ipk);
        data.append('bio', formData.bio);
        data.append('github', formData.github);
        data.append('linkedin', formData.linkedin);
        data.append('instagram', formData.instagram);
        data.append('website', formData.website);
        if (avatarFile) data.append('avatar', avatarFile);
        
        try {
            const response = await api.post('/profile', data);
            const updatedUser = parseUserPayload(response.data);
            updateUserProfile(updatedUser);
            setUser(updatedUser);
            
            setIsEditing(false);
            setAvatarFile(null);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Profil berhasil diperbarui! 🎉',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: error.response?.data?.message || 'Gagal memperbarui profil.',
                confirmButtonColor: '#4F46E5'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setAvatarFile(null);
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                nim: userProfile.nim || '',
                program_studi: userProfile.program_studi || '',
                semester: userProfile.semester || 1,
                ipk: userProfile.ipk || 0,
                bio: userProfile.bio || '',
                github: userProfile.github || '',
                linkedin: userProfile.linkedin || '',
                website: userProfile.website || '',
                instagram: userProfile.instagram || ''
            });
            setPreviewUrl(buildAvatarUrl(userProfile.avatar));
        }
    };

    // Organization Links CRUD
    const addOrgLink = async () => {
        if (!newLink.name.trim() || !newLink.url.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Form Tidak Lengkap',
                text: 'Nama dan URL harus diisi!',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }
        
        let isValidUrl;
        try {
            new URL(newLink.url);
            isValidUrl = true;
        } catch {
            isValidUrl = false;
        }
        
        if (!isValidUrl) {
            Swal.fire({
                icon: 'error',
                title: 'URL Tidak Valid',
                text: 'Masukkan URL yang valid (contoh: https://kampus.ac.id)',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }
        
        setAddingLink(true);
        try {
            await api.post('/organization-links', newLink);
            setNewLink({ name: '', url: '' });
            await fetchOrgLinks();
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Link berhasil ditambahkan!',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: error.response?.data?.message || 'Gagal menambahkan link',
                confirmButtonColor: '#4F46E5'
            });
        } finally {
            setAddingLink(false);
        }
    };

    const updateOrgLink = async (id, data) => {
        try {
            await api.put(`/organization-links/${id}`, data);
            await fetchOrgLinks();
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Link berhasil diperbarui!',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Gagal memperbarui link',
                confirmButtonColor: '#4F46E5'
            });
        }
    };

    const deleteOrgLink = async (id) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Hapus Link?',
            text: 'Apakah Anda yakin ingin menghapus link ini?',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            reverseButtons: true
        });
        
        if (result.isConfirmed) {
            try {
                await api.delete(`/organization-links/${id}`);
                await fetchOrgLinks();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Link berhasil dihapus!',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: 'Gagal menghapus link',
                    confirmButtonColor: '#4F46E5'
                });
            }
        }
    };

    const socialLinks = [
        { icon: Globe, label: 'Website', state: 'website', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { icon: Linkedin, label: 'LinkedIn', state: 'linkedin', color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { icon: Github, label: 'GitHub', state: 'github', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-50 dark:bg-gray-500/10' },
        { icon: Instagram, label: 'Instagram', state: 'instagram', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' }
    ];

    const themeOptions = [
        { id: 'calm', name: 'Calm', desc: 'Lembut & fokus belajar', swatch: 'from-[#5f8f87] to-[#43615d]' },
        { id: 'forest', name: 'Forest', desc: 'Natural & menenangkan', swatch: 'from-[#4d8b68] to-[#365f48]' },
        { id: 'midnight', name: 'Midnight', desc: 'Dingin & profesional', swatch: 'from-[#5d728f] to-[#3d4d62]' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Banner Cover */}
            <div className="h-24 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Kartu Profil */}
            <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-xl border border-slate-100 dark:border-slate-700 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 pt-4 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <img
                                src={previewUrl || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=6366f1&color=fff&size=96`}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover object-center group-hover:ring-2 group-hover:ring-indigo-400 transition-all"
                            />
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:scale-110 transition-transform"
                                >
                                    <Camera size={14} />
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                {formData.name || user?.name}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formData.email || user?.email}
                            </p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium transition-all flex items-center gap-2 hover:shadow-md"
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
                        <Award size={12} /> Semester {formData.semester}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <BookOpen size={12} /> {formData.ipk ? `IPK ${formData.ipk}` : 'Belum ada IPK'}
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
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" required />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{formData.name}</div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Mail size={16} /> Alamat Email
                            </label>
                            {isEditing ? (
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" required />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{formData.email}</div>
                            )}
                        </div>

                        {/* NIM */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <GraduationCap size={16} /> NIM / NIS
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.nim} onChange={(e) => setFormData({...formData, nim: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="Contoh: 3224005" />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{formData.nim || '-'}</div>
                            )}
                        </div>

                        {/* Program Studi */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <BookOpen size={16} /> Jurusan / Program Studi
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.program_studi} onChange={(e) => setFormData({...formData, program_studi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="Contoh: Sistem Informasi" />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{formData.program_studi || '-'}</div>
                            )}
                        </div>

                        {/* Semester */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Calendar size={16} /> Semester
                            </label>
                            {isEditing ? (
                                <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all">
                                    {[...Array(14).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                                </select>
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{formData.semester}</div>
                            )}
                        </div>

                        {/* IPK */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Award size={16} /> IPK / Nilai Rata-rata
                            </label>
                            {isEditing ? (
                                <input type="number" step="0.01" min="0" max="4" value={formData.ipk} onChange={(e) => setFormData({...formData, ipk: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="0.00" />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{formData.ipk || '-'}</div>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Bio Singkat</label>
                            {isEditing ? (
                                <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 dark:text-white transition-all" placeholder="Ceritakan sedikit tentang diri Anda..."></textarea>
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white italic">{formData.bio || "Belum ada bio"}</div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Link Sosial Media / Website</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <div key={social.state} className={`flex items-center gap-3 p-3 rounded-xl ${social.bg} border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all`}>
                                            <Icon size={20} className={`shrink-0 ${social.color}`} />
                                            {isEditing ? (
                                                <input type="url" value={formData[social.state]} onChange={(e) => setFormData({...formData, [social.state]: e.target.value})} className="flex-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 dark:text-white" placeholder={social.label} />
                                            ) : (
                                                <div className="flex-1 text-sm">
                                                    {formData[social.state] ? (
                                                        <a href={formData[social.state]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1">
                                                            {social.label}<ExternalLink size={12} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500">-</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                            <button type="button" onClick={handleCancel} className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2 font-medium">
                                <X size={18} /> Batal
                            </button>
                            <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Perubahan</>}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Personalisasi Tema */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Palette size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tema StudentTask</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Pilih warna favorit agar pengalaman belajar terasa lebih nyaman.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => setColorTheme(option.id)}
                            className={`text-left p-3 rounded-xl border transition-all ${
                                colorTheme === option.id
                                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                        >
                            <div className={`h-9 rounded-lg bg-gradient-to-r ${option.swatch} mb-2`} />
                            <p className="font-semibold text-slate-800 dark:text-white">{option.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{option.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Organization Links */}
            <div id="organization-section" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 size={22} className="text-blue-500" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Organization Links</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Kelola link organisasi atau kampus/sekolah Anda. Link ini akan muncul di sidebar.</p>

                <div className="space-y-2 mb-4">
                    {orgLinks.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <Building2 size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada link. Silakan tambahkan link organisasi Anda.</p>
                        </div>
                    ) : (
                        orgLinks.map(link => (
                            <div key={link.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:shadow-sm transition-all group">
                                <ExternalLink size={16} className="text-slate-400 shrink-0" />
                                <input type="text" defaultValue={link.name} onBlur={(e) => { if (e.target.value !== link.name) { updateOrgLink(link.id, { name: e.target.value, url: link.url }); } }} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded focus:bg-white dark:focus:bg-slate-800 transition-all" placeholder="Nama" />
                                <input type="url" defaultValue={link.url} onBlur={(e) => { if (e.target.value !== link.url) { updateOrgLink(link.id, { name: link.name, url: e.target.value }); } }} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded focus:bg-white dark:focus:bg-slate-800 transition-all" placeholder="URL" />
                                <button onClick={() => deleteOrgLink(link.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Hapus">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={newLink.name} onChange={(e) => setNewLink({ ...newLink, name: e.target.value })} placeholder="Nama (contoh: STMIK Bandung)" className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all" />
                    <input type="url" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="URL (contoh: https://kampus.ac.id)" className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all" />
                    <button onClick={addOrgLink} disabled={addingLink} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:shadow-md disabled:cursor-not-allowed">
                        {addingLink ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> Tambah</>}
                    </button>
                </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="text-3xl font-bold text-blue-600">{taskStats.total}</div>
                    <div className="text-sm text-slate-500 mt-1">Total Tugas</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="text-3xl font-bold text-green-600">{taskStats.done}</div>
                    <div className="text-sm text-slate-500 mt-1">Selesai</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="text-3xl font-bold text-amber-600">{taskStats.progress}</div>
                    <div className="text-sm text-slate-500 mt-1">Progress</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="text-3xl font-bold text-red-600">{taskStats.pending}</div>
                    <div className="text-sm text-slate-500 mt-1">Pending</div>
                </div>
            </div>
        </div>
    );
}