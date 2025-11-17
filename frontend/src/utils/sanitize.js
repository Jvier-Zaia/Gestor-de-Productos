/**
 * Utilidades para sanitización de datos
 * Previene XSS y valida/limpia inputs del usuario
 */

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} input - String a sanitizar
 * @param {boolean} escapeHTML - Si debe escapar HTML (default: false para inputs normales)
 * @param {boolean} allowSpaces - Si debe permitir espacios (default: true)
 * @returns {string} - String sanitizado
 */
export const sanitizeString = (input, escapeHTML = false, allowSpaces = true) => {
  if (typeof input !== 'string') {
    return String(input || '');
  }

  let sanitized = input;
  
  // Remueve caracteres peligrosos siempre
  sanitized = sanitized
    .replace(/javascript:/gi, '') // Remueve javascript:
    .replace(/on\w+=/gi, '') // Remueve event handlers como onclick=
    .replace(/data:/gi, '') // Remueve data: URLs
    .replace(/vbscript:/gi, ''); // Remueve vbscript:
  
  // Solo escapa HTML si se solicita explícitamente
  if (escapeHTML) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } else {
    // Solo remueve tags HTML peligrosos sin escaparlos
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Solo trim al final si no estamos en medio de escribir
  // Esto permite espacios durante la escritura
  return sanitized;
};

/**
 * Sanitiza un nombre de producto (permite espacios y caracteres normales)
 * @param {string} input - Nombre a sanitizar
 * @returns {string} - Nombre sanitizado
 */
export const sanitizeProductName = (input) => {
  if (typeof input !== 'string') {
    return String(input || '');
  }
  
  // Permite letras, números, espacios, guiones, puntos, comas, paréntesis
  // Solo remueve caracteres peligrosos pero mantiene espacios
  return input
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/<[^>]*>/g, '');
};

/**
 * Sanitiza un email
 * @param {string} email - Email a sanitizar
 * @returns {string} - Email sanitizado
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  const sanitized = sanitizeString(email).toLowerCase();
  // Validación básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Formato de email inválido');
  }
  
  return sanitized;
};

/**
 * Sanitiza un número
 * @param {string|number} input - Número a sanitizar
 * @param {object} options - Opciones { min, max, allowDecimals }
 * @returns {number} - Número sanitizado
 */
export const sanitizeNumber = (input, options = {}) => {
  const { min = -Infinity, max = Infinity, allowDecimals = true } = options;
  
  // Convierte a string y limpia caracteres no numéricos (excepto punto y signo negativo)
  const cleaned = String(input || '').trim().replace(/[^0-9.-]/g, '');
  
  if (!cleaned || cleaned === '-' || cleaned === '.') {
    throw new Error('Valor numérico inválido');
  }
  
  let num = parseFloat(cleaned);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Valor numérico inválido');
  }
  
  if (!allowDecimals) {
    num = Math.floor(Math.abs(num)) * (num < 0 ? -1 : 1);
  }
  
  if (num < min) {
    throw new Error(`El valor debe ser mayor o igual a ${min}`);
  }
  
  if (num > max) {
    throw new Error(`El valor debe ser menor o igual a ${max}`);
  }
  
  return num;
};

/**
 * Sanitiza un objeto completo
 * @param {object} obj - Objeto a sanitizar
 * @param {object} schema - Esquema de sanitización { field: 'string'|'email'|'number' }
 * @returns {object} - Objeto sanitizado
 */
export const sanitizeObject = (obj, schema) => {
  const sanitized = {};
  
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in obj)) continue;
    
    try {
      switch (type) {
        case 'string':
          sanitized[key] = sanitizeString(obj[key]);
          break;
        case 'email':
          sanitized[key] = sanitizeEmail(obj[key]);
          break;
        case 'number':
          sanitized[key] = sanitizeNumber(obj[key]);
          break;
        case 'numberInt':
          sanitized[key] = sanitizeNumber(obj[key], { allowDecimals: false });
          break;
        default:
          sanitized[key] = sanitizeString(obj[key]);
      }
    } catch (error) {
      throw new Error(`Error en campo ${key}: ${error.message}`);
    }
  }
  
  return sanitized;
};

/**
 * Valida y sanitiza una contraseña
 * @param {string} password - Contraseña a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima (default: 128)
 * @returns {string} - Contraseña validada
 */
export const validatePassword = (password, minLength = 6, maxLength = 128) => {
  if (!password || typeof password !== 'string') {
    throw new Error('La contraseña es requerida');
  }
  
  const trimmed = password.trim();
  
  if (trimmed.length < minLength) {
    throw new Error(`La contraseña debe tener al menos ${minLength} caracteres`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`La contraseña no puede tener más de ${maxLength} caracteres`);
  }
  
  // No sanitizamos la contraseña (para permitir caracteres especiales),
  // pero validamos que no contenga caracteres de control peligrosos
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    throw new Error('La contraseña contiene caracteres inválidos');
  }
  
  return trimmed;
};

/**
 * Sanitiza HTML (para descripciones y textos largos)
 * @param {string} html - HTML a sanitizar
 * @returns {string} - HTML sanitizado (solo texto plano, sin HTML)
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Por seguridad, removemos todo el HTML y devolvemos solo texto plano
  // Esto previene cualquier tipo de ataque XSS
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remueve scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remueve iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remueve objects
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remueve embeds
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '') // Remueve links
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remueve estilos
    .replace(/<[^>]+>/g, '') // Remueve todos los demás tags HTML
    .replace(/&nbsp;/g, ' ') // Convierte &nbsp; a espacio
    .replace(/&amp;/g, '&') // Convierte &amp; a &
    .replace(/&lt;/g, '<') // Convierte &lt; a <
    .replace(/&gt;/g, '>') // Convierte &gt; a >
    .replace(/&quot;/g, '"') // Convierte &quot; a "
    .replace(/&#x27;/g, "'") // Convierte &#x27; a '
    .trim();
};

