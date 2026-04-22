import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function CalendarPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch semua tugas
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks?all=true');
            setTasks(response.data);
        } catch (error) {
            console.error("Gagal mengambil data kalender", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Kelompokkan tugas berdasarkan deadline (YYYY-MM-DD)
    const tasksByDate = useMemo(() => {
        const map = new Map();
        tasks.forEach(task => {
            const dateKey = task.deadline;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey).push(task);
        });
        return map;
    }, [tasks]);

    // Helper tanggal
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOffset = (year, month) => {
        const day = new Date(year, month, 1).getDay(); // 0 Minggu
        return day === 0 ? 6 : day - 1; // Senin = 0, Minggu = 6
    };

    // Generate grid 6 minggu (42 hari)
    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOffset = getFirstDayOffset(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        
        // Bulan sebelumnya
        const prevMonthDate = new Date(year, month, 0);
        const daysInPrevMonth = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
        
        const calendarDays = [];
        
        // Hari dari bulan sebelumnya
        for (let i = firstDayOffset - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, daysInPrevMonth - i);
            calendarDays.push({
                date,
                isCurrentMonth: false,
                tasks: tasksByDate.get(date.toISOString().slice(0, 10)) || []
            });
        }
        
        // Hari bulan ini
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            calendarDays.push({
                date,
                isCurrentMonth: true,
                tasks: tasksByDate.get(date.toISOString().slice(0, 10)) || []
            });
        }
        
        // Hari bulan depan hingga 42 total
        const remaining = 42 - calendarDays.length;
        for (let d = 1; d <= remaining; d++) {
            const date = new Date(year, month + 1, d);
            calendarDays.push({
                date,
                isCurrentMonth: false,
                tasks: tasksByDate.get(date.toISOString().slice(0, 10)) || []
            });
        }
        
        return calendarDays;
    };
    
    const calendarDays = generateCalendar();
    
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };
    
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    };
    
    const handleTaskClick = (task, e) => {
        e.stopPropagation();
        alert(
            `Judul Tugas: ${task.title}\n` +
            `Mata Kuliah: ${task.subject}\n` +
            `Status: ${task.status.toUpperCase()}\n` +
            `Prioritas: ${task.priority.toUpperCase()}\n` +
            `Deskripsi: ${task.description || 'Tidak ada deskripsi'}`
        );
    };
    
    const getTaskBadgeStyle = (task) => {
        if (task.status === 'done') {
            return 'bg-gray-400 dark:bg-gray-600 text-white';
        }
        switch (task.priority) {
            case 'high': return 'bg-rose-500 text-white';
            case 'medium': return 'bg-amber-400 text-amber-900';
            default: return 'bg-emerald-500 text-white';
        }
    };
    
    const monthYear = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    
    return (
        <div className="space-y-6">
            {/* Header Halaman */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kalender Deadline</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pantau jadwal pengumpulan tugas kamu di sini</p>
                </div>
            </div>
            
            {/* Kalender Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden p-6">
                {/* Navigasi Bulan */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{monthYear}</h3>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
                
                {/* Header Hari */}
                <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
                    {weekdays.map(day => (
                        <div key={day} className="text-center font-semibold text-slate-500 dark:text-slate-400 text-sm pb-2">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Grid Tanggal */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-slate-500">Memuat kalender...</div>
                ) : (
                    <div className="grid grid-cols-7 gap-2 md:gap-4">
                        {calendarDays.map((day, idx) => {
                            const isTodayFlag = isToday(day.date);
                            return (
                                <div 
                                    key={idx}
                                    className={`min-h-[100px] p-2 rounded-2xl transition-colors group ${
                                        isTodayFlag 
                                            ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20' 
                                            : 'border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                                    } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                            isTodayFlag 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                                                : 'text-slate-700 dark:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'
                                        }`}>
                                            {day.date.getDate()}
                                        </span>
                                    </div>
                                    
                                    {/* Task Pills */}
                                    <div className="mt-2 space-y-1">
                                        {day.tasks.slice(0, 2).map((task, tIdx) => (
                                            <div 
                                                key={tIdx}
                                                onClick={(e) => handleTaskClick(task, e)}
                                                className={`w-full truncate rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getTaskBadgeStyle(task)}`}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {day.tasks.length > 2 && (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                                                +{day.tasks.length - 2} lainnya
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Tombol Hari Ini */}
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={goToToday}
                        className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Hari Ini
                    </button>
                </div>
            </div>
        </div>
    );
}