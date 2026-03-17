
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { 
  Plus, Play, Save, Settings, Share2, MoreHorizontal, 
  ChevronLeft, Wrench, Clock, AlertCircle, 
  Database, Mail, Calendar, FileText, BrainCircuit, 
  GitBranch, Zap, Search, Layout, Boxes, 
  Cloud, Lock, Globe, Smartphone, Menu, CheckCircle2, Loader2, X, MessageSquare
} from 'lucide-react';

interface Module {
  id: string;
  type: 'trigger' | 'action' | 'router' | 'parser';
  service: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  x: number;
  y: number;
  status?: 'warning' | 'error' | 'success' | 'processing';
  connections: string[];
  isConnected?: boolean;
}

const AVAILABLE_SERVICES = [
  { service: 'Slack', name: 'Post Message', icon: MessageSquare, color: 'bg-purple-600' },
  { service: 'Google Drive', name: 'Upload File', icon: Cloud, color: 'bg-blue-600' },
  { service: 'Trello', name: 'Create Card', icon: Layout, color: 'bg-sky-500' },
  { service: 'Discord', name: 'Send Webhook', icon: Globe, color: 'bg-indigo-500' },
  { service: 'Notion', name: 'Create Page', icon: FileText, color: 'bg-black' },
];

interface AutomationBuilderProps {
  onBack: () => void;
  tasks: any[];
  userEmail: string;
}

