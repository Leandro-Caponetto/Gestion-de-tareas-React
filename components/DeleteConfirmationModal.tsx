
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl border-4 border-red-500/10 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header con gradiente de advertencia */}
        <div className="relative h-24 bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
          <div className="absolute top-4 right-6">
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-xl translate-y-8 border-4 border-white dark:border-slate-900">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="px-10 pt-16 pb-10 text-center space-y-4">
          <h3 className="text-2xl font-black text-correo-blue dark:text-white uppercase tracking-tighter italic">
            Confirmar Baja de Registro
          </h3>
          
          <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border-2 border-dashed border-red-100 dark:border-red-900/30">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Elemento a Eliminar</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{taskTitle}"
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
            Esta acción es irreversible y afectará la integridad histórica de sus métricas de <b>Gobierno de Datos</b> y <b>Arquitectura de Tiempos</b>.
          </p>
        </div>

        <div className="px-10 pb-10 grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-2 border-slate-100 dark:border-slate-800"
          >
            Abortar
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Confirmar Baja <AlertTriangle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
