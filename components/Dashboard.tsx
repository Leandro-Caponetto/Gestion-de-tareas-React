
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, UserSettings } from '../types';
import { 
  Search, Share2, Maximize2, Globe, 
  BarChart2, Calendar, List, Layout, Clock, 
  Target, MoreHorizontal, Users, ExternalLink,
  Table as TableIcon, CalendarDays, Minimize2, Sparkles, Filter as FilterIcon,
  TestTube2, Plus
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import DashboardSummary from './DashboardSummary';
import CalendarView from './CalendarView';
import TimelineView from './TimelineView';
import ShareModal from './ShareModal';
import TodayStatsPopup from './TodayStatsPopup';
import ExecutiveAudit from './ExecutiveAudit';
import ListView from './ListView';
import Goals from './Goals';
import TimesheetView from './TimesheetView';
import TestingBoard from './TestingBoard';
import { TEAM_MEMBERS } from '../constants';

interface DashboardProps {
  tasks: Task[];
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
  onAddTask?: (task: Omit<Task, 'id'>) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  userSettings?: UserSettings;
  onViewChange?: (view: any) => void;
}

type TimeRangeFilter = 'today' | 'month' | 'all';

const AvatarStack = ({ userSettings }: { userSettings?: UserSettings }) => {
  return (
    <div className="flex -space-x-2 items-center ml-4 group/stack">
      <div className="relative transition-all duration-300 hover:z-20 hover:scale-110">
        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200 shadow-sm">
          {userSettings?.avatarUrl ? (
            <img src={userSettings.avatarUrl} alt="User" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-correo-blue text-white text-[8px] font-black">
              {userSettings?.displayName?.slice(0, 2).toUpperCase() || 'ME'}
            </div>
          )}
        </div>
      </div>
      {TEAM_MEMBERS.slice(0, 4).map((member) => (
        <div key={member.id} className="relative transition-all duration-300 hover:z-20 hover:scale-110">
          <div className={`w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 ${member.color} flex items-center justify-center text-[8px] font-black text-white shadow-sm`}>
            {member.initial}
          </div>
        </div>
      ))}
      <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500 shadow-sm">
        +3
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ tasks, onStatusChange, onAddTask, onEditTask, onDeleteTask, userSettings, onViewChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('timesheet');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all'); 
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const currentMonthStr = useMemo(() => getLocalDateString(new Date()).slice(0, 7), []);

  const currentDateDisplay = useMemo(() => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date());
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskDate = t.fecha.trim();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = t.proyecto.toLowerCase().includes(searchLower) ||
                            t.descripcion.toLowerCase().includes(searchLower) ||
                            t.cliente.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
      if (timeRange === 'today') return taskDate === todayStr;
      if (timeRange === 'month') return taskDate.startsWith(currentMonthStr);
      return true;
    });
  }, [tasks, searchTerm, timeRange, todayStr, currentMonthStr]);

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Globe },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'kanban', label: 'Kanban board', icon: Layout },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'list', label: 'List', icon: List },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'timesheet', label: 'Timesheet', icon: Sparkles, premium: true },
    { id: 'testing', label: 'Testing Board', icon: TestTube2 },
  ];

  return (
    <div className="flex flex-col gap-0 -mt-2 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between py-1 px-1 border-b border-slate-100 dark:border-slate-800/50 mb-2">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
            <span>Spaces</span>
            <span className="opacity-50">/</span>
            <span>Equipo Middleware</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
            <CalendarDays className="w-3.5 h-3.5 text-correo-blue dark:text-correo-yellow" />
            <span className="text-[10px] font-black text-correo-blue dark:text-correo-yellow uppercase tracking-widest whitespace-nowrap">
              {currentDateDisplay}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button onClick={() => setIsShareModalOpen(true)} className="p-1.5 text-slate-400 hover:text-correo-blue rounded transition-colors"><Share2 className="w-4 h-4" /></button>
            <button onClick={toggleFullscreen} className="p-1.5 text-slate-400 hover:text-correo-blue rounded transition-colors">{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 py-2 px-1 mb-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Tablero PMDDW</h2>
          <AvatarStack userSettings={userSettings} />
        </div>
        <div className="flex-1" />
        <a href="https://comunidad.correoargentino.com.ar/login" target="_blank" className="flex items-center gap-2 text-[10px] font-bold text-correo-blue dark:text-correo-yellow hover:underline group"><ExternalLink className="w-3.5 h-3.5" /> Comunidad</a>
      </div>

      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-5 overflow-x-auto scrollbar-hide mb-4">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-1.5 py-2 px-1 text-[11px] font-bold uppercase tracking-wide transition-all relative border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-correo-blue dark:text-blue-400 border-correo-blue dark:border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${tab.premium ? 'text-orange-500' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'testing' && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold text-slate-600 h-[36px] hover:bg-slate-50 transition-colors shadow-sm">
            <FilterIcon className="w-3.5 h-3.5 text-slate-400" /> Filter
          </button>
          
          <div className="relative w-full md:w-64 h-[36px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-full pl-9 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[11px] outline-none dark:text-white focus:border-blue-500 transition-all shadow-sm" 
            />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full p-1 shadow-sm h-[40px]">
              {(['today', 'month', 'all'] as const).map(r => (
                 <button 
                   key={r} 
                   onClick={() => setTimeRange(r)} 
                   className={`px-4 h-full text-[9px] font-black uppercase tracking-widest rounded-full transition-all ${timeRange === r ? 'bg-correo-blue text-correo-yellow' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {r === 'today' ? 'Hoy' : r === 'month' ? 'Mes' : 'Todas'}
                 </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsStatsOpen(true)} 
              className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-500 hover:text-correo-blue transition-all h-[40px] w-[40px] flex items-center justify-center shadow-sm"
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            <button 
              onClick={() => onViewChange?.('registro')}
              className="flex items-center gap-2 px-4 py-1.5 bg-correo-blue text-correo-yellow rounded-lg text-[10px] font-black uppercase tracking-widest h-[40px] hover:bg-correo-blue-light transition-all shadow-lg shadow-correo-blue/20"
            >
              <Plus className="w-4 h-4" />
              Nueva Tarea
            </button>
          </div>
        </div>
      )}

      <div className="mt-1 min-h-[400px]">
        {activeTab === 'summary' && <DashboardSummary tasks={filteredTasks} />}
        {activeTab === 'kanban' && <KanbanBoard tasks={filteredTasks} onStatusChange={onStatusChange} onAddTask={onAddTask} onEditTask={onEditTask} onDeleteTask={onDeleteTask} userSettings={userSettings} onViewChange={onViewChange} />}
        {activeTab === 'calendar' && <CalendarView tasks={filteredTasks} />}
        {activeTab === 'timeline' && <TimelineView tasks={filteredTasks} />}
        {activeTab === 'reports' && <ExecutiveAudit tasks={tasks} />}
        {activeTab === 'list' && <ListView tasks={filteredTasks} onEditTask={onEditTask} onStatusChange={onStatusChange} />}
        {activeTab === 'goals' && <Goals tasks={tasks} />}
        {activeTab === 'timesheet' && <TimesheetView tasks={tasks} onAddTask={onAddTask || (() => {})} />}
        {activeTab === 'testing' && <TestingBoard />}
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <TodayStatsPopup isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} tasks={tasks} />
    </div>
  );
};

export default Dashboard;
