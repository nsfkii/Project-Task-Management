import { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, GraduationCap, Edit2, Save, X, Camera } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    // State form
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(
        user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Preview instan
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Pakai FormData karena kita mengirim file gambar
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            const response = await api.post('/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(response.data.user); // Update context langsung
            setIsEditing(false);
            alert("Profil berhasil diperbarui!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Gagal memperbarui profil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profil Pengguna</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola informasi akun Anda di sini.</p>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg font-medium transition-colors">
                        <Edit2 size={16} /> Edit Profil
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 relative"></div>
                
                <form onSubmit={handleSave} className="px-8 pb-8">
                    <div className="relative -top-12 flex justify-between items-end">
                        {/* Foto Profil */}
                        <div className="relative w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center group">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-4xl font-bold">
                                    {formData.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            
                            {/* Tombol Kamera (Muncul saat Edit) */}
                            {isEditing && (
                                <button type="button" onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={24} />
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>

                        <span className="mb-14 px-4 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold rounded-full flex items-center gap-2">
                            <GraduationCap size={16} /> Mahasiswa Aktif
                        </span>
                    </div>

                    <div className="space-y-6 -mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <User size={16} /> Nama Lengkap
                                </label>
                                {isEditing ? (
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" required />
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-100 dark:border-gray-600">
                                        {user?.name}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <Mail size={16} /> Alamat Email
                                </label>
                                {isEditing ? (
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" required />
                                ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium border border-gray-100 dark:border-gray-600">
                                        {user?.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tombol Action Edit */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                                <button type="button" onClick={() => { setIsEditing(false); setPreviewUrl(user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null); setFormData({name: user?.name, email: user?.email}); }} className="px-4 py-2 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                                    <X size={18} /> Batal
                                </button>
                                <button type="submit" disabled={loading} className="px-4 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                                    <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}