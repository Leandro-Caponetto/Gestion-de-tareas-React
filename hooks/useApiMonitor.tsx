import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiEndpoint } from '../api_inventory';

export interface ApiStatus {
  endpointId: string;
  health: 'UP' | 'DOWN' | 'DEGRADED' | 'PENDING';
  latency: number;
  lastCheck: string;
  statusText: string;
  statusCode?: number;
}

export interface ApiLog {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN';
  message: string;
  endpointId: string;
}

export const useApiMonitor = (endpoints: ApiEndpoint[]) => {
  const [statuses, setStatuses] = useState<Record<string, ApiStatus>>({});
  const [logs, setLogs] = useState<ApiLog[]>([]);
  
  // Usamos un ref para evitar colisiones en actualizaciones rápidas de logs
  const logsRef = useRef<ApiLog[]>([]);

  const addLog = useCallback((level: 'INFO' | 'ERROR' | 'WARN', message: string, endpointId: string) => {
    const newLog: ApiLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      endpointId
    };
    logsRef.current = [newLog, ...logsRef.current].slice(0, 100);
    setLogs(logsRef.current);
  }, []);

  const checkEndpoint = useCallback(async (endpoint: ApiEndpoint) => {
    const startTime = performance.now();
    
    // Ignorar URLs de logs de OpenShift para el fetch de salud
    if (endpoint.url.includes('console-openshift')) {
       addLog('ERROR', `[${endpoint.name}] Configuración Inválida: La URL apunta a la Consola UI, no a una API.`, endpoint.id);
       return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Aumentado a 8s para redes lentas

      const response = await fetch(endpoint.url, { 
        method: endpoint.method,
        signal: controller.signal,
        // ✅ IMPORTANTE: mode 'no-cors' no sirve para APIs, necesitamos que el servidor permita CORS.
        // Pero añadimos esto para intentar obtener una respuesta opaca si es necesario.
        mode: 'cors',
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);

      const latency = Math.round(performance.now() - startTime);
      let health: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';

      // Lógica de validación de estado
      if (response.status !== endpoint.expectedStatus) {
        health = 'DOWN';
        addLog('ERROR', `[${endpoint.name}] HTTP ${response.status}: Acceso denegado o Recurso no encontrado.`, endpoint.id);
      } else if (latency > 1500) { // Umbral de degradación ajustado para red interna
        health = 'DEGRADED';
        addLog('WARN', `[${endpoint.name}] Latencia Elevada: ${latency}ms`, endpoint.id);
      } else {
        // Solo log de INFO si cambia algo o es el primero para no saturar la consola
        addLog('INFO', `[${endpoint.name}] Nodo Operativo (${latency}ms)`, endpoint.id);
      }

      setStatuses(prev => ({
        ...prev,
        [endpoint.id]: {
          endpointId: endpoint.id,
          health,
          latency,
          lastCheck: new Date().toLocaleTimeString(),
          statusText: response.statusText || 'OK',
          statusCode: response.status
        }
      }));

    } catch (error: any) {
      const latency = Math.round(performance.now() - startTime);
      const isTimeout = error.name === 'AbortError';
      
      // ✅ DIAGNÓSTICO SENIOR PARA "FAILED TO FETCH"
      let errorMessage = error.message;
      if (errorMessage === 'Failed to fetch') {
        errorMessage = 'Fallo de Red / CORS / SSL. Verifica VPN o Certificado.';
      }

      addLog('ERROR', `[${endpoint.name}] Critical: ${isTimeout ? 'Timeout (8s)' : errorMessage}`, endpoint.id);
      
      setStatuses(prev => ({
        ...prev,
        [endpoint.id]: {
          endpointId: endpoint.id,
          health: 'DOWN',
          latency,
          lastCheck: new Date().toLocaleTimeString(),
          statusText: isTimeout ? 'Timeout' : 'Offline/CORS',
          statusCode: 0
        }
      }));
    }
  }, [addLog]);

  useEffect(() => {
    // Primera carga
    endpoints.forEach(ep => checkEndpoint(ep));

    // Polling cada 30 segundos para no sobrecargar el navegador
    const interval = setInterval(() => {
      endpoints.forEach(ep => checkEndpoint(ep));
    }, 30000); 

    return () => clearInterval(interval);
  }, [endpoints, checkEndpoint]);

  return { statuses, logs };
};