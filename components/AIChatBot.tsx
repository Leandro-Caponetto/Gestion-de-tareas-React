
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { Task, TaskStatus, TaskCategory, UserSettings } from '../types';

interface AIChatBotProps {
  tasks?: Task[];
  onStatusChange?: (id: string, newStatus: TaskStatus) => Promise<void>;
  onAddTask?: (task: Omit<Task, 'id'>) => Promise<void>;
  userEmail?: string;
  userSettings?: UserSettings;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ tasks = [], onStatusChange, onAddTask, userEmail, userSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: '¡Hola! Soy el asistente inteligente del Correo Argentino. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAutomation = async () => {
    if (!onStatusChange || !onAddTask) {
      console.warn("Automation failed: Missing handlers", { hasStatusHandler: !!onStatusChange, hasAddHandler: !!onAddTask });
      return "No se pudo iniciar la automatización debido a un error de configuración.";
    }

    setMessages(prev => [...prev, { role: 'bot', text: '🔄 Iniciando automatización: Procesando tableros y cargando horas...' }]);

    try {
      // 1. Update existing tasks to 'Done'
      const pendingTasks = tasks.filter(t => t.estado !== 'Done');
      console.log(`Found ${pendingTasks.length} pending tasks to complete.`);
      
      if (pendingTasks.length > 0) {
        for (const task of pendingTasks) {
          console.log(`Completing task: ${task.proyecto}`);
          await onStatusChange(task.id, 'Done');
        }
      }

      // 2. Log 8 hours for today if not already logged
      const today = new Date().toISOString().split('T')[0];
      const userName = userSettings?.displayName || 'Leandro Caponetto';
      
      const todayTasks = tasks.filter(t => t.fecha === today && t.cliente === userName);
      const totalHoursToday = todayTasks.reduce((acc, t) => acc + (t.total_horas || 0), 0);

      let tasksForReport = tasks.map(t => ({ ...t, estado: 'Done' as TaskStatus }));

      if (totalHoursToday < 8) {
        const hoursToLog = 8 - totalHoursToday;
        console.log(`Logging ${hoursToLog} hours for today.`);
        
        const newTaskData = {
          fecha: today,
          cliente: userName,
          proyecto: 'Gestión de Tiempos',
          descripcion: 'Automatización de tareas y cierre de jornada asistido por IA.',
          categoria: TaskCategory.Desarrollo,
          hora_inicio: '09:00',
          hora_fin: '17:00',
          total_horas: hoursToLog,
          estado: 'Done' as TaskStatus,
          etiquetas: ['IA', 'Automatización']
        };

        await onAddTask(newTaskData);
        
        // Add to the list for the report
        tasksForReport.push({ ...newTaskData, id: 'temp-id' } as Task);
        
        setMessages(prev => [...prev, { role: 'bot', text: `✅ Tableros actualizados y se han cargado las ${hoursToLog} horas restantes para hoy (${today}).` }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: `✅ Tableros actualizados. Ya tenías las 8 horas cargadas para hoy.` }]);
      }

      if (tasksForReport.length === 0) {
        return "No hay tareas registradas para generar un reporte.";
      }

      setMessages(prev => [...prev, { role: 'bot', text: '📧 Generando reporte PDF y enviando correo de confirmación...' }]);

