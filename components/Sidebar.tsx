
import React from 'react';
import { LayoutDashboard, ClipboardList, BarChart3, Settings, LogOut, User, Cpu, Plus, MessageSquare, Zap } from 'lucide-react';
import { ViewType, UserSettings } from '../types';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/unnamed.png';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userSettings?: UserSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userSettings }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Panel Operativo', icon: LayoutDashboard },
    { id: 'registro', label: 'Carga de Tareas', icon: ClipboardList },
    { id: 'comunicaciones', label: 'Comunicaciones', icon: MessageSquare },
    { id: 'reportes', label: 'Reportes / IA', icon: BarChart3 },
    { id: 'automatizacion', label: 'Automatización', icon: Zap },
    { id: 'monitoreo', label: 'API Control', icon: Cpu },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 transition-colors duration-300 z-50 overflow-y-auto scrollbar-hide">
      <div className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-correo-yellow p-4 rounded-3xl flex items-center justify-center shadow-lg shadow-correo-yellow/20">
                   <img 
  src={logo} 
  alt="Correo Logo" 
  className="w-16 h-16"
/>
          </div>
          <div className="space-y-0">
            <h1 className="text-xl font-black text-correo-blue dark:text-correo-yellow tracking-tighter uppercase leading-none">
              TAREAS DEL
            </h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              CORREO ARGENTINO
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <button 
          onClick={() => onViewChange('registro')}
          className="w-full flex items-center justify-center gap-3 py-4 bg-correo-blue text-correo-yellow rounded-[2rem] shadow-xl shadow-correo-blue/20 hover:bg-correo-blue-light transition-all group border-2 border-transparent hover:border-correo-yellow/30"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="text-xs font-black uppercase tracking-widest">Nueva Tarea</span>
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              currentView === item.id 
                ? 'bg-correo-blue text-correo-yellow shadow-xl shadow-correo-blue/20 font-bold translate-x-1' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-correo-yellow/10 dark:hover:bg-correo-yellow/5 hover:text-correo-blue dark:hover:text-correo-yellow'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-correo-yellow' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className="text-[11px] uppercase tracking-wide font-black">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile Summary - Actualizado para coincidir con la imagen de referencia */}
      {userSettings && (
        <div className="px-6 mb-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-[1.2rem] bg-correo-yellow flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border-2 border-white dark:border-slate-700">
              {userSettings.avatarUrl ? (
                <img src={userSettings.avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-correo-blue" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-correo-blue dark:text-white uppercase tracking-tight truncate leading-tight">
                {userSettings.displayName || 'Personal'}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.15em] truncate mt-0.5">
                {userSettings.role}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Desconectar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
