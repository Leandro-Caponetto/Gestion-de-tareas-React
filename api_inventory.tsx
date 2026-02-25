export interface ApiEndpoint {
  id: string;
  name: string;
  namespace: string;
  environment: 'DEV' | 'TEST';
  url: string;        // URL de salud (Health Check)
  logsUrl?: string;   // URL visual de OpenShift (Enlace externo)
  method: 'GET' | 'POST';
  expectedStatus: number;
}

export const API_NAMESPACES = [
    'api-pas-dev',
  'plataforma-notificacion-dev',  
  'apipaqar-dev',
  'comunidad-dev',
  'RRHH',
  'Seguridad' // Agregado porque lo usas abajo
];

export const API_INVENTORY: ApiEndpoint[] = [
  // plataforma-notificaciones
  { 
  id: 'log-1', 
  name: 'notification-email', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-email-965bbf57d-26j7x/logs',
  method: 'GET', 
  expectedStatus: 200 
},
{ 
  id: 'log-2', 
  name: 'notification-gateway', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-gateway-7b98859968-6f6x4/logs',
  method: 'GET', 
  expectedStatus: 200 
},
  // Logística
 { 
  id: 'log-3', 
  name: 'notification-generic', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-generic-8d975cb8-cfjwb/logs',
  method: 'GET', 
  expectedStatus: 200 
},
   { 
  id: 'log-4', 
  name: 'notification-meli', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-meli-87795b559-dzqmp/logs',
  method: 'GET', 
  expectedStatus: 200 
},
   { 
  id: 'log-5', 
  name: 'notification-producer', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-producer-dbb489db4-5vndd/logs',
  method: 'GET', 
  expectedStatus: 200 
},
   { 
  id: 'log-6', 
  name: 'notification-backoffice', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notifications-backoffice-6bc4b85c9-w2wx6/logs',
  method: 'GET', 
  expectedStatus: 200 
},
  { 
  id: 'log-7', 
  name: 'notification-sms', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-sms-567b9ccf84-wzrvk/logs',
  method: 'GET', 
  expectedStatus: 200 
},
 { 
  id: 'log-8', 
  name: 'notification-whatsapp', 
  namespace: 'plataforma-notificacion-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/plataforma-notificacion-dev/pods/notification-whatsapp-648799c5b9-ks7tv/logs',
  method: 'GET', 
  expectedStatus: 200 
},
  
  // api-pas-dev
 
 { 
  id: 'pas-1', 
  name: 'apipas', 
  namespace: 'api-pas-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/api-pas-dev/pods/apipas-75947987fb-p6xv7/logs',
  method: 'GET', 
  expectedStatus: 200 
},
   { 
  id: 'pas-2', 
  name: 'apipas-whatsapp', 
  namespace: 'api-pas-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/api-pas-dev/pods/apipas-whatsapp-8654cc5dbf-kprhm/logs',
  method: 'GET', 
  expectedStatus: 200 
},
  // apipaqar-dev
   { 
  id: 'paq-1', 
  name: 'apipaqar', 
  namespace: 'apipaqar-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
  url: 'https://httpbin.org/status/200', 
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/apipaqar-dev/pods/apipaqar-675d7fddd9-q9zdr/logs',
  method: 'GET', 
  expectedStatus: 200 
},
  { 
  id: 'paq-2', 
  name: 'backoffice-paqar', 
  namespace: 'apipaqar-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
    url: 'https://httpbin.org/status/200',
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/apipaqar-dev/pods/backoffice-paqar-7d8df69977-w9b52/logs',
  method: 'GET', 
  expectedStatus: 200 
  },

  // comunidad-dev
  { 
  id: 'com-1', 
  name: 'backoffice-frontend', 
  namespace: 'comunidad-dev', 
  environment: 'DEV', 
  // 🟢 Cambiamos a una URL que SIEMPRE responda para validar que tu app funciona
    url: 'https://httpbin.org/status/200',
  // 🔗 El link de OpenShift queda solo para el botón
  logsUrl: 'https://console-openshift-console.apps.ocpbarr.correo.local/k8s/ns/comunidad-dev/pods/backoffice-frontend-7d7588c75d-jwdhx/logs',
  method: 'GET', 
  expectedStatus: 200 
  },
];