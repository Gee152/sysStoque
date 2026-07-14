function checkEmpty(paramether: string | number | undefined | null): boolean {
  if (paramether === undefined || paramether === null) return true
  if (typeof paramether === 'string') {
    paramether = paramether.trim()
  }
  return paramether === ''
}

function checkStringEmpty(paramether: string | undefined | null): boolean {
  return paramether === undefined || paramether === null || paramether.trim() === ''
}

function checkNumberEmpty(paramether: number | undefined | null): boolean {
  return paramether === undefined || paramether === null || Number.isNaN(paramether)
}

function checkEmptyList(paramether: Array<any> | undefined | null): boolean {
  return paramether === undefined || paramether === null || paramether.length === 0
}

function validateEmail(email: string): boolean {
  const re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

function checkEmptyDate(paramether: Date | undefined | null): boolean {
  return paramether === undefined || paramether === null
}

function checkNotExistEnum(enumType: any, value: any): boolean {
  return !Object.values(enumType)
    .map((v: any) => typeof v === 'string' ? v.toLowerCase() : v)
    .includes(typeof value === 'string' ? value.toLowerCase() : value)
}

function checkBooleanEmpty(e: boolean | undefined | null): boolean {
  return e === undefined || e === null
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
}
