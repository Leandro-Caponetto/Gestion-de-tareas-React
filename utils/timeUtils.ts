
export const calculateDuration = (start: string, end: string): number => {
  if (!start || !end) return 0;
  
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  if (endMinutes < startMinutes) {
    // Handling overflow to next day (optional, assuming tasks are within same day for simplicity)
    endMinutes += 24 * 60;
  }
  
  return parseFloat(((endMinutes - startMinutes) / 60).toFixed(2));
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(date);
};
