
import React, { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { 
  ChevronLeft, ChevronRight, Calendar, MoreHorizontal, 
  Plus, Search, Download, ChevronDown
} from 'lucide-react';
import LogTimeModal from './LogTimeModal';

interface TimesheetViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const TimesheetView: React.FC<TimesheetViewProps> = ({ tasks, onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{user?: string, date?: string}>({});
  
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        day: i + 1,
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        fullDate: date.toISOString().split('T')[0],
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      };
    });
  }, [currentDate]);

  const timesheetData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    TEAM_MEMBERS.forEach(member => { data[member.name] = {}; });
    tasks.forEach(task => {
      if (data[task.cliente]) {
        data[task.cliente][task.fecha] = (data[task.cliente][task.fecha] || 0) + task.total_horas;
      }
    });
    return data;
  }, [tasks]);

  const handleCellClick = (user: string, date: string) => {
    setModalInitialData({ user, date });
    setIsModalOpen(true);
  };

  const formatHours = (hours: number) => {
    if (!hours) return null;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const dateRangeLabel = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)} - ${daysInMonth.length}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear().toString().slice(-2)}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col overflow-hidden text-slate-700 dark:text-slate-300">
      
      {/* Mini Toolbar Compacta */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <div className="px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {dateRangeLabel}
            </div>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-[11px] font-medium">
            <span className="text-slate-400">Group By</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 ml-1">User</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
             <button className="px-3 py-1.5 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center gap-1">Days <ChevronDown className="w-3 h-3" /></button>
             <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><MoreHorizontal className="w-4 h-4" /></button>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="bg-correo-blue text-white px-4 py-1.5 rounded text-[11px] font-bold hover:bg-correo-blue-light transition-colors">Log Time</button>
        </div>
      </div>

      {/* Grid Altamente Denso */}
      <div className="flex-1 overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-800 px-4 py-2 border-r border-slate-200 dark:border-slate-700 w-[200px] font-bold text-slate-500">User</th>
              <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-500 text-center w-[80px]">Key</th>
              <th className="px-3 py-2 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-500 text-center w-[80px]">Logged</th>
              {daysInMonth.map(day => (
                <th key={day.day} className={`px-1 py-1 text-center border-r border-slate-200 dark:border-slate-700 min-w-[45px] ${day.isWeekend ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <p className={`font-bold ${day.isWeekend ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>{day.day.toString().padStart(2, '0')}</p>
                  <p className={`text-[9px] font-medium opacity-60 ${day.isWeekend ? 'text-blue-500' : ''}`}>{day.weekday}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {TEAM_MEMBERS.map(member => {
              const userLogs = timesheetData[member.name] || {};
              const totalLogged = Object.values(userLogs).reduce((a, b) => a + b, 0);
              
              return (
                <tr key={member.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group">
                  <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 px-4 py-1.5 border-r border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full ${member.color} flex items-center justify-center text-[8px] font-bold text-white`}>
                        {member.initial}
                      </div>
                      <span className="font-medium truncate">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-center text-slate-400 border-r border-slate-100 dark:border-slate-800">---</td>
                  <td className="px-3 py-1.5 text-center font-bold border-r border-slate-100 dark:border-slate-800">
                    {formatHours(totalLogged) || '0h'}
                  </td>
                  {daysInMonth.map(day => {
                    const hours = userLogs[day.fullDate];
                    return (
                      <td 
                        key={day.day} 
                        onClick={() => handleCellClick(member.name, day.fullDate)}
                        className={`px-0.5 py-1 text-center border-r border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${day.isWeekend ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}
                      >
                        {hours ? (
                          <div className="mx-auto w-[90%] py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                            {formatHours(hours)}
                          </div>
                        ) : (
                          <Plus className="w-3 h-3 mx-auto text-slate-200 opacity-0 group-hover:opacity-100" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Fila Total */}
            <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold">
              <td className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-4 py-2 border-r border-slate-200 dark:border-slate-700">Total</td>
              <td className="px-3 py-2 border-r border-slate-200 dark:border-slate-700"></td>
              <td className="px-3 py-2 border-r border-slate-200 dark:border-slate-700 text-center text-blue-600 dark:text-blue-400">
                {formatHours(Object.values(timesheetData).reduce((acc, user) => acc + Object.values(user).reduce((a, b) => a + b, 0), 0))}
              </td>
              {daysInMonth.map(day => {
                const dayTotal = Object.values(timesheetData).reduce((acc, user) => acc + (user[day.fullDate] || 0), 0);
                return (
                  <td key={day.day} className={`px-1 py-2 text-center border-r border-slate-200 dark:border-slate-700 ${day.isWeekend ? 'bg-blue-50/50' : ''}`}>
                    {dayTotal > 0 ? formatHours(dayTotal) : '0h'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <LogTimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddTask} initialData={modalInitialData} />
      
      {/* Scrollbar Indicator sutil */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800">
         <div className="h-full bg-blue-500/50" style={{ width: '60%' }} />
      </div>
    </div>
  );
};

export default TimesheetView;