const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ onBack, tasks, userEmail }) => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      type: 'trigger',
      service: 'Google Sheets',
      name: 'Watch Rows',
      description: 'Nuevas filas en planilla',
      icon: FileText,
      color: 'bg-emerald-500',
      x: 150,
      y: 300,
      status: 'warning',
      connections: ['2'],
      isConnected: false
    },
    {
      id: '2',
      type: 'action',
      service: 'Gemini AI',
      name: 'Analyze Content',
      description: 'Generar resumen ejecutivo',
      icon: BrainCircuit,
      color: 'bg-teal-500',
      x: 350,
      y: 300,
      connections: ['3'],
      isConnected: true
    },
    {
      id: '3',
      type: 'parser',
      service: 'Text Parser',
      name: 'Match Pattern',
      description: 'Extraer datos clave',
      icon: Search,
      color: 'bg-orange-500',
      x: 550,
      y: 300,
      connections: ['4']
    },
    {
      id: '4',
      type: 'router',
      service: 'Router',
      name: 'Router',
      description: 'Filtrar por prioridad',
      icon: GitBranch,
      color: 'bg-lime-500',
      x: 750,
      y: 300,
      connections: ['5', '6']
    },
    {
      id: '5',
      type: 'action',
      service: 'Gmail',
      name: 'Send Email',
      description: 'Notificar a Gerencia',
      icon: Mail,
      color: 'bg-red-500',
      x: 950,
      y: 200,
      connections: [],
      isConnected: false
    },
    {
      id: '6',
      type: 'action',
      service: 'Google Calendar',
      name: 'Create Event',
      description: 'Agendar reunión técnica',
      icon: Calendar,
      color: 'bg-blue-500',
      x: 950,
      y: 400,
      connections: [],
      isConnected: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('scenarios');
  const [isRunning, setIsRunning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [configModuleId, setConfigModuleId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectingFrom) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleRunOnce = async () => {
    if (isRunning) return;
    
    // Check if all modules are connected
    const unconnected = modules.filter(m => m.type !== 'router' && m.type !== 'parser' && m.isConnected === false);
    if (unconnected.length > 0) {
      showToast(`Error: Configura la conexión de ${unconnected[0].service}`, "info");
      setConfigModuleId(unconnected[0].id);
      return;
    }

    setIsRunning(true);
    showToast("Iniciando ejecución del escenario...", "info");

    setModules(prev => prev.map(m => ({ ...m, status: undefined })));

    // Simulate visual flow
    for (const module of modules) {
      setModules(prev => prev.map(m => m.id === module.id ? { ...m, status: 'processing' } : m));
      await new Promise(r => setTimeout(r, 800));
      setModules(prev => prev.map(m => m.id === module.id ? { ...m, status: 'success' } : m));
    }

    // REAL INTEGRATION: Send Email via Backend
    try {
      showToast("Generando banner profesional con IA...", "info");
      
      let bannerBase64 = null;
      try {
        const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || "") as string });
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: 'A professional, ultra-modern, and high-tech corporate banner for Correo Argentino. It should feature a futuristic delivery drone or a high-speed postal vehicle integrated with digital data streams and AI neural networks. Use a color palette of deep blue, vibrant yellow, and clean white. The style should be cinematic, sleek, and highly professional. 16:9 aspect ratio.',
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            bannerBase64 = part.inlineData.data;
            break;
          }
        }
      } catch (imgErr) {
        console.error("Failed to generate banner image:", imgErr);
      }

      showToast("Enviando reporte por email...", "info");
      const response = await fetch('/api/automate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tasks, 
          userEmail,
          bannerImage: bannerBase64
        })
      });

      const result = await response.json();

      if (result.success) {
        showToast("¡Email enviado con éxito!", "success");
      } else {
        if (result.instructions) {
          showToast("Configuración requerida", "info");
          alert(result.instructions);
        } else {
          showToast("Error al enviar email", "info");
          console.error(result.error);
        }
      }
    } catch (error) {
      console.error("Error calling automation API:", error);
      showToast("Error de conexión", "info");
    }

    setIsRunning(false);
  };

  const addModule = (service: typeof AVAILABLE_SERVICES[0]) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newModule: Module = {
      id: newId,
      type: 'action',
      service: service.service,
      name: service.name,
      description: 'Nueva acción configurada',
      icon: service.icon,
      color: service.color,
      x: 400 + Math.random() * 200,
      y: 300 + Math.random() * 200,
      connections: [],
      isConnected: false
    };

    setModules([...modules, newModule]);
    setShowAddModal(false);
    showToast(`Módulo ${service.service} añadido`, "success");
  };

  const deleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id).map(m => ({
      ...m,
      connections: m.connections.filter(connId => connId !== id)
    })));
    showToast("Módulo eliminado", "info");
  };

  const toggleConnection = (fromId: string, toId: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === fromId) {
        const isConnected = m.connections.includes(toId);
        return {
          ...m,
          connections: isConnected 
            ? m.connections.filter(id => id !== toId)
            : [...m.connections, toId]
        };
      }
      return m;
    }));
    setConnectingFrom(null);
  };

  const handleConnectAccount = (id: string) => {
    const module = modules.find(m => m.id === id);
    if (!module) return;

    showToast(`Conectando con ${module.service}...`, "info");
    setTimeout(() => {
      setModules(prev => prev.map(m => m.id === id ? { ...m, isConnected: true, status: undefined } : m));
      showToast(`Cuenta de ${module.service} vinculada con éxito`, "success");
    }, 1500);
  };

  const sidebarItems = [
    { id: 'org', icon: Layout, label: 'Org' },
    { id: 'scenarios', icon: Zap, label: 'Scenarios' },
    { id: 'credentials', icon: Lock, label: 'Credentials' },
    { id: 'webhooks', icon: Globe, label: 'Webhooks' },
    { id: 'tools', icon: Boxes, label: 'MCP Toolboxes' },
    { id: 'templates', icon: Layout, label: 'Templates' },
    { id: 'data', icon: Database, label: 'Data stores' },
    { id: 'devices', icon: Smartphone, label: 'Devices' },
  ];

  const configModule = modules.find(m => m.id === configModuleId);

  return (
    <div 
      className="flex h-screen bg-[#F8F9FB] dark:bg-black overflow-hidden font-sans"
      onMouseMove={handleMouseMove}
    >
      {/* Sidebar - Make Style */}
      <aside className="w-20 bg-[#6A1B9A] flex flex-col items-center py-6 gap-8 z-50 overflow-y-auto scrollbar-hide">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <Menu className="text-white w-6 h-6" />
        </div>
        
        <nav className="flex flex-col gap-6 items-center flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 group transition-all ${
                activeTab === item.id ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <button className="text-white/50 hover:text-white mt-auto">
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Automatización: Reporte Inteligente Correo Argentino
              </span>
              <Settings className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
          
          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {modules.map(module => 
              module.connections.map(targetId => {
                const target = modules.find(m => m.id === targetId);
                if (!target) return null;
                
                const dx = target.x - module.x;
                const midX = module.x + dx / 2;
                
                return (
                  <g key={`${module.id}-${targetId}`} className="pointer-events-auto cursor-pointer" onClick={() => toggleConnection(module.id, targetId)}>
                    <path
                      d={`M ${module.x} ${module.y} C ${midX} ${module.y}, ${midX} ${target.y}, ${target.x} ${target.y}`}
                      stroke="#CBD5E1"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="8 8"
                      className="animate-[dash_20s_linear_infinite] hover:stroke-red-400 transition-colors"
                    />
                  </g>
                );
              })
            )}
            {/* Active Connection Line */}
            {connectingFrom && (
              <path
                d={`M ${modules.find(m => m.id === connectingFrom)?.x} ${modules.find(m => m.id === connectingFrom)?.y} L ${mousePos.x - 80} ${mousePos.y - 64}`}
                stroke="#6A1B9A"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />
            )}
          </svg>

          {/* Modules Layer */}
          <div className="absolute inset-0">
            {modules.map((module) => (
              <motion.div
                key={module.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                  setModules(prev => prev.map(m => m.id === module.id ? { ...m, x: m.x + info.delta.x, y: m.y + info.delta.y } : m));
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ left: module.x, top: module.y, x: 0, y: 0 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-grab active:cursor-grabbing z-20"
                onClick={() => {
                  if (connectingFrom && connectingFrom !== module.id) {
                    toggleConnection(connectingFrom, module.id);
                  }
                }}
              >
                {/* Module Circle */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full ${module.color} shadow-2xl flex items-center justify-center border-4 ${module.isConnected === false && module.type !== 'router' && module.type !== 'parser' ? 'border-red-500 animate-pulse' : 'border-white dark:border-slate-800'} transition-transform group-hover:scale-110 z-20 relative`}>
                    {module.status === 'processing' ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : (
                      <module.icon className="w-10 h-10 text-white" />
                    )}
                    
                    {/* Status Badge */}
                    {module.status === 'warning' && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-white dark:border-slate-800 shadow-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {module.status === 'success' && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white dark:border-slate-800 shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Connection Warning */}
                    {module.isConnected === false && module.type !== 'router' && module.type !== 'parser' && (
                      <div className="absolute -top-1 -left-1 bg-red-500 rounded-full p-1 border-2 border-white dark:border-slate-800 shadow-lg">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Trigger Icon (Clock) */}
                    {module.type === 'trigger' && (
                      <div className="absolute -bottom-2 -left-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-xl border border-slate-100 dark:border-slate-700">
                        <Clock className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                    )}

                    {/* Connection Handle */}
                    <button 
                      className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-125 transition-transform z-30 ${connectingFrom === module.id ? 'ring-4 ring-purple-500' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFrom(connectingFrom === module.id ? null : module.id);
                      }}
                    >
                      <Plus className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Context Menu (Hover) */}
                  <div className="absolute -right-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfigModuleId(module.id); }}
                      className={`p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-blue-50 ${module.isConnected ? 'text-emerald-500' : 'text-blue-500'}`}
                      title="Configurar Conexión"
                    >
                      {module.isConnected ? <CheckCircle2 className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfigModuleId(module.id); }}
                      className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 text-slate-500"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                      className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:bg-red-50 text-red-500"
                      title="Eliminar Módulo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">
                      {module.service}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                      {module.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Branch Labels (Router) */}
          <div className="absolute" style={{ left: 850, top: 250 }}>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500">
              1st: Priority High
            </div>
          </div>
          <div className="absolute" style={{ left: 850, top: 350 }}>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500">
              2nd: Regular
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
            <button 
              onClick={handleRunOnce}
              disabled={isRunning}
              className={`bg-[#6A1B9A] text-white px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50`}
            >
              {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              {isRunning ? "Running..." : "Run once"}
            </button>
            <div className="h-14 w-px bg-slate-200 dark:bg-slate-800" />
            <button 
              onClick={() => showToast("Escenario guardado correctamente", "success")}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50"
            >
              <Save className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="fixed bottom-24 left-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
              >
                {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Zap className="w-4 h-4 text-correo-yellow" />}
                <span className="text-xs font-bold uppercase tracking-widest">{notification.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Module Modal */}
          <AnimatePresence>
            {showAddModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddModal(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-3xl overflow-hidden border border-slate-100 dark:border-slate-800"
                >
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-correo-blue dark:text-white uppercase tracking-tighter">Add Module</h3>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                    {AVAILABLE_SERVICES.map((service, i) => (
                      <button
                        key={i}
                        onClick={() => addModule(service)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                      >
                        <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{service.service}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Module Configuration Modal (Connection) */}
          <AnimatePresence>
            {configModule && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfigModuleId(null)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-4xl overflow-hidden border border-slate-100 dark:border-slate-800"
                >
                  {/* Modal Header */}
                  <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${configModule.color} flex items-center justify-center shadow-lg`}>
                        <configModule.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Step 2
                        </h3>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                          {configModule.service}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </button>
                      <button onClick={() => setConfigModuleId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 space-y-6">
                    {/* Info Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex gap-3">
                      <div className="w-5 h-5 mt-0.5">
                        <AlertCircle className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Select a connection or connect your <span className="font-bold">{configModule.service}</span> account to Correo Argentino.
                      </p>
                    </div>

                    {/* Connection Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        Connection <span className="text-red-500">*</span>
                      </label>
                      
                      {configModule.isConnected ? (
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Connected Account</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-500 opacity-80">caponettopeppers@gmail.com</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setModules(prev => prev.map(m => m.id === configModule.id ? { ...m, isConnected: false } : m))}
                            className="text-xs font-bold text-red-500 hover:underline"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleConnectAccount(configModule.id)}
                          className="w-full flex items-center justify-center gap-3 p-4 bg-[#10a37f] hover:bg-[#0e8c6d] text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Plus className="w-5 h-5" />
                          Create a connection
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      For more information on how to create a connection to {configModule.service}, see the <span className="text-purple-500 hover:underline cursor-pointer">online Help</span>.
                    </p>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-top border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setConfigModuleId(null)}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setConfigModuleId(null)}
                      disabled={!configModule.isConnected}
                      className="px-8 py-2.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 disabled:cursor-not-allowed transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Action Button - Add Module */}
          <div className="absolute bottom-8 right-8">
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center border-2 border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform text-slate-400"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Guided Setup Banner */}
        <div className="absolute bottom-8 left-28 z-40">
          <button className="bg-[#6A1B9A] text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:opacity-90 transition-opacity">
            Skip guided setup
          </button>
        </div>
      </main>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
};

export default AutomationBuilder;
