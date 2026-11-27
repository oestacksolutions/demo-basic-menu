import { normalizarTexto } from './texto'

const archivos = import.meta.glob('../data/locales/*.json', {
  eager: true,
  import: 'default',
})

const localesBase = Object.fromEntries(
  Object.values(archivos).map((local) => [local.slug, local]),
)

const claveStorage = (slug) => `oestack_local_${slug}`

function resolverImagen(slug, imagen) {
  if (!imagen) return null
  if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:')) {
    return imagen
  }
  return `/locales/${slug}/${imagen}`
}

function normalizar(local) {
  return {
    ...local,
    whatsapp: local.whatsapp || '',
    instagram: local.instagram || '',
    logo: resolverImagen(local.slug, local.logo),
    categorias: (local.categorias || []).map((categoria) => ({
      activa: categoria.activa !== false,
      ...categoria,
      productos: (categoria.productos || []).map((producto) => ({
        ...producto,
        _indiceBusqueda: normalizarTexto(
          `${producto.nombre} ${producto.descripcion || ''} ${categoria.nombre}`,
        ),
      })),
    })),
  }
}

export function leerLocalCrudo(slug) {
  const base = localesBase[slug]
  if (!base) return null
  try {
    const guardado = localStorage.getItem(claveStorage(slug))
    return guardado ? { ...base, ...JSON.parse(guardado) } : structuredClone(base)
  } catch {
    return structuredClone(base)
  }
}

export async function getLocal(slug) {
  const crudo = leerLocalCrudo(slug)
  return crudo ? normalizar(crudo) : null
}

export function guardarLocal(slug, datosActualizados) {
  const limpio = {
    ...datosActualizados,
    categorias: datosActualizados.categorias.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      activa: cat.activa !== false,
      productos: cat.productos.map(({ _indiceBusqueda, imagen: _imagen, ...prod }) => prod),
    })),
  }
  localStorage.setItem(claveStorage(slug), JSON.stringify(limpio))
  return normalizar(limpio)
}

export function restaurarLocal(slug) {
  localStorage.removeItem(claveStorage(slug))
  const base = localesBase[slug]
  return base ? normalizar(base) : null
}
