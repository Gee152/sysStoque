// --- FUNÇÕES EXISTENTES AJUSTADAS COM TYPE GUARDS ---

function checkEmpty(paramether: string | number | undefined | null): boolean {
  if (paramether === undefined || paramether === null) return true;
  if (typeof paramether === 'string') {
    paramether = paramether.trim();
  }
  return paramether === '';
}

// parameter is string diz ao TS que, se retornar false, a variável é uma string segura
function checkStringEmpty(paramether: string | undefined | null): paramether is string {
  return paramether === undefined || paramether === null || paramether.trim() === '';
}

function checkNumberEmpty(paramether: number | undefined | null): boolean {
  return paramether === undefined || paramether === null || Number.isNaN(paramether);
}

function checkEmptyList(paramether: Array<any> | undefined | null): boolean {
  return paramether === undefined || paramether === null || paramether.length === 0;
}

function validateEmail(email: string): boolean {
  const re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkEmptyDate(paramether: Date | undefined | null): boolean {
  return paramether === undefined || paramether === null;
}

function checkNotExistEnum(enumType: any, value: any): boolean {
  return !Object.values(enumType)
    .map((v: any) => typeof v === 'string' ? v.toLowerCase() : v)
    .includes(typeof value === 'string' ? value.toLowerCase() : value);
}

function checkBooleanEmpty(e: boolean | undefined | null): boolean {
  return e === undefined || e === null;
}


// --- 🚀 NOVAS VALIDAÇÕES ADICIONADAS PARA A RFC-002 ---

/**
 * Valida se uma string é um UUID v4 válido (usado para productID e clientID no PostgreSQL)
 */
function validateUUID(uuid: string | undefined | null): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida se o contato está no padrão internacional E.164 (+5581999999999)
 * Garante que o WhatsApp/Telefone venha limpo para a API
 */
function validateContactE164(contact: string | undefined | null): boolean {
  if (!contact) return false;
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(contact);
}

/**
 * Valida se uma data inserida é uma data válida e se está no futuro.
 * Crucial para a regra de negócio do status 'NOTAS' (Follow-up Date)
 */
function checkDateIsPast(date: Date | string | undefined | null): boolean {
  if (!date) return true;
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  // Verifica se a data é inválida (ex: 31 de fevereiro)
  if (Number.isNaN(parsedDate.getTime())) return true;

  // Compara com o timestamp atual
  return parsedDate.getTime() < Date.now();
}

export {
  checkEmpty,
  checkStringEmpty,
  checkNumberEmpty,
  validateEmail,
  checkEmptyList,
  checkEmptyDate,
  checkNotExistEnum,
  checkBooleanEmpty,
  // Novas exportações
  validateUUID,
  validateContactE164,
  checkDateIsPast,
};