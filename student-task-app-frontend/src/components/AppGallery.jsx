// src/components/AppGallery.jsx
import { useContext, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Data gambar (ganti dengan path gambar asli Anda)
const screenshots = [
    {
        id: 1,
        title: 'Beranda Setelah Login',
        description: 'Tampilan utama setelah pengguna login',
        image: '/ST_Beranda_Interface.png',
        alt: 'Beranda setelah login'
    },
    {
        id: 2,
        title: 'Dashboard',
        description: 'Kelola semua tugas dengan mudah',
        image: 'ST_Dashboard_Interface.png',
        alt: 'Dashboard utama'
    },
    {
        id: 3,
        title: 'Form Tambah Tugas',
        description: 'Tambahkan tugas baru dengan cepat',
        image: '/ST_Tambah_Tugas_Baru.png', 
        alt: 'Form tambah tugas'
    },
    {
        id: 4,
        title: 'Halaman Profil',
        description: 'Kelola data diri dan pengaturan',
        image: '/ST_Profil.png',
        alt: 'Halaman profil'
    },
    {
        id: 5,
        title: 'Kalender Deadline',
        description: 'Pantau jadwal pengumpulan tugas',
        image: '/ST_Calendar_Deadline.png',
        alt: 'Kalender deadline'
    },
    {
        id: 6,
        title: 'Notifikasi',
        description: 'Dapatkan pengingat untuk tugas yang mendekati deadline & selelesaikan (Done)',
        image: '/ST_Notifikasi_Deadline.png',
        alt: 'Notifikasi deadline'
    }

];

export default function AppGallery() {
    const { activeTheme } = useContext(AuthContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Reset auto-play setelah 5 detik tidak interaksi
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    // Auto-play setiap 4 detik
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, currentIndex]);

    // Touch handlers untuk swipe mobile
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            // Swipe kiri
            nextSlide();
        }
        if (touchStart - touchEnd < -75) {
            // Swipe kanan
            prevSlide();
        }
        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            {/* Header Section */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
                    Lihat Tampilan Aplikasi
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                    Jelajahi fitur-fitur unggulan StudentTask melalui tampilan langsung
                </p>
            </div>

            {/* Carousel Container */}
            <div className="relative group">
                {/* Main Image */}
                <div 
                    className="relative overflow-hidden rounded-2xl shadow-2xl bg-slate-100 dark:bg-slate-800"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {screenshots.map((screenshot) => (
                            <div key={screenshot.id} className="w-full flex-shrink-0">
                                <div className="relative">
                                    <img
                                        src={screenshot.image}
                                        alt={screenshot.alt}
                                        className="w-full h-auto object-cover rounded-2xl"
                                        onError={(e) => {
                                            // Fallback jika gambar tidak ditemukan
                                            e.target.src = `https://placehold.co/800x500/${activeTheme.primary.replace('#', '')}/white?text=${screenshot.title}`;
                                        }}
                                    />
                                    {/* Overlay caption */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl">
                                        <h3 className="text-white text-xl font-bold mb-1">
                                            {screenshot.title}
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            {screenshot.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        <ChevronLeft size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        <ChevronRight size={24} className="text-slate-700 dark:text-slate-200" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
                        {screenshots.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 ${
                                    currentIndex === index
                                        ? 'w-8 h-2 bg-indigo-600 rounded-full'
                                        : 'w-2 h-2 bg-white/50 hover:bg-white/80 rounded-full'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Thumbnail Preview */}
                <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                    {screenshots.map((screenshot, index) => (
                        <button
                            key={screenshot.id}
                            onClick={() => goToSlide(index)}
                            className={`flex-shrink-0 transition-all duration-300 rounded-lg overflow-hidden border-2 ${
                                currentIndex === index
                                    ? 'border-indigo-600 scale-95'
                                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <img
                                src={screenshot.image}
                                alt={screenshot.title}
                                className="w-16 h-12 object-cover"
                                onError={(e) => {
                                    e.target.src = `https://placehold.co/64x48/${activeTheme.primary.replace('#', '')}/white?text=${screenshot.title.substring(0, 3)}`;
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <span className="text-2xl block mb-1">📱</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Responsif Mobile</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <span className="text-2xl block mb-1">🌙</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Dark Mode</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <span className="text-2xl block mb-1">🔔</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Notifikasi Real-time</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <span className="text-2xl block mb-1">📊</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Statistik Progress</p>
                </div>
            </div>
        </div>
    );
}
