
import React, { useState, useMemo } from 'react';
import { 
  Activity, Terminal, Cpu, Server, RefreshCcw, Wifi, WifiOff, 
  XCircle, Box, Layers, ShieldAlert, Globe, Info
} from 'lucide-react';
import { API_INVENTORY, API_NAMESPACES } from '../api_inventory';
import { useApiMonitor } from '../hooks/useApiMonitor';

const ApiControlCenter: React.FC = () => {
  const [envFilter, setEnvFilter] = useState<'ALL' | 'DEV' | 'TEST'>('ALL');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('api-pas-dev');
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  
  const { statuses, logs } = useApiMonitor(API_INVENTORY);

  // Filtrado multinivel: Entorno -> Namespace
  const filteredInventory = useMemo(() => {
    return API_INVENTORY.filter(api => {
      const matchesEnv = envFilter === 'ALL' || api.environment === envFilter;
      const matchesNamespace = api.namespace === selectedNamespace;
      return matchesEnv && matchesNamespace;
    });
  }, [envFilter, selectedNamespace]);

  // Estadísticas globales para el Dashboard
  const stats = useMemo(() => {
    const values = Object.values(statuses);
    return {
      total: API_INVENTORY.length,
      up: values.filter(s => s.health === 'UP').length,
      down: values.filter(s => s.health === 'DOWN').length,
      degraded: values.filter(s => s.health === 'DEGRADED').length
    };
  }, [statuses]);

  // Logs filtrados por selección
  const displayedLogs = useMemo(() => {
    if (!selectedApiId) {
      // Si no hay API seleccionada, mostrar logs del namespace actual
      const apiIdsInNamespace = API_INVENTORY.filter(a => a.namespace === selectedNamespace).map(a => a.id);
      return logs.filter(log => apiIdsInNamespace.includes(log.endpointId));
    }
    return logs.filter(log => log.endpointId === selectedApiId);
  }, [logs, selectedApiId, selectedNamespace]);

  const selectedApiName = useMemo(() => {
    return API_INVENTORY.find(api => api.id === selectedApiId)?.name;
  }, [selectedApiId]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Top Header & Env Switcher */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-correo-blue p-4 rounded-3xl shadow-lg border-2 border-correo-yellow/20">
            <Cpu className="w-8 h-8 text-correo-yellow" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-correo-blue dark:text-correo-yellow tracking-tighter uppercase italic leading-none">Control Tower</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2">Observabilidad de Microservicios Correo Argentino</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entorno:</span>
            {(['ALL', 'DEV', 'TEST'] as const).map((env) => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  envFilter === env 
                    ? 'bg-correo-blue text-correo-yellow shadow-md' 
                    : 'text-slate-400 hover:text-correo-blue dark:hover:text-white'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 px-6 py-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <p className="text-[9px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-tight">
              Nota: Asegure políticas de CORS en servicios de destino.
            </p>
          </div>
        </div>
      </header>

      {/* Main Layout: Namespace Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Namespaces Navigation */}
        <aside className="lg:w-72 flex flex-col gap-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 ml-4">Namespaces</h3>
          {API_NAMESPACES.map((ns) => {
            const isActive = selectedNamespace === ns;
            const nsStats = API_INVENTORY.filter(a => a.namespace === ns).length;
            
            return (
              <button
                key={ns}
                onClick={() => {
                  setSelectedNamespace(ns);
                  setSelectedApiId(null);
                }}
                className={`flex items-center justify-between px-6 py-5 rounded-[2rem] border-2 transition-all group ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 border-correo-yellow shadow-xl -translate-y-1' 
                    : 'bg-white/50 dark:bg-slate-900/50 border-transparent text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Box className={`w-5 h-5 ${isActive ? 'text-correo-blue dark:text-correo-yellow' : 'text-slate-300'}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-correo-blue dark:text-white' : ''}`}>
                    {ns}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${isActive ? 'bg-correo-yellow text-correo-blue' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {nsStats}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Services Grid & Stats */}
        <div className="flex-1 space-y-8">
          
          {/* Quick Metrics per Namespace */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Servicios", val: stats.total, icon: Server, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Online", val: stats.up, icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Warning", val: stats.degraded, icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Offline", val: stats.down, icon: WifiOff, color: "text-red-500", bg: "bg-red-50" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                <div className={`p-3 rounded-2xl ${kpi.color} ${kpi.bg} dark:bg-white/5`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                  <p className="text-xl font-black text-correo-blue dark:text-white leading-none">{kpi.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInventory.length > 0 ? filteredInventory.map((api) => {
              const status = statuses[api.id];
              const isSelected = selectedApiId === api.id;
              const health = status?.health || 'PENDING';

              return (
                <div 
                  key={api.id}
                  onClick={() => setSelectedApiId(prev => prev === api.id ? null : api.id)}
                  className={`relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-4 transition-all cursor-pointer group ${
                    isSelected ? 'border-correo-yellow shadow-2xl scale-[1.02]' : 'border-slate-50 dark:border-slate-800 shadow-md hover:border-slate-200'
                  }`}
                >
                  {/* Status Gradient Bar */}
                  <div className={`absolute top-0 left-0 h-2 w-full ${
                    health === 'UP' ? 'bg-emerald-500' : health === 'DOWN' ? 'bg-red-500' : health === 'DEGRADED' ? 'bg-amber-500' : 'bg-slate-200'
                  }`} />

                  <div className="flex flex-col h-full gap-5 mt-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${
                            health === 'UP' ? 'bg-emerald-500' : health === 'DOWN' ? 'bg-red-500' : health === 'DEGRADED' ? 'bg-amber-500' : 'bg-slate-200'
                          }`} />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{api.environment} NODE</span>
                        </div>
                        <h4 className="text-lg font-black text-correo-blue dark:text-white tracking-tighter uppercase leading-tight mt-1 truncate">
                          {api.name}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-300 uppercase italic">Status</span>
                        <span className={`text-[10px] font-black uppercase ${
                          health === 'UP' ? 'text-emerald-500' : health === 'DOWN' ? 'text-red-500' : health === 'DEGRADED' ? 'text-amber-500' : ''
                        }`}>{health}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Latency</p>
                        <p className={`text-sm font-black ${status?.latency > 1000 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {status?.latency ? `${status.latency}ms` : '--'}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status Code</p>
                        <p className="text-sm font-black text-correo-blue dark:text-white">{status?.statusCode || '--'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Layers className="w-3.5 h-3.5 text-slate-300" />
                      <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${status?.latency > 1000 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((status?.latency || 0) / 2000 * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                <Info className="w-12 h-12 text-slate-300 mb-4" />
                <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sin servicios registrados en {selectedNamespace}</h5>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Log Console */}
      <section className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 shadow-2xl border-b-8 border-correo-blue overflow-hidden relative group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="bg-correo-blue p-4 rounded-2xl shadow-lg border border-white/10 group-hover:rotate-12 transition-transform">
              <Terminal className="w-6 h-6 text-correo-yellow" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Ecosystem Debugger</h3>
                <span className="px-3 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">Live Link</span>
              </div>
              <p className="text-correo-yellow/50 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                {selectedApiId ? `Node Target: ${selectedApiName}` : `Namespace Context: ${selectedNamespace}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedApiId && (
              <button 
                onClick={() => setSelectedApiId(null)}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
              >
                <XCircle className="w-4 h-4 text-correo-yellow" />
                Scope: Global
              </button>
            )}
            <div className="px-6 py-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3">
              <RefreshCcw className="w-3.5 h-3.5 text-correo-yellow animate-spin-slow" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Polling: 15s</span>
            </div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 h-96 overflow-y-auto font-mono scrollbar-hide flex flex-col-reverse shadow-inner">
          {displayedLogs.length > 0 ? displayedLogs.map((log, i) => (
            <div key={i} className={`flex items-start gap-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group/log animate-in fade-in slide-in-from-right-2 duration-300 ${
              log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400/80'
            }`}>
              <div className="flex flex-col items-center gap-1 opacity-40 min-w-[90px] text-center">
                <span className="text-[10px] font-black">{log.timestamp}</span>
                <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-white/10 rounded-md tracking-tighter">
                  {log.endpointId.split('-')[0]}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    log.level === 'ERROR' ? 'bg-red-500/20' : log.level === 'WARN' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">PID: {Math.floor(Math.random()*9000)+1000}</span>
                </div>
                <p className="text-xs font-medium tracking-tight leading-relaxed">{log.message}</p>
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
              <Activity className="w-16 h-16 animate-pulse mb-6 text-slate-700" />
              <p className="text-sm font-black uppercase tracking-[0.5em] italic">Tracing Network Interface...</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-4 max-w-xs text-center leading-relaxed">
                Escuchando eventos de infraestructura para el namespace {selectedNamespace}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              CA-SECURE-SOCKET-01
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-correo-yellow rounded-full shadow-[0_0_10px_rgba(255,206,0,0.5)]" />
              AES-256-GCM ENCRYPTED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            V.2.4.0-STABLE
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiControlCenter;
