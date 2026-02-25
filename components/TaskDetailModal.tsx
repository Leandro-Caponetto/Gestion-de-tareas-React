
import React, { useState } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { CLIENTS, PROJECTS, CATEGORIES, STATUS_OPTIONS } from '../constants';
import { X, Save, Trash2, Clock, Calendar, Tag, Briefcase, User, Eye } from 'lucide-react';
import { calculateDuration } from '../utils/timeUtils';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (id: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Task>({ ...task });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave({
      ...formData,
      total_horas: calculateDuration(formData.hora_inicio, formData.hora_fin)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-correo-blue/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-correo-yellow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-correo-blue text-correo-yellow">
              {isEditing ? <Briefcase className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-correo-blue uppercase leading-tight">
                {isEditing ? 'Modificar Tarea' : 'Hoja de Servicio'}
              </h3>
              <p className="text-[10px] font-black text-correo-blue/60 uppercase tracking-widest">Reg: {task.id.slice(0, 12).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-correo-blue/50 hover:text-correo-blue transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="px-8 py-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamento</label>
                <select 
                  value={formData.cliente} 
                  onChange={e => setFormData({...formData, cliente: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white font-bold"
                >
                  {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyecto Operativo</label>
                <select 
                  value={formData.proyecto} 
                  onChange={e => setFormData({...formData, proyecto: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white font-bold"
                >
                  {PROJECTS[formData.cliente]?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Operativo</label>
                <select 
                  value={formData.estado} 
                  onChange={e => setFormData({...formData, estado: e.target.value as TaskStatus})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white font-bold"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</label>
                <select 
                  value={formData.categoria} 
                  onChange={e => setFormData({...formData, categoria: e.target.value as TaskCategory})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white font-bold"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio</label>
                <input type="time" value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin</label>
                <input type="time" value={formData.hora_fin} onChange={e => setFormData({...formData, hora_fin: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white font-bold" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen de Actividad</label>
                <textarea 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 dark:text-white min-h-[120px] font-medium"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <User className="w-5 h-5 text-correo-blue dark:text-correo-yellow mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable / Cliente</p>
                    <p className="text-xl font-black text-correo-blue dark:text-white">{task.cliente}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Briefcase className="w-5 h-5 text-correo-blue dark:text-correo-yellow mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyecto</p>
                    <p className="text-xl font-black text-correo-blue dark:text-white">{task.proyecto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-correo-blue dark:text-correo-yellow mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                    <p className="text-xl font-black text-correo-blue dark:text-white">{task.fecha}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-correo-yellow/10 dark:bg-correo-yellow/5 rounded-3xl border-2 border-correo-yellow/20">
                  <Clock className="w-6 h-6 text-correo-blue dark:text-correo-yellow mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Invertido</p>
                    <p className="text-4xl font-black text-correo-blue dark:text-correo-yellow">{task.total_horas}h</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{task.hora_inicio} a {task.hora_fin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Tag className="w-5 h-5 text-correo-blue dark:text-correo-yellow mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                    <p className="text-lg font-black text-correo-blue dark:text-white uppercase tracking-tighter">{task.estado}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 italic">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detalle del Servicio</p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{task.descripcion}"
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-2 text-red-600 font-black hover:bg-red-50 dark:hover:bg-red-900/20 px-5 py-3 rounded-xl transition-all uppercase text-xs"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar Registro
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              className="px-8 py-3 rounded-xl font-black border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all uppercase text-xs"
            >
              {isEditing ? 'Cancelar' : 'Editar Información'}
            </button>
            {isEditing && (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-correo-blue text-correo-yellow px-10 py-3 rounded-xl font-black shadow-xl shadow-correo-blue/10 hover:bg-correo-blue-light transition-all uppercase text-xs"
              >
                <Save className="w-5 h-5" />
                Actualizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
