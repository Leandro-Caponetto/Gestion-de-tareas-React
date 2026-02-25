/* import { Task } from '../types';

const JIRA_PROXY_URL = '/api-jira';

// Credenciales desde .env (Asegúrate de que empiecen con VITE_)
const JIRA_EMAIL = import.meta.env.VITE_JIRA_EMAIL || '';
const JIRA_TOKEN = import.meta.env.VITE_JIRA_TOKEN || '';

const getAuthHeader = () => {
  if (!JIRA_EMAIL || !JIRA_TOKEN) {
    console.error("❌ Faltan credenciales en el archivo .env");
    return null;
  }
  const credentials = btoa(`${JIRA_EMAIL.trim()}:${JIRA_TOKEN.trim()}`);
  return `Basic ${credentials}`;
};

export const fetchJiraWorklogs = async () => {
  const authHeader = getAuthHeader();
  if (!authHeader) throw new Error('Configuración incompleta: Credenciales faltantes.');

  // Nueva URL migrada según el error 410
  const url = `${JIRA_PROXY_URL}/rest/api/3/search/jql`;

  try {
    const response = await fetch(url, {
      method: 'POST', // POST es requerido para el nuevo endpoint
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Atlassian-Token': 'no-check' // Salta el error 403 XSRF
      },
      body: JSON.stringify({
        jql: 'worklogAuthor = currentUser() AND worklogDate >= startOfMonth()',
        fields: ['summary', 'status', 'timespent', 'project'],
        maxResults: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403) throw new Error('Error 403: Falló el check XSRF o permisos.');
      if (response.status === 401) throw new Error('Error 401: Token o Email incorrectos.');
      throw new Error(`Jira API Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.issues) return [];

    return data.issues.map((issue: any) => ({
      id: issue.key,
      title: issue.fields.summary || 'Sin título',
      project: issue.fields.project?.name || 'Proyecto Genérico',
      status: issue.fields.status?.name || 'Pendiente',
      hours: issue.fields.timespent 
        ? (Number(issue.fields.timespent) / 3600).toFixed(2) 
        : "0.00",
      type: 'Jira Sync'
    }));

  } catch (error: any) {
    console.error('🔴 Jira Fetch Error:', error.message);
    throw error;
  }
}; */