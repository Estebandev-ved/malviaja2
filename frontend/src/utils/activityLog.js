const KEY = 'admin_activity_log';

export const logActivity = (tipo, descripcion, usuario = 'Admin') => {
  const logs = JSON.parse(localStorage.getItem(KEY) || '[]');
  logs.unshift({ id: Date.now(), tipo, descripcion, usuario, fecha: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(logs.slice(0, 500)));
};

export const getLogs = () => JSON.parse(localStorage.getItem(KEY) || '[]');

export const clearLogs = () => localStorage.removeItem(KEY);
