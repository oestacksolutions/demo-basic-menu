const SECRETO_BASE = import.meta.env.VITE_JWT_SECRET || 'oestack-menu-basica-jwt-2026'
const DURACION_SEGUNDOS = 60 * 60 * 8

const enc = new TextEncoder()

function aBase64Url(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function desdeBase64Url(str) {
  const pad = str.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(pad)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function compararSeguro(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function obtenerClaveHmac(slug) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(`${SECRETO_BASE}:${slug}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function hashPassword(password) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(password))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function firmarJwt({ email, slug }) {
  const ahora = Math.floor(Date.now() / 1000)
  const header = aBase64Url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const payload = aBase64Url(
    enc.encode(JSON.stringify({ sub: email, slug, iat: ahora, exp: ahora + DURACION_SEGUNDOS })),
  )
  const datos = `${header}.${payload}`
  const clave = await obtenerClaveHmac(slug)
  const firma = await crypto.subtle.sign('HMAC', clave, enc.encode(datos))
  return `${datos}.${aBase64Url(firma)}`
}

export async function verificarJwt(token, slugEsperado) {
  try {
    if (!token || typeof token !== 'string') return null
    const partes = token.split('.')
    if (partes.length !== 3) return null
    const [headerB64, payloadB64, firmaB64] = partes
    const clave = await obtenerClaveHmac(slugEsperado)
    const valido = await crypto.subtle.verify(
      'HMAC',
      clave,
      desdeBase64Url(firmaB64),
      enc.encode(`${headerB64}.${payloadB64}`),
    )
    if (!valido) return null
    const payload = JSON.parse(new TextDecoder().decode(desdeBase64Url(payloadB64)))
    const ahora = Math.floor(Date.now() / 1000)
    if (payload.slug !== slugEsperado || !payload.exp || payload.exp <= ahora) return null
    return payload
  } catch {
    return null
  }
}

export async function iniciarSesionAdmin({ email, password, local }) {
  const correoIngresado = email.trim().toLowerCase()
  const correoValido = (local?.admin?.email || import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase()
  const hashGuardado = local?.admin?.passwordHash || ''
  const passEnv = import.meta.env.VITE_ADMIN_PASSWORD || ''

  if (!correoValido || !compararSeguro(correoIngresado, correoValido)) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }

  const hashIngresado = await hashPassword(password)
  const hashEnv = passEnv ? await hashPassword(passEnv) : ''
  const coincide = compararSeguro(hashIngresado, hashGuardado) || (hashEnv && compararSeguro(hashIngresado, hashEnv))

  if (!coincide) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }

  const token = await firmarJwt({ email: correoValido, slug: local.slug })
  sessionStorage.setItem(`oestack_jwt_${local.slug}`, token)
  return { ok: true, token }
}

export function obtenerTokenAdmin(slug) {
  return sessionStorage.getItem(`oestack_jwt_${slug}`)
}

export function cerrarSesionAdmin(slug) {
  sessionStorage.removeItem(`oestack_jwt_${slug}`)
}
