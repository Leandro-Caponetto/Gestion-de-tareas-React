
import React, { useState, useRef } from 'react';
import { 
  User, Bell, Shield, Database, Camera, Save, 
  Trash2, Download, Globe, Clock, Moon, Sun, 
  CheckCircle2, LogOut, ShieldCheck, Mail
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSaveSettings: (settings: UserSettings) => void;
  onLogout: () => void;
  email: string;
}

type TabType = 'perfil' | 'preferencias' | 'seguridad' | 'datos';

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  isDarkMode, 
  onToggleDarkMode, 
  onSaveSettings, 
  onLogout,
  email 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [formData, setFormData] = useState<UserSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: User },
    { id: 'preferencias', label: 'Preferencias', icon: Bell },
    { id: 'seguridad', label: 'Seguridad', icon: Shield },
    { id: 'datos', label: 'Mis Datos', icon: Database },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row h-full min-h-[700px]">
        
        {/* Sidebar de Configuración */}
        <div className="lg:w-80 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 p-8 space-y-2">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-correo-blue dark:text-correo-yellow uppercase italic tracking-tighter">Ajustes</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Terminal ID: {formData.employeeId || 'USR-001'}</p>
          </div>
          
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === tab.id 
                  ? 'bg-correo-blue text-correo-yellow shadow-xl shadow-correo-blue/20 translate-x-1' 
                  : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-correo-blue'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}

          <div className="pt-20">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-black text-xs uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              Desconectar
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-10 lg:p-16 relative">
          
          <div className="max-w-3xl mx-auto space-y-12">
            
            {activeTab === 'perfil' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-32 h-32 rounded-[2.5rem] border-4 border-correo-yellow overflow-hidden bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105 shadow-xl">
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-correo-blue text-correo-yellow p-2.5 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
                      <Camera className="w-4 h-4" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-correo-blue dark:text-white uppercase tracking-tighter italic">{formData.displayName || 'Analista de Sistemas'}</h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{email}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                      <span className="px-3 py-1 bg-correo-yellow/20 text-correo-blue dark:text-correo-yellow text-[9px] font-black uppercase rounded-full tracking-widest">Nivel Senior</span>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-full tracking-widest">Activo</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre y Apellido</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-correo-yellow rounded-2xl px-6 py-4 dark:text-white font-bold outline-none transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Analista (CA-Legajo)</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-correo-yellow rounded-2xl px-6 py-4 dark:text-white font-bold outline-none transition-all"
                      placeholder="Ej: CA-882299"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Especialidad Actual</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-correo-yellow rounded-2xl px-6 py-4 dark:text-white font-bold outline-none transition-all"
                      placeholder="Ej: Analista de Sistemas Senior"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferencias' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 gap-6">
                  {/* Tema */}
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent transition-all">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-correo-blue dark:text-correo-yellow">
                        {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-correo-blue dark:text-white uppercase tracking-wide">Visibilidad Nocturna</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Alternar esquema de colores</p>
                      </div>
                    </div>
                    <button 
                      onClick={onToggleDarkMode}
                      className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${isDarkMode ? 'bg-correo-yellow' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Idioma */}
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-correo-blue dark:text-correo-yellow">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-correo-blue dark:text-white uppercase tracking-wide">Idioma del Terminal</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración regional</p>
                      </div>
                    </div>
                    <select 
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest outline-none"
                    >
                      <option value="es">Español (AR)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>

                  {/* Formato Hora */}
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-correo-blue dark:text-correo-yellow">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-correo-blue dark:text-white uppercase tracking-wide">Formato de Tiempo</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Métrica horaria oficial</p>
                      </div>
                    </div>
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border-2 border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={() => setFormData({...formData, timeFormat: '24h'})}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.timeFormat === '24h' ? 'bg-correo-blue text-correo-yellow shadow-md' : 'text-slate-400'}`}
                      >
                        24h
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, timeFormat: '12h'})}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${formData.timeFormat === '12h' ? 'bg-correo-blue text-correo-yellow shadow-md' : 'text-slate-400'}`}
                      >
                        12h
                      </button>
                    </div>
                  </div>

                  {/* Notificaciones */}
                  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-correo-blue dark:text-correo-yellow">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-correo-blue dark:text-white uppercase tracking-wide">Notificaciones Push</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Alertas de registro y sistema</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, notifications: !formData.notifications})}
                      className={`w-16 h-8 rounded-full relative transition-all duration-300 shadow-inner ${formData.notifications ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${formData.notifications ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-8 bg-correo-blue/5 dark:bg-correo-blue/20 rounded-3xl border-2 border-correo-blue/10">
                  <div className="flex items-center gap-4 mb-6">
                    <ShieldCheck className="w-8 h-8 text-correo-blue dark:text-correo-yellow" />
                    <div>
                      <h4 className="text-lg font-black text-correo-blue dark:text-white uppercase tracking-tighter italic">Nivel de Seguridad: ALTO</h4>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Protección de datos corporativos activada</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-transparent hover:border-correo-yellow transition-all">
                      <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-black text-correo-blue dark:text-white uppercase tracking-widest">Cambiar Clave de Acceso</span>
                      </div>
                      <Save className="w-4 h-4 text-slate-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-transparent hover:border-correo-yellow transition-all">
                      <div className="flex items-center gap-4">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-black text-correo-blue dark:text-white uppercase tracking-widest">Ver Historial de Sesiones</span>
                      </div>
                      <Save className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'datos' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 shadow-lg">
                    <div className="p-4 bg-correo-yellow/20 rounded-2xl w-fit mb-6">
                      <Download className="w-6 h-6 text-correo-blue dark:text-correo-yellow" />
                    </div>
                    <h5 className="text-sm font-black text-correo-blue dark:text-white uppercase tracking-widest mb-2">Exportar Todo</h5>
                    <p className="text-xs text-slate-500 mb-6">Descarga una copia de seguridad completa de todos tus registros en formato JSON.</p>
                    <button className="w-full bg-correo-blue text-correo-yellow py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-correo-blue-light transition-all">
                      Descargar Backup
                    </button>
                  </div>

                  <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 shadow-lg">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl w-fit mb-6">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h5 className="text-sm font-black text-red-600 uppercase tracking-widest mb-2">Borrar Historial</h5>
                    <p className="text-xs text-slate-500 mb-6">Elimina permanentemente todos los datos de esta terminal. Esta acción es irreversible.</p>
                    <button className="w-full border-2 border-red-200 dark:border-red-900/50 text-red-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                      Reiniciar Terminal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Save Button */}
            <div className="flex justify-end pt-10 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSave}
                className="flex items-center gap-3 bg-correo-blue text-correo-yellow px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-correo-blue/30 hover:bg-correo-blue-light hover:-translate-y-1 transition-all group"
              >
                {saveSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {saveSuccess ? 'Configuración Guardada' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
