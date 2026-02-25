
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CLIENTS, PROJECTS, CATEGORIES, STATUS_OPTIONS } from '../constants';
import { Task, TaskCategory, TaskStatus } from '../types';
import { 
  PlusCircle, CheckCircle2, Clock, Calendar, 
  ChevronDown, MapPin, Briefcase, Tag, 
  Activity, Search, Check, User, Target, Layers,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { calculateDuration } from '../utils/timeUtils';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const getTodayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    fecha: getTodayLocal(),
    cliente: '',
    proyecto: '',
    descripcion: '',
    categoria: TaskCategory.Desarrollo,
    hora_inicio: '08:00',
    hora_fin: '09:00',
    etiquetas: '',
    estado: 'Backlog' as TaskStatus
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const clientRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startPickerRef = useRef<HTMLDivElement>(null);
  const endPickerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown === 'cliente' && clientRef.current && !clientRef.current.contains(event.target as Node)) setOpenDropdown(null);
      if (openDropdown === 'proyecto' && projectRef.current && !projectRef.current.contains(event.target as Node)) setOpenDropdown(null);
      if (openDropdown === 'categoria' && categoryRef.current && !categoryRef.current.contains(event.target as Node)) setOpenDropdown(null);
      if (openDropdown === 'estado' && statusRef.current && !statusRef.current.contains(event.target as Node)) setOpenDropdown(null);
      if (openDropdown === 'hora_inicio' && startPickerRef.current && !startPickerRef.current.contains(event.target as Node)) setOpenDropdown(null);
      if (openDropdown === 'hora_fin' && endPickerRef.current && !endPickerRef.current.contains(event.target as Node)) setOpenDropdown(null);
      if (openDropdown === 'fecha' && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.cliente) newErrors.cliente = 'Requerido';
    if (!formData.proyecto) newErrors.proyecto = 'Requerido';
    if (!formData.descripcion) newErrors.descripcion = 'Requerido';
    if (calculateDuration(formData.hora_inicio, formData.hora_fin) <= 0) newErrors.hora = 'Inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const tags = formData.etiquetas.split(',').map(tag => tag.trim()).filter(t => t !== '');
      
      // ✅ CORRECCIÓN CLAVE: Generar ID único real para evitar el error de consola
      const taskWithId: Task = {
        ...formData,
        id: crypto.randomUUID(), // Genera un ID como "550e8400-e29b..."
        total_horas: calculateDuration(formData.hora_inicio, formData.hora_fin),
        etiquetas: tags
      };

      onAddTask(taskWithId);
      
      // Resetear campos manteniendo fecha y cliente para carga masiva
      setFormData(prev => ({ ...prev, descripcion: '', etiquetas: '', estado: 'Backlog' }));
      setErrors({});
    }
  };

  const labelClass = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] ml-6 mb-2 block";
  const customSelectClass = (isOpen: boolean, error?: string) => `
    w-full flex items-center justify-between px-8 py-5 rounded-[1.8rem] text-sm font-bold transition-all h-[64px]
    ${isOpen ? 'bg-white dark:bg-slate-800 border-2 border-correo-yellow ring-4 ring-correo-yellow/10' : 'bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent hover:bg-white dark:hover:bg-slate-800'}
    ${error ? 'border-red-500/50 bg-red-50/30' : ''}
    dark:text-white outline-none cursor-pointer shadow-sm
  `;

  // --- CUSTOM DATE PICKER COMPONENT ---
  const DatePicker = ({ value, onChange, isOpen, onToggle }: { 
    value: string, 
    onChange: (val: string) => void, 
    isOpen: boolean, 
    onToggle: () => void 
  }) => {
    const [viewDate, setViewDate] = useState(new Date(value + 'T00:00:00'));
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const days = useMemo(() => {
      const daysCount = new Date(year, month + 1, 0).getDate();
      let firstDay = new Date(year, month, 1).getDay() - 1; // Lunes = 0
      if (firstDay === -1) firstDay = 6;

      const result = [];
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDay - 1; i >= 0; i--) {
        result.push({ day: prevMonthLastDay - i, current: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
      }
      for (let i = 1; i <= daysCount; i++) {
        result.push({ day: i, current: true, date: new Date(year, month, i) });
      }
      const remaining = 42 - result.length;
      for (let i = 1; i <= remaining; i++) {
        result.push({ day: i, current: false, date: new Date(year, month + 1, i) });
      }
      return result;
    }, [year, month]);

    const formattedDisplay = new Date(value + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const monthName = viewDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    return (
      <div className="relative" ref={datePickerRef}>
        <div onClick={onToggle} className={customSelectClass(isOpen)}>
          <div className="flex items-center gap-3">
            <span className="text-correo-blue dark:text-white">{formattedDisplay}</span>
          </div>
          <Calendar className={`w-5 h-5 transition-colors ${isOpen ? 'text-correo-yellow' : 'text-slate-300'}`} />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-[320px] mt-3 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-3xl z-[80] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
              <button type="button" className="flex items-center gap-1 text-sm font-black text-slate-800 dark:text-white capitalize tracking-tight hover:text-correo-blue transition-colors">
                {monthName} <ChevronDown className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-7 mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <div key={d} className="text-center py-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</span></div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((item, i) => {
                  const isSelected = value === item.date.toISOString().split('T')[0];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onChange(item.date.toISOString().split('T')[0]);
                        onToggle();
                      }}
                      className={`h-10 w-10 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-correo-blue text-white shadow-lg ring-2 ring-correo-blue ring-offset-2' 
                          : item.current 
                            ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700' 
                            : 'text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-700 flex justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <button 
                type="button" 
                onClick={() => onChange('')} 
                className="text-xs font-black text-blue-500 hover:underline uppercase tracking-widest"
              >
                Borrar
              </button>
              <button 
                type="button" 
                onClick={() => { onChange(getTodayLocal()); onToggle(); }} 
                className="text-xs font-black text-blue-500 hover:underline uppercase tracking-widest"
              >
                Hoy
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- CUSTOM TIME PICKER COMPONENT ---
  const TimePicker = ({ value, onChange, isOpen, onToggle, error, label }: { 
    value: string, onChange: (val: string) => void, isOpen: boolean, onToggle: () => void, error?: string, label: string
  }) => {
    const [h, m] = value.split(':');
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
    return (
      <div className="relative">
        <div onClick={onToggle} className={customSelectClass(isOpen, error)}>
          <div className="flex items-center gap-3"><Clock className={`w-4 h-4 ${isOpen ? 'text-correo-yellow' : 'text-slate-300'}`} /><span className="text-correo-blue dark:text-white">{value}</span></div>
          <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${isOpen ? 'rotate-180 text-correo-yellow' : ''}`} />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 w-64 mt-3 bg-white dark:bg-slate-800 rounded-[2.2rem] border-2 border-correo-yellow shadow-3xl z-[70] overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"><p className="text-[10px] font-black text-correo-blue dark:text-correo-yellow uppercase tracking-widest text-center">{label}</p></div>
            <div className="flex h-64">
              <div className="flex-1 overflow-y-auto scrollbar-hide py-2 border-r border-slate-100 dark:border-slate-700">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Hora</p>
                {hours.map(hour => (
                  <button key={hour} type="button" onClick={() => onChange(`${hour}:${m}`)} className={`w-full py-3 text-xs font-black transition-colors ${h === hour ? 'bg-correo-blue text-correo-yellow' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{hour}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Min</p>
                {minutes.map(min => (
                  <button key={min} type="button" onClick={() => onChange(`${h}:${min}`)} className={`w-full py-3 text-xs font-black transition-colors ${m === min ? 'bg-correo-blue text-correo-yellow' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{min}</button>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-center"><button type="button" onClick={onToggle} className="text-[9px] font-black text-correo-blue dark:text-correo-yellow uppercase tracking-widest hover:underline">Cerrar</button></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-8 mb-16">
        <div className="bg-correo-blue p-5 rounded-[2.2rem] shadow-2xl shadow-correo-blue/20 rotate-3"><PlusCircle className="w-10 h-10 text-correo-yellow" /></div>
        <div><h2 className="text-5xl font-black text-correo-blue dark:text-white uppercase tracking-tighter italic leading-none">Carga de Operaciones</h2><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Terminal de registro de actividad técnica</p></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Fecha (Custom) */}
          <div className="lg:col-span-3">
            <label className={labelClass}>Fecha de Operación</label>
            <DatePicker 
              value={formData.fecha} 
              onChange={(val) => setFormData({ ...formData, fecha: val })}
              isOpen={openDropdown === 'fecha'}
              onToggle={() => setOpenDropdown(openDropdown === 'fecha' ? null : 'fecha')}
            />
          </div>

          {/* Cliente / Destino */}
          <div className="lg:col-span-4" ref={clientRef}>
            <label className={labelClass}>Destino / Cliente</label>
            <div className="relative">
              <div onClick={() => setOpenDropdown(openDropdown === 'cliente' ? null : 'cliente')} className={customSelectClass(openDropdown === 'cliente', errors.cliente)}>
                <div className="flex items-center gap-3 truncate"><User className={`w-4 h-4 ${formData.cliente ? 'text-correo-yellow' : 'text-slate-300'}`} /><span className={formData.cliente ? 'text-correo-blue dark:text-white' : 'text-slate-400'}>{formData.cliente || 'Seleccionar Responsable...'}</span></div>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'cliente' ? 'rotate-180 text-correo-yellow' : ''}`} />
              </div>
              {openDropdown === 'cliente' && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-800 rounded-[2.2rem] border-2 border-correo-yellow shadow-3xl z-[60] overflow-hidden">
                  <div className="py-3">
                    {CLIENTS.map(c => (
                      <button key={c} type="button" onClick={() => { setFormData({ ...formData, cliente: c, proyecto: '' }); setOpenDropdown(null); }} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className={`text-xs font-black uppercase tracking-widest ${formData.cliente === c ? 'text-correo-blue' : 'text-slate-500'}`}>{c}</span>{formData.cliente === c && <Check className="w-4 h-4 text-correo-yellow" />}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Proyecto */}
          <div className="lg:col-span-5" ref={projectRef}>
            <label className={labelClass}>Proyecto Asignado</label>
            <div className="relative">
              <div onClick={() => formData.cliente && setOpenDropdown(openDropdown === 'proyecto' ? null : 'proyecto')} className={`${customSelectClass(openDropdown === 'proyecto', errors.proyecto)} ${!formData.cliente ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <div className="flex items-center gap-3 truncate"><Briefcase className={`w-4 h-4 ${formData.proyecto ? 'text-correo-yellow' : 'text-slate-300'}`} /><span className={formData.proyecto ? 'text-correo-blue dark:text-white' : 'text-slate-400'}>{formData.proyecto || 'Seleccionar Proyecto...'}</span></div>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'proyecto' ? 'rotate-180 text-correo-yellow' : ''}`} />
              </div>
              {openDropdown === 'proyecto' && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-800 rounded-[2.2rem] border-2 border-correo-yellow shadow-3xl z-[60] overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto py-3">
                    {PROJECTS[formData.cliente]?.map(p => (
                      <button key={p} type="button" onClick={() => { setFormData({ ...formData, proyecto: p }); setOpenDropdown(null); }} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className={`text-xs font-black uppercase tracking-widest ${formData.proyecto === p ? 'text-correo-blue' : 'text-slate-500'}`}>{p}</span>{formData.proyecto === p && <Check className="w-4 h-4 text-correo-yellow" />}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="lg:col-span-3" ref={categoryRef}>
            <label className={labelClass}>Tipo de Servicio</label>
            <div className="relative">
              <div onClick={() => setOpenDropdown(openDropdown === 'categoria' ? null : 'categoria')} className={customSelectClass(openDropdown === 'categoria')}>
                <div className="flex items-center gap-3"><Layers className="w-4 h-4 text-correo-yellow" /><span className="text-correo-blue dark:text-white">{formData.categoria}</span></div>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'categoria' ? 'rotate-180 text-correo-yellow' : ''}`} />
              </div>
              {openDropdown === 'categoria' && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-800 rounded-[2.2rem] border-2 border-correo-yellow shadow-3xl z-[60] overflow-hidden">
                  <div className="py-2">
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => { setFormData({ ...formData, categoria: c }); setOpenDropdown(null); }} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className={`text-[10px] font-black uppercase tracking-widest ${formData.categoria === c ? 'text-correo-blue' : 'text-slate-500'}`}>{c}</span>{formData.categoria === c && <Check className="w-4 h-4 text-correo-yellow" />}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado Inicial */}
          <div className="lg:col-span-3" ref={statusRef}>
            <label className={labelClass}>Estado del Item</label>
            <div className="relative">
              <div onClick={() => setOpenDropdown(openDropdown === 'estado' ? null : 'estado')} className={customSelectClass(openDropdown === 'estado')}>
                <div className="flex items-center gap-3"><Activity className="w-4 h-4 text-correo-yellow" /><span className="text-correo-blue dark:text-white">{formData.estado}</span></div>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${openDropdown === 'estado' ? 'rotate-180 text-correo-yellow' : ''}`} />
              </div>
              {openDropdown === 'estado' && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-800 rounded-[2.2rem] border-2 border-correo-yellow shadow-3xl z-[60] overflow-hidden">
                  <div className="py-2">
                    {STATUS_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => { setFormData({ ...formData, estado: s }); setOpenDropdown(null); }} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><span className={`text-[10px] font-black uppercase tracking-widest ${formData.estado === s ? 'text-correo-blue' : 'text-slate-500'}`}>{s}</span>{formData.estado === s && <Check className="w-4 h-4 text-correo-yellow" />}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hora Inicio */}
          <div className="lg:col-span-3" ref={startPickerRef}>
            <label className={labelClass}>Hora Entrada</label>
            <TimePicker label="Entrada Operativa" value={formData.hora_inicio} onChange={(val) => setFormData({ ...formData, hora_inicio: val })} isOpen={openDropdown === 'hora_inicio'} onToggle={() => setOpenDropdown(openDropdown === 'hora_inicio' ? null : 'hora_inicio')} error={errors.hora} />
          </div>

          {/* Hora Fin */}
          <div className="lg:col-span-3" ref={endPickerRef}>
            <label className={labelClass}>Hora Salida</label>
            <TimePicker label="Salida Operativa" value={formData.hora_fin} onChange={(val) => setFormData({ ...formData, hora_fin: val })} isOpen={openDropdown === 'hora_fin'} onToggle={() => setOpenDropdown(openDropdown === 'hora_fin' ? null : 'hora_fin')} error={errors.hora} />
          </div>

          {/* Descripción */}
          <div className="lg:col-span-12">
            <label className={labelClass}>Resumen de Tareas / Hitos Alcanzados</label>
            <textarea rows={4} value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Escriba el detalle técnico del bloque de tiempo trabajado..." className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-correo-yellow focus:bg-white dark:focus:bg-slate-800 rounded-[2.5rem] px-10 py-8 dark:text-white resize-none outline-none transition-all text-sm font-medium placeholder:text-slate-300 shadow-sm" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-10">
          <button type="submit" className="flex items-center justify-center gap-5 bg-correo-blue text-correo-yellow font-black px-24 py-7 rounded-[3rem] hover:bg-correo-blue-light hover:-translate-y-1 active:scale-95 transition-all shadow-[0_25px_60px_-15px_rgba(0,32,91,0.3)] uppercase tracking-[0.25em] text-sm group"><CheckCircle2 className="w-7 h-7 group-hover:rotate-12 transition-transform" />Confirmar Registro Operativo</button>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Los registros son auditados por el sistema de Gestión de Tiempos CA</p>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
