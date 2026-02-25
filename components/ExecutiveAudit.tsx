import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { 
  ShieldCheck, Award, Database, Target, Activity, FileText, 
  BrainCircuit, Sparkles, Loader2, HardDrive, PieChart as PieIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
// ✅ Importación oficial corregida
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ExecutiveAuditProps {
  tasks: Task[];
}

const ExecutiveAudit: React.FC<ExecutiveAuditProps> = ({ tasks }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    // ✅ Validación de horas para evitar errores de cálculo
    const totalHours = tasks.reduce((acc, t) => acc + (Number(t.total_horas) || 0), 0);
    const completedHours = tasks
      .filter(t => t.estado === 'Done' || t.estado === 'Listo')
      .reduce((acc, t) => acc + (Number(t.total_horas) || 0), 0);
    
    const efficiency = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;
    
    const uniqueDays = new Set(tasks.map(t => t.fecha)).size;
    const avgPerDay = uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(1) : "0";

    const projectsData = tasks.reduce((acc, t) => {
      const projectName = t.proyecto || 'Sin Proyecto';
      acc[projectName] = (acc[projectName] || 0) + (Number(t.total_horas) || 0);
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(projectsData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    let rank = "Analista de Sistemas";
    let rankColor = "text-slate-400 border-slate-200 bg-slate-50";
    
    if (totalHours > 20) {
      rank = "Analista Senior";
      rankColor = "text-correo-blue border-correo-yellow bg-correo-yellow/10";
    }
    if (totalHours > 60) {
      rank = "Lead Technical Auditor";
      rankColor = "text-white border-correo-blue bg-correo-blue shadow-lg shadow-blue-900/20";
    }

    return { totalHours, efficiency, avgPerDay, projectsData, chartData, rank, rankColor, totalTasks: tasks.length };
  }, [tasks]);

  const generateAIAnalysis = async () => {
    if (tasks.length === 0) {
      setError("Base de datos vacía. Ingrese registros para iniciar la auditoría.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // ✅ Uso de variables de entorno de Vite
      const apiKey = import.meta.env.VITE_GEMINI_KEY;
      if (!apiKey) throw new Error("API Key no encontrada en .env");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const context = tasks.slice(0, 40).map(t => ({
        date: t.fecha,
        project: t.proyecto,
        desc: t.descripcion,
        hours: t.total_horas
      }));

      const prompt = `Analiza esta auditoría técnica de Correo Argentino: ${JSON.stringify(context)}. 
        Estructura el reporte en: 
        1. Resumen Ejecutivo (puntos clave). 
        2. Alerta de Desviación de SLA (si hay proyectos con muchas horas). 
        3. Optimización de Procesos (sugerencias técnicas). 
        Formato: Markdown profesional y conciso para gerencia.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiReport(response.text());
      
    } catch (err: any) {
      console.error(err);
      setError("Interrupción en el enlace con Gemini AI. Revisa la consola.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      {/* Header Sección */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-correo-blue p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-correo-yellow" />
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">System Audit Mode // Active</span>
          </div>
          <h2 className="text-6xl font-black text-correo-blue dark:text-correo-yellow tracking-tighter uppercase italic leading-none">Auditoría Ejecutiva</h2>
        </div>
        
        <div className={`flex items-center gap-6 px-10 py-5 rounded-[2.5rem] border-4 transition-all duration-500 hover:scale-105 ${metrics.rankColor}`}>
          <Award className="w-8 h-8" />
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Status Operativo</p>
            <p className="text-2xl font-black uppercase tracking-tighter leading-none">{metrics.rank}</p>
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Volumen Operativo", val: `${metrics.totalHours.toFixed(1)}h`, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Efficiency SLA", val: `${metrics.efficiency.toFixed(0)}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Daily Avg", val: `${metrics.avgPerDay}h`, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Records Processed", val: metrics.totalTasks, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6 group hover:border-correo-yellow transition-all duration-300">
            <div className={`p-5 rounded-3xl ${kpi.bg} dark:bg-slate-800 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-3xl font-black text-correo-blue dark:text-white leading-none">{kpi.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* IA Auditor Card */}
        <div className="lg:col-span-2 bg-slate-950 rounded-[4rem] p-12 border-b-[12px] border-correo-yellow shadow-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-correo-yellow p-4 rounded-2xl">
                <BrainCircuit className="w-8 h-8 text-correo-blue" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">AI Business Auditor</h3>
            </div>
            <button 
              onClick={generateAIAnalysis}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-4 bg-white text-correo-blue rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-correo-yellow transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? "Analizando..." : "Ejecutar Auditoría"}
            </button>
          </div>
          
          {error && <p className="text-red-500 font-bold mb-4 text-xs uppercase tracking-widest">{error}</p>}

          {aiReport ? (
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 text-slate-300 font-medium leading-relaxed max-w-none overflow-auto max-h-[500px] scrollbar-hide">
               <div className="whitespace-pre-wrap text-sm">{aiReport}</div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem]">
               <HardDrive className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Esperando Datos para Análisis Crítico</p>
            </div>
          )}
        </div>

        {/* Chart Card */}
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <PieIcon className="w-5 h-5 text-correo-yellow" /> Workload Mix
          </h3>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.chartData} layout="vertical" margin={{ left: -10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={80}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc', radius: 8 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#00205b" radius={[0, 8, 8, 0]} barSize={20}>
                  {metrics.chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#00205b', '#ffce00', '#3b82f6', '#10b981', '#f59e0b'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveAudit;