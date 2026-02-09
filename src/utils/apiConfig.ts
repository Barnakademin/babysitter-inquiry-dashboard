/**
 * Получает базовый URL для API запросов (для использования вне React компонентов)
 * Fallback функция для случаев, когда React хуки недоступны
 */
export const getApiBaseUrlStatic = (hostname: string = window.location.hostname): string => {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '10.5.0.2') {
    return 'https://solidumsverige.by/json';
  }
  
  if (hostname === 'dev.solidumsverige.se') {
    return 'https://dev.solidumsverige.se/json';
  }
  
  if (hostname === 'solidumsverige.by') {
    return 'https://solidumsverige.by/json';
  }
  
  if (hostname === 'solidumsverige.se' || 
      hostname.includes('lovable.app') || 
      hostname.includes('lovableproject.com')) {
    return 'https://solidumsverige.se/json';
  }
  
  // Fallback для других доменов
  return 'https://solidumsverige.se/json';
};

/**
 * Получает базовый URL для API действий (для использования вне React компонентов)
 */
export const getApiActionUrlStatic = (hostname: string = window.location.hostname): string => {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '10.5.0.2') {
    return window.location.origin;
  }

  if (hostname === 'dev.solidumsverige.se') {
    return 'https://dev.solidumsverige.se';
  }

  if (hostname === 'solidumsverige.by') {
    return 'https://solidumsverige.by';
  }

  if (hostname === 'solidumsverige.se' ||
      hostname.includes('lovable.app') ||
      hostname.includes('lovableproject.com')) {
    return 'https://solidumsverige.se';
  }

  // Fallback для других доменов
  return 'https://solidumsverige.se';
};
