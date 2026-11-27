import { useState } from 'react'
import { useCarrito } from '../context/useCarrito'
import { formatearPrecio } from '../lib/formato'

export default function Producto({ producto }) {
  const { id, nombre, descripcion, precio, disponible } = producto
  const { items, agregarProducto } = useCarrito()
  const [cantidad, setCantidad] = useState(1)
  const [agregadoReciente, setAgregadoReciente] = useState(false)

  const enCarrito = items.find((i) => i.id === id)?.cantidad || 0

  const manejarAgregar = () => {
    agregarProducto(producto, cantidad)
    setCantidad(1)
    setAgregadoReciente(true)
    setTimeout(() => setAgregadoReciente(false), 1200)
  }

  return (
    <li className={disponible ? 'producto' : 'producto producto--agotado'}>
      <div className="producto__info">
        <div className="producto__linea">
          <h3>{nombre}</h3>
          <span className="producto__precio">{formatearPrecio(precio)}</span>
        </div>
        {descripcion && <p>{descripcion}</p>}

        {disponible ? (
          <div className="producto__controles">
            <div className="selector-cantidad" role="group" aria-label={`Cantidad de ${nombre}`}>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                aria-label="Restar unidad"
              >
                −
              </button>
              <span>{cantidad}</span>
              <button
                type="button"
                onClick={() => setCantidad((c) => c + 1)}
                aria-label="Sumar unidad"
              >
                +
              </button>
            </div>

            <button type="button" className="btn-agregar" onClick={manejarAgregar}>
              {agregadoReciente ? '¡Agregado!' : 'Agregar'}
            </button>

            {enCarrito > 0 && (
              <span className="producto__en-carrito">En carrito: {enCarrito}</span>
            )}
          </div>
        ) : (
          <p className="producto__aviso">No disponible por el momento</p>
        )}
      </div>
    </li>
  )
}
