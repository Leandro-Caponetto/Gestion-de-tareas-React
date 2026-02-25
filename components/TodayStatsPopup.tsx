
import React, { useMemo } from 'react';
import { Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
// Fixed lowercase 'zap' to 'Zap' in lucide-react import
import { X, Zap, Clock, Target, BarChart3 } from 'lucide-react';

interface TodayStatsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const TodayStatsPopup: React.FC<TodayStatsPopupProps> = ({ isOpen, onClose, tasks }) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayStats = useMemo(() => {
    const todayTasks = tasks.filter(t => t.fecha === todayStr);
    const totalHours = todayTasks.reduce((acc, t) => acc + t.total_horas, 0);
    
    // Agrupar horas por proyecto
    const projectMap: Record<string, number> = {};
    todayTasks.forEach(t => {
      projectMap[t.proyecto] = (projectMap[t.proyecto] || 0) + t.total_horas;
    });

    const chartData = Object.entries(projectMap).map(([name, value]) => ({
      name: name.length > 12 ? name.substring(0, 10) + '...' : name,
      value
    })).sort((a, b) => b.value - a.value);

    return { totalHours, count: todayTasks.length, chartData };
  }, [tasks, todayStr]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-correo-blue/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-2 border-correo-yellow overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="bg-correo-blue p-3 rounded-2xl shadow-lg">
              <BarChart3 className="w-5 h-5 text-correo-yellow" />
            </div>
            <div>
              <h3 className="text-lg font-black text-correo-blue dark:text-white uppercase tracking-tighter italic leading-none">Status del Día</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Reporte Operativo Hoy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-correo-blue dark:hover:text-correo-yellow transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-correo-blue dark:text-correo-yellow" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inversión</span>
              </div>
              <p className="text-3xl font-black text-correo-blue dark:text-white leading-none">{todayStats.totalHours.toFixed(1)}h</p>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border border-amber-100 dark:border-amber-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tareas</span>
              </div>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">{todayStats.count}</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Carga por Proyecto</span>
              <span className="text-[9px] font-bold text-correo-blue dark:text-correo-yellow bg-correo-blue/5 dark:bg-correo-yellow/10 px-3 py-1 rounded-full uppercase italic">Tiempo Real</span>
            </div>
            
            <div className="h-56 w-full">
              {todayStats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayStats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-correo-blue text-correo-yellow px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-2xl border border-white/10">
                              {payload[0].value} Horas
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={32}>
                      {todayStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#00205b' : '#ffce00'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] opacity-30">
                  <BarChart3 className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sin datos hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Ecosistema TaskPulse • Correo Argentino</p>
        </div>
      </div>
    </div>
  );
};

export default TodayStatsPopup;
