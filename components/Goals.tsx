import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { 
  Target, TrendingUp, Trophy, Zap, 
  ChevronRight, BrainCircuit,
  ShieldCheck, Sparkles, Loader2
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GoalsProps {
  tasks: Task[];
}

const Goals: React.FC<GoalsProps> = ({ tasks }) => {
  const [careerInsight, setCareerInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    // ✅ Aseguramos que total_horas sea tratado como número
    const totalHours = tasks.reduce((acc, t) => acc + (Number(t.total_horas) || 0), 0);
    const completedTasks = tasks.filter(t => t.estado === 'Listo' || t.estado === 'Done').length;
    
    const okrs = [
      { id: 1, name: "Eficiencia de Carga Operativa", current: totalHours, target: 160, unit: "hs", icon: TrendingUp, color: "text-blue-500" },
      { id: 2, name: "Tasa de Cierre de Tickets", current: completedTasks, target: 50, unit: "items", icon: Zap, color: "text-amber-500" },
      { id: 3, name: "Alineación Estratégica", current: tasks.filter(t => t.proyecto?.toLowerCase().includes('api')).length, target: 20, unit: "tareas", icon: Target, color: "text-purple-500" }
    ];
    return { okrs, totalHours };
  }, [tasks]);

  const generateCareerInsight = async () => {
    if (tasks.length === 0) return alert("No hay tareas para analizar.");
    
    setIsGenerating(true);
    try {
      // ✅ Verifica que el nombre coincida con tu archivo .env
      const apiKey = import.meta.env.VITE_GEMINI_KEY; 
      if (!apiKey) throw new Error("API Key no configurada en el entorno");

      const genAI = new GoogleGenerativeAI(apiKey);
      // ✅ Usamos gemini-1.5-flash (estable y rápido)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const context = tasks.slice(0, 15).map(t => `${t.proyecto}: ${t.descripcion}`).join(', ');
      
      const prompt = `Analiza este historial de tareas de un Analista de Sistemas Senior: [${context}]. 
        Genera un "Career Insight" profesional de 3 párrafos muy breves:
        1. Fortalezas. 2. Brecha técnica. 3. Meta para el próximo Q.
        Tono ejecutivo. Máximo 120 palabras.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      // ✅ El texto se obtiene mediante la función .text()
      setCareerInsight(response.text());

    } catch (e: any) {
      console.error("Error con Gemini:", e);
      setCareerInsight("Error de conexión con la IA. Revisa tu API Key en el archivo .env.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-correo-blue p-2 rounded-lg">
                <Target className="w-5 h-5 text-correo-yellow" />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Roadmap 2026</span>
          </div>
          <h2 className="text-5xl font-black text-correo-blue dark:text-white tracking-tighter uppercase italic leading-none">Objetivos del Q1</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</p>
              <p className="text-3xl font-black text-correo-blue dark:text-correo-yellow leading-none">68.4%</p>
           </div>
           <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-correo-yellow border-t-transparent -rotate-45 animate-[spin_3s_linear_infinite]" />
              <Trophy className="w-6 h-6 text-correo-yellow" />
           </div>
        </div>
      </div>

      {/* OKR Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {stats.okrs.map(okr => (
          <div key={okr.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl hover:border-correo-yellow transition-all group">
            <div className={`p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 w-fit mb-8 group-hover:scale-110 transition-transform ${okr.color}`}>
              <okr.icon className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">{okr.name}</h4>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-4xl font-black text-correo-blue dark:text-white tracking-tighter">
                {okr.current}
                <span className="text-sm ml-1 text-slate-400 font-bold">/{okr.target} {okr.unit}</span>
              </span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">+12%</span>
            </div>
            <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-100 dark:border-slate-700">
              <div 
                className="h-full bg-correo-blue dark:bg-correo-yellow rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((okr.current / okr.target) * 100, 100)}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IA Coaching Card */}
        <div className="bg-slate-950 rounded-[4rem] p-12 lg:p-16 border-b-[12px] border-correo-yellow shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             <BrainCircuit className="w-64 h-64 text-correo-yellow" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-12">
               <div className="p-5 bg-correo-yellow rounded-[2rem] shadow-[0_0_40px_rgba(255,206,0,0.3)]">
                  <Sparkles className="w-8 h-8 text-correo-blue" />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Career Insights IA</h3>
                  <p className="text-correo-yellow/50 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Análisis Predictivo Gemini</p>
               </div>
            </div>

            {careerInsight ? (
              <div className="space-y-6 text-slate-300 leading-relaxed font-medium animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] italic whitespace-pre-wrap text-sm">
                  {careerInsight}
                </div>
                <button 
                  onClick={() => setCareerInsight(null)} 
                  className="text-[10px] font-black text-correo-yellow uppercase tracking-widest hover:underline"
                >
                  Reiniciar Diagnóstico
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-slate-400 text-lg">Analizaremos tus últimos registros operativos para definir tu siguiente paso estratégico en la compañía.</p>
                <button 
                  onClick={generateCareerInsight}
                  disabled={isGenerating}
                  className="flex items-center gap-4 bg-white text-correo-blue px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest hover:bg-correo-yellow transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                  {isGenerating ? "Procesando..." : "Generar Auditoría de Carrera"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 lg:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
          <h3 className="text-xl font-black text-correo-blue dark:text-white uppercase tracking-widest mb-10 flex items-center gap-4">
             <ShieldCheck className="w-7 h-7 text-emerald-500" /> Próximos Hitos
          </h3>
          <div className="space-y-6">
            {[
              { title: "Finalización Auditoría Q1", date: "Mar 30", status: "pending" },
              { title: "Sincronización API Producción", date: "Feb 15", status: "completed" },
              { title: "Certificación de Procesos", date: "Mar 05", status: "pending" }
            ].map((milestone, i) => (
              <div key={i} className="flex items-center gap-6 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className={`w-3 h-3 rounded-full ${milestone.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <div className="flex-1">
                   <p className={`text-sm font-black uppercase tracking-tight ${milestone.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-white'}`}>{milestone.title}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{milestone.date}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-correo-blue transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;