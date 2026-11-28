import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIdioma } from '../context/useIdioma'
import { useAparecer } from '../lib/useAparecer'
import Producto from './Producto'
import SelectorIdioma from './SelectorIdioma'

export default function SeccionCategoria({ categoria, qrSlug = '' }) {
  const titulo = 'categoria-' + categoria.id
  const [ref, visible] = useAparecer()
  const [ordenPrecio, setOrdenPrecio] = useState('default')
  const { t, tr } = useIdioma()

  const productosOrdenados = useMemo(() => {
    if (ordenPrecio === 'default') return categoria.productos
    return [...categoria.productos].sort((a, b) => (ordenPrecio === 'menor' ? a.precio - b.precio : b.precio - a.precio))
  }, [categoria.productos, ordenPrecio])

  return (
    <section ref={ref} className={visible ? 'categoria' : 'categoria categoria--oculta'} aria-labelledby={titulo}>
      <div className="categoria__cabecera">
        <h2 id={titulo}>{tr(categoria.nombre)}</h2>
        <div className="categoria__controles">
          <label className="categoria__filtro">
            <span>{t('ordenar')}</span>
            <select value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value)}>
              <option value="default">{t('destacados')}</option>
              <option value="menor">{t('menorPrecio')}</option>
              <option value="mayor">{t('mayorPrecio')}</option>
            </select>
          </label>
          {qrSlug && (
            <>
              <Link to={'/' + qrSlug + '/qr'} className="btn-qr-filtro" aria-label={t('verQr')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" /></svg>
                <span>QR</span>
              </Link>
              <SelectorIdioma />
            </>
          )}
        </div>
      </div>
      <ul>{productosOrdenados.map((producto) => <Producto key={producto.id} producto={producto} />)}</ul>
    </section>
  )
}