      // 3. Call server to send email and PDF
      console.log("Calling automation API...");
      const response = await fetch('/api/automate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasksForReport,
          userEmail: userEmail || 'caponettopeppers@gmail.com'
        })
      });

      const result = await response.json();
      console.log("Automation API response:", result);

      if (result.success) {
        const sentTo = userEmail || 'caponettopeppers@gmail.com';
        return `✅ ¡Todo listo! He completado tus tableros, cargado las 8 horas de hoy y te he enviado el correo con el PDF adjunto a **${sentTo}**. (Ref: ${result.messageId || 'N/A'})`;
      } else if (result.pdfData) {
        // Fallback: provide download link if email failed due to config
        const link = document.createElement('a');
        link.href = result.pdfData;
        link.download = `Tareas_${today}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return `⚠️ **El correo no se pudo enviar porque falta configurar la contraseña de aplicación.**\n\nSin embargo, **he generado el PDF y lo he descargado automáticamente** para que lo tengas.\n\n${result.instructions}`;
      } else {
        return "⚠️ Error del servidor: " + result.error;
      }
    } catch (error: any) {
      console.error("Automation error:", error);
      return "❌ Error durante el proceso: " + error.message;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Check for automation command
    const lowerMsg = userMsg.toLowerCase();
    const isAutomationRequest = 
      (lowerMsg.includes("realiza") && (lowerMsg.includes("tarea") || lowerMsg.includes("tareas"))) ||
      (lowerMsg.includes("completa") && (lowerMsg.includes("tarea") || lowerMsg.includes("tareas"))) ||
      lowerMsg.includes("automatiza") ||
      lowerMsg.includes("hace mis tareas") ||
      lowerMsg.includes("hacer mis tareas");

    if (isAutomationRequest) {
      console.log("Automation request detected:", userMsg);
      const autoResult = await handleAutomation();
      setMessages(prev => [...prev, { role: 'bot', text: autoResult }]);
      setIsLoading(false);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_KEY;      // ✅ Verifica que el nombre coincida con tu archivo .env

      
      if (!apiKey) {
        throw new Error("No se encontró la clave de API de Gemini. Por favor, asegúrate de que GEMINI_API_KEY esté configurada en los Secretos de AI Studio.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Eres un asistente inteligente experto del Correo Argentino. Tu objetivo es ayudar a los usuarios con información sobre el sistema de gestión de tareas, productividad y consultas generales sobre la empresa. Sé profesional, amable y conciso. Si el usuario te pide realizar o automatizar tareas (como "completa mis tareas", "hace mis tareas", "automatiza"), dile que puedes hacerlo y que procederás a completar los tableros y enviar el reporte por mail.'
        }
      });

      const responseText = response.text;
      setMessages(prev => [...prev, { role: 'bot', text: responseText || 'Lo siento, no pude procesar tu solicitud.' }]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Ocurrió un error al conectar con la IA. Por favor, intenta de nuevo más tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
            className="absolute bottom-20 left-0 w-80 sm:w-96 h-[450px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-correo-blue p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-correo-yellow rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-correo-blue" />
                </div>
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-widest">Asistente IA</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[8px] text-white/70 font-bold uppercase tracking-widest">En línea</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-slate-50/50 dark:bg-slate-950/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs ${
                    msg.role === 'user' 
                      ? 'bg-correo-blue text-white rounded-br-none shadow-lg' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                  }`}>
                    <div className="markdown-body prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                    <Loader2 className="w-4 h-4 text-correo-blue animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu consulta..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-xs focus:ring-2 focus:ring-correo-blue transition-all dark:text-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-correo-blue text-white rounded-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 1, -1, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className={`relative w-16 h-16 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group overflow-hidden border-4 border-white dark:border-slate-800 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-correo-yellow'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center scale-90">
            {/* Custom SVG Robot - Correo Argentino Style */}
            <svg viewBox="0 0 100 100" className="w-14 h-14 drop-shadow-lg">
              {/* Box on top */}
              <rect x="35" y="5" width="30" height="20" fill="#D2B48C" rx="2" />
              <path d="M35 15 H65" stroke="#C19A6B" strokeWidth="1" />
              <path d="M50 5 V25" stroke="#C19A6B" strokeWidth="1" />
              
              {/* Tray */}
              <path d="M30 25 H70 L75 32 H25 Z" fill="#FFA500" />
              
              {/* Body */}
              <rect x="28" y="32" width="44" height="38" rx="8" fill="#FFCE00" />
              <rect x="32" y="38" width="36" height="26" rx="4" fill="#1A1A1A" />
              
              {/* Eyes */}
              <circle cx="42" cy="48" r="4" fill="white" />
              <circle cx="58" cy="48" r="4" fill="white" />
              
              {/* Smile */}
              <path d="M45 56 Q50 60 55 56" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              
              {/* Wheels */}
              <rect x="24" y="65" width="10" height="20" rx="5" fill="#333" />
              <rect x="66" y="65" width="10" height="20" rx="5" fill="#333" />
              
              {/* Waving Arm */}
              <motion.g
                animate={{ rotate: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: "28px", originY: "45px" }}
              >
                <rect x="15" y="40" width="15" height="8" rx="4" fill="#333" />
                <path d="M15 44 Q10 44 8 35" stroke="#333" strokeWidth="6" fill="none" strokeLinecap="round" />
                {/* Hand */}
                <circle cx="8" cy="32" r="5" fill="#333" />
              </motion.g>
              
              {/* Logo text */}
              <text x="50" y="66" fontSize="4" fontWeight="bold" fill="#1A1A1A" textAnchor="middle" fontFamily="sans-serif">CORREO</text>
            </svg>
            
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        )}
        
        {/* Notificación flotante */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-full ml-3 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 whitespace-nowrap hidden sm:block"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-correo-yellow" />
              <span className="text-[8px] font-black uppercase tracking-widest text-correo-blue dark:text-white">IA Activa</span>
            </div>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatBot;
