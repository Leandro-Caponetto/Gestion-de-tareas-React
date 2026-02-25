
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { CATEGORIES, STATUS_OPTIONS } from '../constants';
import { 
  Filter, Search, Download, Trash2, Eye, Calendar, Clock, 
  CalendarDays, XCircle, FileSpreadsheet, ChevronDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Database, Check, X, RotateCcw
} from 'lucide-react';

interface RecentActivityProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onExport: (filteredTasks: Task[]) => void;
}

type TimeFilter = 'all' | 'today' | 'specific_day' | 'specific_month';

const RecentActivity: React.FC<RecentActivityProps> = ({ tasks, onDelete, onEdit, onStatusChange, onExport }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all'); // Cambiado a 'all' por defecto
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<string | null>(null);
  
  // Refs for click outside
  const categoryRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const currentMonthStr = todayDate.toISOString().slice(0, 7);
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 8;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setIsCategoryOpen(false);
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) setIsMonthOpen(false);
      if (dayRef.current && !dayRef.current.contains(event.target as Node)) setIsDayOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setActiveStatusDropdownId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesCategory = filterCategory === 'All' || t.categoria === filterCategory;
    const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.proyecto.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTime = true;
    if (timeFilter === 'today') {
      matchesTime = t.fecha === todayStr;
    } else if (timeFilter === 'specific_day') {
      matchesTime = t.fecha === selectedDate;
    } else if (timeFilter === 'specific_month') {
      matchesTime = t.fecha.startsWith(selectedMonth);
    }

    return matchesCategory && matchesSearch && matchesTime;
  });

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, timeFilter, searchTerm, selectedDate, selectedMonth]);

  const getCategoryColor = (cat: TaskCategory) => {
    switch (cat) {
      case TaskCategory.Desarrollo: return 'bg-correo-blue text-white';
      case TaskCategory.QA: return 'bg-amber-500 text-white';
      case TaskCategory.Meeting: return 'bg-correo-yellow text-correo-blue';
      case TaskCategory.Research: return 'bg-slate-800 text-white';
      case TaskCategory.Admin: return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Backlog': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'To Review': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const inputFilterClass = "w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-slate-100 dark:focus:border-slate-700 rounded-[1.8rem] text-xs font-black text-correo-blue dark:text-white transition-all outline-none appearance-none tracking-widest uppercase cursor-pointer flex items-center justify-between group h-[60px]";

  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const monthNamesShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthNamesLong = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const getMonthLabel = (monthVal: string) => {
    const [y, m] = monthVal.split('-');
    return `${monthNamesLong[parseInt(m) - 1].toUpperCase()} DE ${y}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl transition-all overflow-hidden flex flex-col min-h-[750px]">
      <div className="p-12 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-start gap-5">
            <div className="w-3 h-14 bg-correo-yellow rounded-full mt-1"></div>
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-4xl font-black text-correo-blue dark:text-white uppercase tracking-tighter italic leading-none">Actividad Operativa</h3>
                <div className="bg-correo-blue dark:bg-correo-yellow px-4 py-1 rounded-xl shadow-lg border-2 border-white/10 dark:border-correo-blue/20">
                  <span className="text-correo-yellow dark:text-correo-blue text-lg font-black">{filteredTasks.length}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] mt-3 ml-1">
                Terminal de gestión y auditoría de tiempos
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <button 
              onClick={() => onExport(filteredTasks)}
              className="flex items-center justify-center gap-4 bg-correo-blue text-correo-yellow px-12 py-5 rounded-[1.8rem] text-[10px] font-black hover:bg-correo-blue-light hover:-translate-y-1 transition-all shadow-xl shadow-correo-blue/20 uppercase tracking-[0.2em]"
            >
              <Download className="w-5 h-5" />
              Exportar Selección
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Search className="w-3 h-3" /> Búsqueda Global
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="PROYECTO, CLIENTE..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-slate-100 dark:focus:border-slate-700 rounded-[1.8rem] text-xs font-black text-correo-blue dark:text-white transition-all outline-none tracking-widest uppercase h-[60px]"
              />
            </div>
          </div>

          <div className="space-y-3" ref={categoryRef}>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Filter className="w-3 h-3" /> Filtrar por Tipo
            </label>
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={inputFilterClass}
              >
                <span className="truncate">{filterCategory === 'All' ? 'CUALQUIER CATEGORÍA' : filterCategory}</span>
                <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-3xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[300px] overflow-y-auto py-3">
                    {['All', ...CATEGORIES].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setFilterCategory(opt); setIsCategoryOpen(false); }}
                        className={`w-full flex items-center justify-between px-8 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 ${filterCategory === opt ? 'bg-correo-blue/5' : ''}`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${filterCategory === opt ? 'text-correo-blue dark:text-correo-yellow' : 'text-slate-500'}`}>
                          {opt === 'All' ? 'CUALQUIER CATEGORÍA' : opt}
                        </span>
                        {filterCategory === opt && <Check className="w-4 h-4 text-correo-blue dark:text-correo-yellow" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3" ref={monthRef}>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Periodo Mensual
            </label>
            <div className="relative">
              <button
                onClick={() => setIsMonthOpen(!isMonthOpen)}
                className={`${inputFilterClass} ${timeFilter === 'specific_month' ? 'bg-correo-blue/5 border-correo-blue/20' : ''}`}
              >
                <span className="truncate">{getMonthLabel(selectedMonth)}</span>
                <Calendar className={`w-4 h-4 text-slate-300 transition-colors ${timeFilter === 'specific_month' ? 'text-correo-blue' : ''}`} />
              </button>
              {isMonthOpen && (
                <div className="absolute top-full left-0 w-[300px] mt-3 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 shadow-3xl z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setViewYear(y => y - 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                      <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                    <span className="text-sm font-black text-correo-blue dark:text-white">{viewYear}</span>
                    <button onClick={() => setViewYear(y => y + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {monthNamesShort.map((m, idx) => {
                      const monthVal = `${viewYear}-${String(idx + 1).padStart(2, '0')}`;
                      const isSelected = selectedMonth === monthVal;
                      return (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMonth(monthVal);
                            setTimeFilter('specific_month');
                            setIsMonthOpen(false);
                          }}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                            isSelected 
                              ? 'bg-correo-blue text-correo-yellow shadow-lg scale-105' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                    <button onClick={() => { setSelectedMonth(currentMonthStr); setTimeFilter('specific_month'); setIsMonthOpen(false); }} className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[9px] font-black text-correo-blue dark:text-correo-yellow uppercase">Este Mes</button>
                    <button onClick={() => { setTimeFilter('all'); setIsMonthOpen(false); }} className="flex-1 py-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-[9px] font-black text-red-500 uppercase">Borrar</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3" ref={dayRef}>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
              <CalendarDays className="w-3 h-3" /> Fecha Exacta
            </label>
            <div className="relative">
              <button onClick={() => setIsDayOpen(!isDayOpen)} className={`${inputFilterClass} ${timeFilter === 'specific_day' ? 'bg-correo-blue/5 border-correo-blue/20' : ''}`}>
                <span className="truncate">{selectedDate}</span>
                <CalendarDays className={`w-4 h-4 text-slate-300 transition-colors ${timeFilter === 'specific_day' ? 'text-correo-blue' : ''}`} />
              </button>
              {isDayOpen && (
                <div className="absolute top-full right-0 w-full mt-3 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-3xl z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setTimeFilter('specific_day'); setIsDayOpen(false); }} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-correo-blue p-4 rounded-2xl text-xs font-black text-correo-blue dark:text-white outline-none" />
                    <div className="flex gap-2">
                       <button onClick={() => { setSelectedDate(todayStr); setTimeFilter('specific_day'); setIsDayOpen(false); }} className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[9px] font-black text-correo-blue dark:text-correo-yellow uppercase">Hoy</button>
                       <button onClick={() => { setTimeFilter('all'); setIsDayOpen(false); }} className="flex-1 py-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-[9px] font-black text-red-500 uppercase">Limpiar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-10">
          <button onClick={() => setTimeFilter('all')} className={`px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'all' ? 'bg-correo-yellow text-correo-blue shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Historial Completo ({tasks.length})</button>
          <button onClick={() => setTimeFilter('today')} className={`px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'today' ? 'bg-correo-yellow text-correo-blue shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Hoy: {todayStr}</button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">Operación / Proyecto</th>
              <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800 text-center">Inversión</th>
              <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">Estado</th>
              <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentTasks.length > 0 ? currentTasks.map((task) => (
              <tr key={task.id} className="hover:bg-correo-yellow/[0.03] transition-all group">
                <td className="px-12 py-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-base font-black text-correo-blue dark:text-white uppercase leading-none tracking-tight group-hover:translate-x-1 transition-transform">{task.proyecto}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getCategoryColor(task.categoria)}`}>{task.categoria}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{task.cliente} • {task.fecha}</span>
                    </div>
                  </div>
                </td>
                <td className="px-12 py-8 text-center">
                  <div className="inline-flex flex-col items-center px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xl font-black text-correo-blue dark:text-correo-yellow leading-none">{task.total_horas}h</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 opacity-60">{task.hora_inicio}-{task.hora_fin}</span>
                  </div>
                </td>
                <td className="px-12 py-8">
                  {/* CUSTOM STATUS DROPDOWN EN TABLA */}
                  <div className="relative inline-block" ref={activeStatusDropdownId === task.id ? statusRef : null}>
                    <button
                      onClick={() => setActiveStatusDropdownId(activeStatusDropdownId === task.id ? null : task.id)}
                      className={`flex items-center gap-4 px-6 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${getStatusStyle(task.estado)} active:scale-95`}
                    >
                      <span>{task.estado}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeStatusDropdownId === task.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeStatusDropdownId === task.id && (
                      <div className="absolute top-full left-0 w-48 mt-2 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-3xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="py-2">
                          {STATUS_OPTIONS.map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                onStatusChange(task.id, status);
                                setActiveStatusDropdownId(null);
                              }}
                              className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${task.estado === status ? 'bg-correo-blue/5' : ''}`}
                            >
                              <span className={`text-[10px] font-black uppercase tracking-widest ${task.estado === status ? 'text-correo-blue dark:text-correo-yellow' : 'text-slate-500'}`}>
                                {status}
                              </span>
                              {task.estado === status && <Check className="w-3.5 h-3.5 text-correo-blue dark:text-correo-yellow" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-12 py-8 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(task)} className="p-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-correo-blue rounded-xl hover:bg-correo-blue hover:text-correo-yellow transition-all shadow-sm"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(task.id)} className="p-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-12 py-40 text-center text-slate-300 font-black uppercase tracking-[0.5em] italic opacity-20 text-2xl">Sin registros operativos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-12 py-10 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Database className="w-3 h-3 text-correo-yellow" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Auditoría (Total: {filteredTasks.length})</span>
          </div>
          <p className="text-[12px] font-bold text-correo-blue dark:text-white">
            <span className="text-correo-blue-light dark:text-correo-yellow">{indexOfFirstTask + 1}</span> - <span className="text-correo-blue-light dark:text-correo-yellow">{Math.min(indexOfLastTask, filteredTasks.length)}</span> de <span className="text-correo-blue-light dark:text-correo-yellow">{filteredTasks.length}</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 p-1 shadow-sm">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2.5 text-slate-400 hover:text-correo-blue disabled:opacity-20 active:scale-90 transition-all"><ChevronsLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 text-slate-400 hover:text-correo-blue disabled:opacity-20 active:scale-90 transition-all"><ChevronLeft className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-1 px-1">
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-10 h-10 flex items-center justify-center rounded-2xl text-[10px] font-black transition-all ${currentPage === number ? 'bg-correo-blue text-correo-yellow shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{number}</button>
            ))}
          </div>
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 p-1 shadow-sm">
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 text-slate-400 hover:text-correo-blue disabled:opacity-20 active:scale-90 transition-all"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2.5 text-slate-400 hover:text-correo-blue disabled:opacity-20 active:scale-90 transition-all"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="hidden md:flex justify-end"><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-40">TaskPulse Operativo</span></div>
      </div>
    </div>
  );
};

export default RecentActivity;
