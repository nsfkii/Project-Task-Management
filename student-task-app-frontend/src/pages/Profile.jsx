// src/pages/Profile.jsx
import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    User, Mail, GraduationCap, Edit2, Save, X, Camera, BookOpen, 
    Calendar, Award, Plus, Trash2, ExternalLink, Building2,
    Globe, Github, Linkedin, Instagram, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios';

export default function Profile() {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [taskStats, setTaskStats] = useState({ total: 0, done: 0, progress: 0, pending: 0 });
    const fileInputRef = useRef(null);

    // State mahasiswaData
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
    const [previewUrl, setPreviewUrl] = useState(
        user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null
    );

    // State untuk Organization Links
    const [orgLinks, setOrgLinks] = useState([]);
    const [newLink, setNewLink] = useState({ name: '', url: '' });
    const [addingLink, setAddingLink] = useState(false); // Loading state untuk tambah link

    // Load data dari localStorage
    useEffect(() => {
        const saved = localStorage.getItem('mahasiswaData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMahasiswaData(parsed);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Gagal parse mahasiswaData:", e);
            }
        }
    }, []);

    // Fetch organization links
    const fetchOrgLinks = async () => {
        try {
            const response = await api.get('/organization-links');
            const links = response.data.data || response.data || [];
            setOrgLinks(links);
        } catch (error) {
            console.error("Gagal mengambil organization links:", error);
        }
    };

    useEffect(() => {
        fetchOrgLinks();
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
        if (avatarFile) data.append('avatar', avatarFile);
        
        try {
            const response = await api.post('/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(response.data.user);
            
            const newMahasiswaData = {
                nim: formData.nim,
                program_studi: formData.program_studi,
                semester: formData.semester,
                ipk: formData.ipk,
                bio: formData.bio,
                github: formData.github,
                linkedin: formData.linkedin,
                website: formData.website,
                instagram: formData.instagram
            };
            
            setMahasiswaData(newMahasiswaData);
            localStorage.setItem('mahasiswaData', JSON.stringify(newMahasiswaData));
            setIsEditing(false);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Profil berhasil diperbarui!',
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

    // Organization Links CRUD dengan SweetAlert2
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
        
        setAddingLink(true); // Mulai loading
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
            setAddingLink(false); // Stop loading
        }
    };

    const updateOrgLink = async (id, data) => {
        try {
            await api.put(`/organization-links/${id}`, data);
            fetchOrgLinks();
            
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
                fetchOrgLinks();
                
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

    // Daftar social media dengan icon lucide-react
    const socialLinks = [
        { 
            icon: Globe, 
            label: 'Website', 
            state: 'website',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10'
        },
        { 
            icon: Linkedin, 
            label: 'LinkedIn', 
            state: 'linkedin',
            color: 'text-blue-700',
            bg: 'bg-blue-50 dark:bg-blue-500/10'
        },
        { 
            icon: Github, 
            label: 'GitHub', 
            state: 'github',
            color: 'text-gray-700 dark:text-gray-300',
            bg: 'bg-gray-50 dark:bg-gray-500/10'
        },
        { 
            icon: Instagram, 
            label: 'Instagram', 
            state: 'instagram',
            color: 'text-pink-500',
            bg: 'bg-pink-50 dark:bg-pink-500/10'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Banner Cover */}
            <div className="h-24 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Kartu Profil */}
            <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-xl border border-slate-100 dark:border-slate-700 -mt-12 relative z-10">
                {/* Header dengan Avatar dan Tombol Edit */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 pt-4 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <img
                                src={previewUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&size=96`}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover object-center group-hover:ring-2 group-hover:ring-indigo-400 transition-all"
                            />
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md hover:scale-110 transition-transform"
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
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
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
                        <Award size={12} /> Semester {mahasiswaData.semester}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <BookOpen size={12} /> {mahasiswaData.ipk ? `IPK ${mahasiswaData.ipk}` : 'Belum ada IPK'}
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
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{user?.name}</div>
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
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{user?.email}</div>
                            )}
                        </div>

                        {/* NIM */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <GraduationCap size={16} /> NIM
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.nim} onChange={(e) => setFormData({...formData, nim: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="Contoh: 3224005" />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{mahasiswaData.nim || '-'}</div>
                            )}
                        </div>

                        {/* Program Studi */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <BookOpen size={16} /> Program Studi
                            </label>
                            {isEditing ? (
                                <input type="text" value={formData.program_studi} onChange={(e) => setFormData({...formData, program_studi: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="Contoh: Sistem Informasi" />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{mahasiswaData.program_studi || '-'}</div>
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
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{mahasiswaData.semester}</div>
                            )}
                        </div>

                        {/* IPK */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                <Award size={16} /> IPK
                            </label>
                            {isEditing ? (
                                <input type="number" step="0.01" min="0" max="4" value={formData.ipk} onChange={(e) => setFormData({...formData, ipk: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="0.00" />
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white">{mahasiswaData.ipk || '-'}</div>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Bio Singkat
                            </label>
                            {isEditing ? (
                                <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 dark:text-white transition-all" placeholder="Ceritakan sedikit tentang diri Anda..."></textarea>
                            ) : (
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white italic">{mahasiswaData.bio || "Belum ada bio"}</div>
                            )}
                        </div>

                        {/* Social Links dengan Icon Modern */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                                Link Sosial Media / Website
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <div 
                                            key={social.state} 
                                            className={`flex items-center gap-3 p-3 rounded-xl ${social.bg} border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all`}
                                        >
                                            <Icon size={20} className={`shrink-0 ${social.color}`} />
                                            {isEditing ? (
                                                <input 
                                                    type="url" 
                                                    value={formData[social.state]} 
                                                    onChange={(e) => setFormData({...formData, [social.state]: e.target.value})} 
                                                    className="flex-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 dark:text-white transition-all" 
                                                    placeholder={social.label} 
                                                />
                                            ) : (
                                                <div className="flex-1 text-sm">
                                                    {mahasiswaData[social.state] ? (
                                                        <a 
                                                            href={mahasiswaData[social.state]} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                                                        >
                                                            {social.label}
                                                            <ExternalLink size={12} />
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
                            <button 
                                type="button" 
                                onClick={handleCancel} 
                                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2 font-medium"
                            >
                                <X size={18} /> Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Organization Links */}
            <div id="organization-section" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 size={22} className="text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        Organization Links
                    </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Kelola link organisasi atau kampus/sekolah Anda. Link ini akan muncul di sidebar.
                </p>

                <div className="space-y-2 mb-4">
                    {orgLinks.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <Building2 size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Belum ada link. Silakan tambahkan link organisasi Anda.
                            </p>
                        </div>
                    ) : (
                        orgLinks.map(link => (
                            <div key={link.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:shadow-sm transition-all group">
                                <ExternalLink size={16} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    defaultValue={link.name}
                                    onBlur={(e) => {
                                        if (e.target.value !== link.name) {
                                            updateOrgLink(link.id, { name: e.target.value, url: link.url });
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded focus:bg-white dark:focus:bg-slate-800 transition-all"
                                    placeholder="Nama"
                                />
                                <input
                                    type="url"
                                    defaultValue={link.url}
                                    onBlur={(e) => {
                                        if (e.target.value !== link.url) {
                                            updateOrgLink(link.id, { name: link.name, url: e.target.value });
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 px-2 py-1 rounded focus:bg-white dark:focus:bg-slate-800 transition-all"
                                    placeholder="URL"
                                />
                                <button
                                    onClick={() => deleteOrgLink(link.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newLink.name}
                        onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                        placeholder="Nama (contoh: STMIK Bandung)"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all"
                    />
                    <input
                        type="url"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="URL (contoh: https://kampus.ac.id)"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all"
                    />
                    <button
                        onClick={addOrgLink}
                        disabled={addingLink}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:shadow-md disabled:cursor-not-allowed"
                    >
                        {addingLink ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Tambah
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Statistik Tugas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-all cursor-pointer">
                    <div className="text-3xl font-bold text-indigo-600">{taskStats.total}</div>
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