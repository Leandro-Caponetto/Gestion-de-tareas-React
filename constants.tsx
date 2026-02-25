
import { Task, TaskCategory, TaskStatus } from './types';

export const CATEGORIES = Object.values(TaskCategory);
export const STATUS_OPTIONS: TaskStatus[] = ['Backlog', 'In Progress', 'To Review', 'Done'];

export const CLIENTS = [
  'Leandro Caponetto', 
  'Emanuel Miranda', 
  'Omar Cruz', 
  'Emmanuel Echeconea', 
  'Luis Larrondo',
  'Nicolas Golmar'
];

export const PROJECTS: Record<string, string[]> = {
  'Leandro Caponetto': [
    'Rediseño Web', 
    'Jira', 
    'Invgate AI', 
    'Email', 
    'Intranet', 
    'correoargintercotizador',
    'plataforma-notificacion', 
    'sorter-robot', 
    'api-meli', 
    'apipaqar', 
    'comunidad'
  ],
  'Emanuel Miranda': [
    'plataforma-notificacion', 
    'sorter-robot', 
    'comunidad'
  ],
  'Omar Cruz': [
    'Meli', 
    'plataforma-notificacion', 
    'integradorwc', 
    'correoargintercotizador', 
    'api-meli', 
    'apipaqar', 
    'comunidad'
  ],
  'Emmanuel Echeconea': [
    'Tienda Nube', 
    'correoargintercotizador', 
    'sorter-robot'
  ],
  'Luis Larrondo': [
    'Web Institucional', 
    'correoargintercotizador', 
    'Intranet'
  ],
  'Nicolas Golmar': [
    'Tienda Nube', 
    'correoargintercotizador', 
    'sorter-robot'
  ]
};

export const TEAM_MEMBERS = [
  { id: '1', name: 'Leandro Caponetto', initial: 'LC', color: 'bg-blue-600' },
  { id: '2', name: 'Emanuel Miranda', initial: 'EM', color: 'bg-indigo-900' },
  { id: '3', name: 'Omar Cruz', initial: 'OC', color: 'bg-teal-600' },
  { id: '4', name: 'Emmanuel Echeconea', initial: 'EE', color: 'bg-orange-600' },
  { id: '5', name: 'Luis Larrondo', initial: 'LL', color: 'bg-blue-700' },
  { id: '6', name: 'Nicolas Golmar', initial: 'NG', color: 'bg-green-600' }
];
