import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axios';

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/verify-otp', { email, otp });
            const resetToken = response.data?.data?.reset_token;
            navigate('/reset-password', { state: { email, resetToken } });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'OTP Tidak Valid',
                text: error?.response?.data?.message || 'OTP salah atau kedaluwarsa.',
            });
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
                    <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Verifikasi OTP</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email akun"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="Kode OTP 6 digit"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? 'Memverifikasi...' : 'Verifikasi'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    Kembali ke <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
