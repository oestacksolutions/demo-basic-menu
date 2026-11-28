import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/useCarrito'
import { useIdioma } from '../context/useIdioma'
import { formatearPrecio } from '../lib/formato'

export default function CarritoFlotante({ slug }) {
  const { items, actualizarCantidad, vaciarCarrito, totalUnidades, totalPrecio } = useCarrito()
  const { t, tr } = useIdioma()
  const [abierto, setAbierto] = useState(false)
  const navigate = useNavigate()
  if (totalUnidades === 0) return null

  return (
    <>
      <div className="carrito-barra"><button type="button" className="carrito-barra__boton contenedor" onClick={() => setAbierto(true)}><span className="carrito-barra__badge">{totalUnidades}</span><span>{t('verPedido')}</span><strong>{formatearPrecio(totalPrecio)}</strong></button></div>
      {abierto && (
        <div className="carrito-modal" role="dialog" aria-modal="true">
          <div className="carrito-modal__fondo" onClick={() => setAbierto(false)} />
          <div className="carrito-modal__panel">
            <header className="carrito-modal__cabecera"><h2>{t('tuPedido')}</h2><button type="button" className="carrito-modal__cerrar" onClick={() => setAbierto(false)} aria-label={t('cerrarCarrito')}>×</button></header>
            <ul className="carrito-modal__lista">{items.map((item) => (<li key={item.id} className="carrito-item"><div className="carrito-item__info"><h3>{tr(item.nombre)}</h3><span>{formatearPrecio(item.precio * item.cantidad)}</span></div><div className="selector-cantidad"><button type="button" onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>−</button><span>{item.cantidad}</span><button type="button" onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button></div></li>))}</ul>
            <footer className="carrito-modal__pie"><div className="carrito-modal__total"><span>{t('totalEstimado')}</span><strong>{formatearPrecio(totalPrecio)}</strong></div><div className="carrito-modal__acciones"><button type="button" className="btn-secundario" onClick={vaciarCarrito}>{t('vaciar')}</button><button type="button" className="btn-primario" onClick={() => { setAbierto(false); navigate('/' + slug + '/pedido') }}>{t('confirmarPedido')}</button></div></footer>
          </div>
        </div>
      )}
    </>
  )
}
