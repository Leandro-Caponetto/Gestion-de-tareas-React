
import * as XLSX from 'xlsx';
import { Task } from '../types';

export const handleExport = (tasks: Task[]) => {
  const data = tasks.map(t => ({
    'Fecha': t.fecha,
    'Cliente': t.cliente,
    'Proyecto': t.proyecto,
    'Categoría': t.categoria,
    'Descripción': t.descripcion,
    'Inicio': t.hora_inicio,
    'Fin': t.hora_fin,
    'Horas': t.total_horas,
    'Etiquetas': t.etiquetas.join(', '),
    'Estado': t.estado
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

  // Generate buffer and download
  XLSX.writeFile(workbook, `TaskPulse_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
