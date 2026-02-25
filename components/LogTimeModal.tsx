
import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { CLIENTS, PROJECTS, CATEGORIES } from '../constants';
import { calculateDuration } from '../utils/timeUtils';

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  initialData?: {
    user?: string;
    date?: string;
  };
}

const LogTimeModal: React.FC<LogTimeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    fecha: initialData?.date || new Date().toISOString().split('T')[0],
    cliente: initialData?.user || '',
    proyecto: '',
    descripcion: '',
    categoria: TaskCategory.Desarrollo,
    hora_inicio: '09:00',
    hora_fin: '17:00',
    etiquetas: [] as string[],
    estado: 'Done' as TaskStatus
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        cliente: initialData.user || prev.cliente,
        fecha: initialData.date || prev.fecha
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(formData.hora_inicio, formData.hora_fin);
    onSave({
      ...formData,
      total_horas: duration
    });
    onClose();
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 text-[11px] font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white";
  const labelClass = "text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Compacto */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase">Log Work</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>User</label>
              <select 
                value={formData.cliente} 
                onChange={e => setFormData({...formData, cliente: e.target.value, proyecto: ''})}
                className={inputClass}
                required
              >
                <option value="">Select User...</option>
                {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Date</label>
              <input 
                type="date" 
                value={formData.fecha} 
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Project</label>
            <select 
              value={formData.proyecto} 
              onChange={e => setFormData({...formData, proyecto: e.target.value})}
              className={inputClass}
              required
              disabled={!formData.cliente}
            >
              <option value="">Select project...</option>
              {formData.cliente && PROJECTS[formData.cliente]?.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Start Time</label>
              <input 
                type="time" 
                value={formData.hora_inicio} 
                onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>End Time</label>
              <input 
                type="time" 
                value={formData.hora_fin} 
                onChange={e => setFormData({...formData, hora_fin: e.target.value})}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Work Description</label>
            <textarea 
              rows={2}
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              className={`${inputClass} resize-none`}
              placeholder="What have you worked on?"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">Cancel</button>
            <button type="submit" className="bg-correo-blue text-white px-6 py-1.5 rounded text-[11px] font-bold hover:bg-correo-blue-light transition-colors">Confirm log</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogTimeModal;
