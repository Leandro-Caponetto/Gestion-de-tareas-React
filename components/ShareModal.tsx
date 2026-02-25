
import React, { useState } from 'react';
import { X, Link as LinkIcon, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Vista compartida con: ${emails}`);
    onClose();
  };

  return (
    /* Overlay invisible para cerrar al hacer clic fuera */
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      
      {/* Contenedor del Popover */}
      <div 
        className="absolute top-[65px] right-[20px] md:right-[40px] w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flecha indicadora (Arrow) */}
        <div className="absolute -top-2 right-12 md:right-11 w-4 h-4 bg-white dark:bg-slate-900 rotate-45 border-t border-l border-slate-200 dark:border-slate-800" />

        <div className="p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share</h3>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Required fields are marked with an asterisk <span className="text-red-500">*</span>
          </p>

          <form onSubmit={handleShare} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Names, teams, or emails <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="e.g. Maria, Team Orange, maria@company.com"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] outline-none transition-all"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                This view, along with any applied groups and filters are shared
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Anything they should know?"
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] outline-none transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-sm font-semibold text-[#42526E] dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                {copySuccess ? 'Copied!' : 'Copy link'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0052cc] hover:bg-[#0747a6] text-white font-semibold rounded-md text-sm transition-colors shadow-sm"
              >
                Share
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
