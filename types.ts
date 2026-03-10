
export enum TaskCategory {
  Desarrollo = 'Desarrollo',
  QA = 'QA',
  Meeting = 'Meeting',
  Research = 'Research',
  Admin = 'Admin'
}

export type TaskStatus = 'Backlog' | 'In Progress' | 'To Review' | 'Done';

export interface Task {
  id: string;
  fecha: string;
  cliente: string;
  proyecto: string;
  descripcion: string;
  categoria: TaskCategory;
  hora_inicio: string;
  hora_fin: string;
  total_horas: number;
  etiquetas: string[];
  estado: TaskStatus;
  user_id?: string;
}

export interface UserSettings {
  displayName: string;
  role: string;
  avatarUrl: string;
  language: 'es' | 'en';
  timeFormat: '12h' | '24h';
  notifications: boolean;
  employeeId: string;
}

export type ViewType = 'dashboard' | 'registro' | 'reportes' | 'configuracion' | 'monitoreo' | 'comunicaciones';
