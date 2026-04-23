import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import Swal from 'sweetalert2';

export default function CalendarPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const tasksByDate = useMemo(() => {
        const map = new Map();
        tasks.forEach(task => {
            const dateKey = task.deadline;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey).push(task);
        });
        return map;
    }, [tasks]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOffset = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOffset = getFirstDayOffset(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const prevMonthDate = new Date(year, month, 0);
        const daysInPrevMonth = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
        const calendarDays = [];

        for (let i = firstDayOffset - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, daysInPrevMonth - i);
            calendarDays.push({
                date,
                isCurrentMonth: false,
                tasks: tasksByDate.get(date.toISOString().slice(0, 10)) || []
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            calendarDays.push({
                date,
                isCurrentMonth: true,
                tasks: tasksByDate.get(date.toISOString().slice(0, 10)) || []
            });
        }

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

    // SweetAlert2 untuk detail tugas
    const handleTaskClick = (task) => {
        Swal.fire({
            title: task.title,
            html: `
                <div class="text-left">
                    <p class="mb-2"><strong>📚 Mata Kuliah:</strong> ${task.subject?.name || task.subject || '-'}</p>
                    <p class="mb-2"><strong>📅 Deadline:</strong> ${task.deadline}</p>
                    <p class="mb-2"><strong>⚡ Prioritas:</strong> 
                        <span class="px-2 py-1 rounded-full text-xs font-bold ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}">
                            ${task.priority.toUpperCase()}
                        </span>
                    </p>
                    <p class="mb-2"><strong>📌 Status:</strong> 
                        <span class="px-2 py-1 rounded-full text-xs font-bold ${task.status === 'done' ? 'bg-green-100 text-green-700' : task.status === 'progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}">
                            ${task.status === 'done' ? 'SELESAI' : task.status === 'progress' ? 'PROGRESS' : 'PENDING'}
                        </span>
                    </p>
                    <p><strong>📝 Deskripsi:</strong><br>${task.description || 'Tidak ada deskripsi'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Tutup',
            background: '#fff',
            backdrop: true,
            customClass: {
                popup: 'rounded-2xl shadow-xl',
                title: 'text-lg font-bold text-slate-800',
                confirmButton: 'px-4 py-2 rounded-lg font-semibold'
            }
        });
    };

    // Warna badge tugas berdasarkan status & prioritas
    const getTaskBadgeStyle = (task) => {
        if (task.status === 'done') return 'bg-gray-400 dark:bg-gray-600 text-white line-through';
        switch (task.priority) {
            case 'high': return 'bg-rose-500 text-white';
            case 'medium': return 'bg-amber-400 text-amber-900';
            default: return 'bg-emerald-500 text-white';
        }
    };

    // Ikon kecil untuk deadine mendekati
    const getDeadlineIcon = (task) => {
        if (task.status === 'done') return <CheckCircle size={12} className="inline mr-1" />;
        const today = new Date();
        const deadlineDate = new Date(task.deadline);
        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2 && diffDays >= 0) return <AlertCircle size={12} className="inline mr-1 text-red-500" />;
        return <Clock size={12} className="inline mr-1" />;
    };

    const monthYear = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return (
        <div className="space-y-6">
            {/* Header Halaman dengan efek glass */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Kalender Deadline</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pantau jadwal pengumpulan tugas kamu di sini</p>
                </div>
            </div>

            {/* Kalender Grid dengan desain modern */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Navigasi Bulan dengan efek glass */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm">
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{monthYear}</h3>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm">
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                {/* Header Hari */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 p-4 pb-0">
                    {weekdays.map(day => (
                        <div key={day} className="text-center font-semibold text-sm text-slate-500 dark:text-slate-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Tanggal dengan efek card */}
                {loading ? (
                    <div className="flex justify-center items-center h-96 text-slate-500">Memuat kalender...</div>
                ) : (
                    <div className="grid grid-cols-7 gap-1 md:gap-2 p-4 pt-0">
                        {calendarDays.map((day, idx) => {
                            const isTodayFlag = isToday(day.date);
                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[110px] p-2 rounded-xl transition-all duration-200 group ${
                                        isTodayFlag
                                            ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-500/20 dark:to-indigo-600/10 border-2 border-indigo-400 dark:border-indigo-500 shadow-md'
                                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.02]'
                                    } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span
                                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                                                isTodayFlag
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                                    : 'text-slate-700 dark:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'
                                            }`}
                                        >
                                            {day.date.getDate()}
                                        </span>
                                        {day.tasks.length > 0 && (
                                            <span className="text-xs font-bold text-white bg-indigo-500 rounded-full px-1.5 py-0.5 shadow-sm">
                                                {day.tasks.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Task Pills dengan efek hover */}
                                    <div className="mt-2 space-y-1 max-h-16 overflow-y-auto scrollbar-thin">
                                        {day.tasks.slice(0, 2).map((task, tIdx) => (
                                            <div
                                                key={tIdx}
                                                onClick={() => handleTaskClick(task)}
                                                className={`w-full truncate rounded-md px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-90 transition-all flex items-center gap-1 ${getTaskBadgeStyle(task)}`}
                                                title={task.title}
                                            >
                                                {getDeadlineIcon(task)}
                                                <span className="truncate">{task.title}</span>
                                            </div>
                                        ))}
                                        {day.tasks.length > 2 && (
                                            <div className="text-xs text-slate-400 dark:text-slate-500 pl-1 italic">
                                                +{day.tasks.length - 2} lainnya
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tombol Hari Ini dengan efek modern */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex justify-center">
                    <button
                        onClick={goToToday}
                        className="px-5 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                    >
                         Hari Ini
                    </button>
                </div>
            </div>
        </div>
    );
}