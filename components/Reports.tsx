import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { 
  BarChart3, TrendingUp, Target, Award, Zap, 
  Lightbulb, CheckCircle2, AlertCircle, PieChart, 
  Clock, Activity, ArrowUpRight, Sparkles, Loader2, BrainCircuit,
  ShieldCheck, FileText, Database, HardDrive, Cpu
} from 'lucide-react';

// ✅ CORRECCIÓN 1: Importación oficial de la librería
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ReportsProps {
  tasks: Task[];
}

const Reports: React.FC<ReportsProps> = ({ tasks }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const totalHours = tasks.reduce((acc, t) => acc + (Number(t.total_horas) || 0), 0);
    const completedHours = tasks.filter(t => t.estado === 'Listo').reduce((acc, t) => acc + (Number(t.total_horas) || 0), 0);
    const efficiency = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
    
    const uniqueDays = new Set(tasks.map(t => t.fecha)).size;
    const avgPerDay = uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(1) : "0";

    const projectsData = tasks.reduce((acc, t) => {
      acc[t.proyecto] = (acc[t.proyecto] || 0) + (Number(t.total_horas) || 0);
      return acc;
    }, {} as Record<string, number>);

    let rank = "Analista de Sistemas";
    let rankColor = "text-slate-400 border-slate-200 bg-slate-50";
    if (totalHours > 20) {
      rank = "Analista Senior";
      rankColor = "text-blue-600 border-yellow-400 bg-yellow-400/10";
    }
    if (totalHours > 60) {
      rank = "Lead Technical Auditor";
      rankColor = "text-white border-blue-600 bg-blue-600 shadow-lg shadow-blue-600/20";
    }

    return { totalHours, efficiency, avgPerDay, projectsData, rank, rankColor, totalTasks: tasks.length };
  }, [tasks]);

  const generateAIAnalysis = async () => {
    if (tasks.length === 0) {
      setError("Base de datos vacía. Ingrese registros para iniciar la auditoría.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // ✅ CORRECCIÓN 2: Inicialización correcta de la IA
      // Asegúrate de tener tu API KEY en el archivo .env como VITE_GOOGLE_AI_KEY
      const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY; 
      const genAI = new GoogleGenerativeAI(apiKey);

      
console.log("LLAVE CARGADA:", apiKey); // <-- AGREGA ESTO

if (!apiKey) {
  setError("Error crítico: La clave no se leyó del archivo .env");
  return;
}
      
      // ✅ CORRECCIÓN 3: Configuración del modelo (usando gemini-1.5-flash)
      const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
});

      const context = tasks.slice(0, 40).map(t => ({
        date: t.fecha,
        project: t.proyecto,
        desc: t.descripcion,
        hours: t.total_horas
      }));

      const prompt = `Actúa como un Lead Systems Analyst. Analiza este log de actividades técnicas de un Analista de Sistemas Senior en Correo Argentino:
      Métricas: ${metrics.totalHours}h totales, ${metrics.efficiency.toFixed(1)}% eficiencia.
      Datos: ${JSON.stringify(context)}
      Genera un reporte técnico breve con: Arquitectura de tiempos, Optimización de flujo y Conclusión ejecutiva. Usa Markdown.`;

      // ✅ CORRECCIÓN 4: Método de generación de contenido corregido
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setAiReport(text || "Error en el motor de síntesis.");
    } catch (err: any) {
      console.error(err);
      setError("Error de conexión con Gemini. Revisa que tu API Key sea válida.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (El resto del código HTML/JSX que tienes abajo se mantiene igual, ya es correcto visualmente)
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      {/* Tu JSX actual... el cual es excelente */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-correo-blue p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">System Audit // Active</span>
          </div>
          <h2 className="text-6xl font-black text-blue-900 dark:text-yellow-400 tracking-tighter uppercase italic leading-none">Reporte de Auditoría</h2>
        </div>
        
        <div className={`flex items-center gap-6 px-12 py-6 rounded-[3rem] border-4 transition-all duration-500 hover:scale-105 ${metrics.rankColor}`}>
          <div className="p-4 bg-white/10 rounded-2xl">
            <Award className="w-10 h-10" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Nivel Operativo</p>
            <p className="text-3xl font-black uppercase tracking-tighter leading-none">{metrics.rank}</p>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Volumen de Datos", val: `${metrics.totalHours.toFixed(1)}h`, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Ratio de Calidad", val: `${metrics.efficiency.toFixed(0)}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Inversión Diaria", val: `${metrics.avgPerDay}h`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Casos Auditados", val: metrics.totalTasks, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-8">
            <div className={`p-6 rounded-3xl ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-4xl font-black text-blue-900 dark:text-white leading-none">{kpi.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sección IA */}
      <section className="bg-correo-blue rounded-[4rem] p-12 lg:p-20 shadow-2xl border-b-[12px] border-yellow-400 relative overflow-hidden">
        <div className="relative z-10 space-y-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="bg-yellow-400 p-8 rounded-[2.5rem] animate-pulse">
                <BrainCircuit className="w-12 h-12 text-blue-900" />
              </div>
              <h3 className="text-5xl font-black text-white uppercase italic">Diagnóstico Senior IA</h3>
            </div>
            <button 
              onClick={generateAIAnalysis}
              disabled={isGenerating}
              className="bg-white text-blue-900 px-16 py-8 rounded-[3rem] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50"
            >
              {isGenerating ? "Analizando..." : "Iniciar Auditoría IA"}
            </button>
          </div>

          {error && <div className="text-red-400 p-6 bg-red-500/10 rounded-2xl">{error}</div>}

          {aiReport && (
            <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 text-white border border-white/10">
               <div className="prose prose-invert max-w-none whitespace-pre-wrap text-lg opacity-90">
                {aiReport}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gráfico de Proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
          <h3 className="text-lg font-black text-blue-900 dark:text-white uppercase tracking-widest flex items-center gap-4 mb-10">
            <PieChart className="w-8 h-8 text-yellow-400" /> Inversión por Proyecto
          </h3>
          <div className="space-y-8">
            {Object.entries(metrics.projectsData).map(([name, hours]) => (
              <div key={name}>
                <div className="flex justify-between mb-2 font-bold uppercase text-xs">
                  <span>{name}</span>
                  <span>{hours.toFixed(1)}h</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-correo-blue transition-all duration-1000" 
                    style={{ width: `${(hours / metrics.totalHours) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;