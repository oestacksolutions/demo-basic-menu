import { useEffect, useRef, useState } from 'react'
import { useIdioma } from '../context/useIdioma'

const idSeccion = (categoria) => 'categoria-' + categoria.id

export default function NavCategorias({ categorias }) {
  const { tr } = useIdioma()
  const [activa, setActiva] = useState(categorias[0]?.id)
  const contenedor = useRef(null)

  useEffect(() => {
    const visibles = new Set()
    const elegir = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) { setActiva(categorias[categorias.length - 1].id); return }
      const primera = categorias.find((c) => visibles.has(c.id))
      if (primera) setActiva(primera.id)
    }
    const observer = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => { const id = entrada.target.dataset.categoria; if (entrada.isIntersecting) visibles.add(id); else visibles.delete(id) })
      elegir()
    }, { rootMargin: '-64px 0px -60% 0px' })
    categorias.forEach((categoria) => { const seccion = document.getElementById(idSeccion(categoria))?.closest('section'); if (!seccion) return; seccion.dataset.categoria = categoria.id; observer.observe(seccion) })
    window.addEventListener('scroll', elegir, { passive: true })
    return () => { observer.disconnect(); window.removeEventListener('scroll', elegir) }
  }, [categorias])

  useEffect(() => {
    const barra = contenedor.current
    const enlace = barra?.querySelector('[aria-current]')
    if (!enlace) return
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    barra.scrollTo({ left: enlace.offsetLeft - (barra.clientWidth - enlace.offsetWidth) / 2, behavior: sinMovimiento ? 'auto' : 'smooth' })
  }, [activa])

  return (
    <nav className="nav" aria-label="Categorías">
      <div className="nav__barra contenedor" ref={contenedor}>
        <ul>{categorias.map((categoria) => (<li key={categoria.id}><a href={'#' + idSeccion(categoria)} aria-current={activa === categoria.id ? 'true' : undefined}>{tr(categoria.nombre)}</a></li>))}</ul>
      </div>
    </nav>
  )
}
