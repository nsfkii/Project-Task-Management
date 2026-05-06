import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { parseUserPayload } from '../utils/apiResponse';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/register', { name, email, password });
            const parsedUser = parseUserPayload(response.data);
            login(parsedUser, response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mendaftar, pastikan email belum digunakan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <div className="w-full max-w-md p-8 bg-white/95 dark:bg-slate-800/95 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-6">
                    <img src="/ST_Logo.png" alt="StudentTask Logo" className="h-14 w-auto object-contain dark:hidden" />
                    <img src="/ST_Logo_Dark.png" alt="StudentTask Logo" className="h-14 w-auto object-contain hidden dark:block" />
                    <h2 className="mt-3 text-2xl font-bold text-center text-gray-900 dark:text-white">
                        Buat Akun Baru
                    </h2>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Nama Lengkap"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="mahasiswa@kampus.ac.id"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            placeholder="Min. 8 karakter"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    Sudah punya akun? <Link to="/login" className="text-indigo-600 hover:underline">Login di sini</Link>
                </p>
            </div>
        </div>
    );
}