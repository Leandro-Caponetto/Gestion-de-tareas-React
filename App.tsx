
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import RecentActivity from './components/RecentActivity';
import ExecutiveAudit from './components/ExecutiveAudit';
import TaskDetailModal from './components/TaskDetailModal';
import Settings from './components/Settings';
import Auth from './components/Auth';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import ApiControlCenter from './components/ApiControlCenter';
import ChatRoom from './components/ChatRoom';
import AIChatBot from './components/AIChatBot';
import { Task, ViewType, TaskStatus, UserSettings } from './types';
import { handleExport } from './services/exportService';
import { Check, X, Loader2, Database, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedInitialData = useRef(false);
  const [notifications, setNotifications] = useState<{id: number, msg: string, type: 'success' | 'error'}[]>([]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('taskpulse_darkmode') === 'true';
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('taskpulse_settings');
    return saved ? JSON.parse(saved) : {
      displayName: '',
      role: 'Analista de Sistemas Senior',
      avatarUrl: '',
      language: 'es',
      timeFormat: '24h',
      notifications: true,
      employeeId: 'AS-' + Math.floor(1000 + Math.random() * 9000)
    };
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession((prevSession: any) => {
        if (prevSession?.user?.id !== newSession?.user?.id) {
          hasFetchedInitialData.current = false; 
          return newSession;
        }
        return prevSession;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && !hasFetchedInitialData.current) {
      fetchTasks();
      hasFetchedInitialData.current = true;
    }
  }, [session]);

  const fetchTasks = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('taskpulse_darkmode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: session.user.id }])
        .select();

      if (error) throw error;
      if (data) {
        setTasks(prev => [data[0], ...prev]);
        addNotification('Registro guardado exitosamente', 'success');
      }
    } catch (error: any) {
      addNotification('Error al guardar: ' + error.message, 'error');
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', updatedTask.id);

      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTask(null);
      addNotification('Registro actualizado', 'success');
    } catch (error: any) {
      addNotification('Error al actualizar: ' + error.message, 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, estado: newStatus, fecha: newStatus === 'Done' ? today : t.fecha } : t));
    try {
      const updatePayload: any = { estado: newStatus };
      if (newStatus === 'Done') updatePayload.fecha = today;
      const { error } = await supabase.from('tasks').update(updatePayload).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      addNotification('Registro eliminado', 'success');
    } catch (error: any) {
      addNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  if (!session) return <Auth />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} userSettings={userSettings} />
      
      <main className="flex-1 ml-64 p-6 lg:p-10 min-w-0">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-40">
              <div className="w-12 h-12 border-4 border-correo-yellow border-t-correo-blue rounded-full animate-spin"></div>
              <p className="mt-6 text-xs font-black text-correo-blue uppercase tracking-widest animate-pulse">Cargando Sistema...</p>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <div className="space-y-12 pb-20">
                  <Dashboard tasks={tasks} onStatusChange={handleStatusChange} onAddTask={addTask} onEditTask={setEditingTask} onDeleteTask={id => setTaskToDelete(tasks.find(t => t.id === id) || null)} userSettings={userSettings} onViewChange={setCurrentView} />
                  <RecentActivity tasks={tasks} onDelete={id => setTaskToDelete(tasks.find(t => t.id === id) || null)} onEdit={setEditingTask} onStatusChange={handleStatusChange} onExport={handleExport} />
                </div>
              )}
              {currentView === 'registro' && (
                <div className="space-y-12 pb-20">
                  <TaskForm onAddTask={addTask} />
                  <RecentActivity tasks={tasks} onDelete={id => setTaskToDelete(tasks.find(t => t.id === id) || null)} onEdit={setEditingTask} onStatusChange={handleStatusChange} onExport={handleExport} />
                </div>
              )}
              {currentView === 'reportes' && <ExecutiveAudit tasks={tasks} />}
              {currentView === 'comunicaciones' && <ChatRoom userSettings={userSettings} userId={session.user.id} />}
              {currentView === 'monitoreo' && <ApiControlCenter />}
              {currentView === 'configuracion' && <Settings settings={userSettings} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onSaveSettings={setUserSettings} onLogout={() => supabase.auth.signOut()} email={session.user.email} />}
            </>
          )}
        </div>
      </main>

      {/* Botón Flotante de Acceso Rápido */}
      {currentView !== 'registro' && (
        <button
          onClick={() => setCurrentView('registro')}
          className="fixed bottom-28 right-8 z-[150] bg-correo-yellow text-correo-blue p-5 rounded-full shadow-[0_20px_50px_rgba(255,206,0,0.3)] hover:scale-110 active:scale-95 transition-all group border-4 border-white dark:border-slate-800 flex items-center justify-center"
          title="Nueva Tarea"
        >
          <Plus className="w-8 h-8 stroke-[3]" />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-correo-blue text-correo-yellow px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap shadow-2xl pointer-events-none border border-white/10">
            Nueva Tarea
          </span>
        </button>
      )}

      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-right-full ${n.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 dark:bg-slate-800 border-white/10 text-white'}`}>
            {n.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4 text-emerald-400" />}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sistema</span>
              <span className="text-xs font-bold mt-1">{n.msg}</span>
            </div>
          </div>
        ))}
      </div>

      {editingTask && <TaskDetailModal task={editingTask} onClose={() => setEditingTask(null)} onSave={updateTask} onDelete={id => { setEditingTask(null); setTaskToDelete(tasks.find(t => t.id === id) || null); }} />}
      <DeleteConfirmationModal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} onConfirm={() => taskToDelete && deleteTask(taskToDelete.id)} taskTitle={taskToDelete?.proyecto || ''} />
      
      {/* Asistente IA Flotante */}
      <AIChatBot 
        tasks={tasks} 
        onStatusChange={handleStatusChange} 
        onAddTask={addTask}
        userEmail={session.user.email} 
        userSettings={userSettings}
      />
    </div>
  );
};

export default App;
