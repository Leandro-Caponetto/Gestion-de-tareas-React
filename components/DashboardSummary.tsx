
import React, { useMemo } from 'react';
import { Task } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface DashboardSummaryProps {
  tasks: Task[];
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ tasks }) => {
  const STATUS_COLORS: Record<string, string> = {
    'Done': '#f59e0b',
    'In Progress': '#0b57d0',
    'To Review': '#a855f7',
    'Backlog': '#4285f4',
    'Testing': '#a855f7',
    'Review': '#3b82f6',
    'Default': '#94a3b8'
  };

  const COLORS_ARRAY = ['#a855f7', '#f59e0b', '#0b57d0', '#4285f4', '#b45309', '#84cc16', '#22d3ee', '#ec4899'];

  const stats = useMemo(() => {
    // Usamos directamente las tareas recibidas (ya filtradas por el Dashboard)
    const total = tasks.length;
    const completed = tasks.filter(t => t.estado === 'Done').length;
    
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.estado] = (acc[task.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

    const categoryData = CATEGORIES.map(cat => ({
      name: cat,
      count: tasks.filter(t => t.categoria === cat).length,
      percentage: total > 0 ? Math.round((tasks.filter(t => t.categoria === cat).length / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const todayStr = new Date().toLocaleDateString('en-CA');
    const createdTodayCount = tasks.filter(t => t.fecha === todayStr).length;

    return { total, completed, statusData, categoryData, createdTodayCount };
  }, [tasks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "completadas", val: stats.completed, color: "text-emerald-500", bg: "bg-emerald-400" },
          { label: "actualizadas", val: stats.total, color: "text-blue-500", bg: "bg-blue-400" },
          { label: "registros hoy", val: stats.createdTodayCount, color: "text-indigo-500", bg: "bg-indigo-400" },
          { label: "en curso", val: stats.statusData.find(d => d.name === 'In Progress')?.value || 0, color: "text-amber-500", bg: "bg-amber-400" },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className={`w-2 h-8 rounded-full ${card.bg}`} />
            <div>
              <span className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{card.val}</span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col min-h-[420px]">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Status overview</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <span>Snapshot del estado de los items según el filtro actual.</span>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative w-64 h-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS_ARRAY[index % COLORS_ARRAY.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">
                  {stats.total}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 text-center px-6 leading-tight uppercase tracking-widest">
                  Items
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full max-h-[280px] overflow-y-auto pr-4 scrollbar-hide">
              <div className="space-y-4">
                {stats.statusData.map((entry, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div 
                      className="w-4 h-4 rounded-[3px] flex-shrink-0 mt-1 shadow-sm transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: STATUS_COLORS[entry.name] || COLORS_ARRAY[i % COLORS_ARRAY.length] }} 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-none uppercase tracking-wide">
                        {entry.name}
                      </span>
                      <span className="text-base font-black text-slate-800 dark:text-white mt-1">
                        {entry.value}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.total === 0 && (
                  <div className="py-20 text-center flex flex-col items-center opacity-20">
                    <Clock className="w-10 h-10 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No hay datos para mostrar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-widest">Priority breakdown</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-10 font-medium italic">Volumen por categoría de servicio.</p>
          
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#00205b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
