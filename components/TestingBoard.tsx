
import React, { useState, useMemo } from 'react';
import { 
  Folder, FolderPlus, Search, ChevronRight, ChevronDown, 
  MoreHorizontal, Plus, FileCode, LayoutPanelLeft, ListFilter,
  ClipboardCheck, Sparkles, X, Check, Filter as FilterIcon,
  Calendar, Layers, ShieldCheck, Activity, Terminal, Database, Loader2
} from 'lucide-react';

const MOCK_TESTS = [
  { id: 'T-101', title: 'Validación API Cotizador', day: '05', status: 'Passed', type: 'Manual', hours: 2.5 },
  { id: 'T-102', title: 'Prueba de Carga Sorter', day: '12', status: 'Failed', type: 'Automated', hours: 4 },
  { id: 'T-103', title: 'Regresión UI Intranet', day: '18', status: 'Executing', type: 'Manual', hours: 1.5 },
  { id: 'T-104', title: 'Integración Meli V3', day: '22', status: 'To Do', type: 'Automated', hours: 3 },
];

const TestingBoard: React.FC = () => {
  const [selectedFolderId, setSelectedFolderId] = useState('feb-2026');
  const [isRootExpanded, setIsRootExpanded] = useState(true);

  const folders = [
    { 
      id: 'root', 
      name: 'Test Repository', 
      count: '150 (450)', 
      subfolders: [
        { id: 'jan-2026', name: 'Enero 2026', count: '45 (120)' },
        { id: 'feb-2026', name: 'Febrero 2026', count: '55 (180)' },
        { id: 'mar-2026', name: 'Marzo 2026', count: '50 (150)' }
      ]
    }
  ];

  const selectedFolderName = useMemo(() => {
    if (selectedFolderId === 'root') return 'Test Repository';
    return folders[0].subfolders.find(f => f.id === selectedFolderId)?.name || 'Unknown Folder';
  }, [selectedFolderId]);

  return (
    <div className="flex h-[750px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden animate-in fade-in duration-500 relative shadow-2xl">
      <div className="w-10 bg-[#0747a6] dark:bg-slate-900 flex flex-col items-center py-4 gap-8 border-r border-blue-800 dark:border-slate-800 shrink-0">
        <div className="relative h-24 w-full flex items-center justify-center cursor-pointer group">
          <span className="absolute rotate-[-90deg] whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-white">Folders</span>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" />
        </div>
      </div>

      <div className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/50 shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Repository</span>
          <FolderPlus className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-blue-500" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {folders.map(folder => (
            <div key={folder.id} className="space-y-1">
              <div 
                className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer ${selectedFolderId === folder.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => { setIsRootExpanded(!isRootExpanded); setSelectedFolderId(folder.id); }}
              >
                {isRootExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <Folder className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-bold flex-1 truncate">{folder.name}</span>
              </div>
              
              {isRootExpanded && (
                <div className="ml-4 space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-2">
                  {folder.subfolders.map(sub => (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedFolderId(sub.id)}
                      className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer ${selectedFolderId === sub.id ? 'bg-blue-100/50 dark:bg-blue-900/40' : ''}`}
                    >
                      <Folder className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-medium">{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tighter italic">
              Repository: {selectedFolderName}
            </h2>
            <div className="flex items-center gap-2">
              <button className="bg-[#0052cc] text-white px-4 py-1.5 text-xs font-bold rounded shadow-lg hover:bg-[#0747a6]">
                New Test Case
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <table className="w-full border-collapse bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Resumen de Prueba</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Estado</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {MOCK_TESTS.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[11px] font-black text-blue-600">QA-{test.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{test.title}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-0.5">{test.type} • Día {test.day} Feb 2026</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${test.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestingBoard;
