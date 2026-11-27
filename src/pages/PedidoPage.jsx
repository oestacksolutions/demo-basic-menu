import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Pie from '../components/Pie'
import { useCarrito } from '../context/useCarrito'
import { formatearPrecio } from '../lib/formato'
import { variablesTema } from '../lib/tema'
import { useLocal } from '../lib/useLocal'
import { armarMensajePedido, crearUrlWhatsApp } from '../lib/whatsapp'
import NoEncontrado from './NoEncontrado'

export default function PedidoPage() {
  const { slug } = useParams()
  const { cargando, local } = useLocal(slug)
  const { items, actualizarCantidad, totalPrecio } = useCarrito()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [entrega, setEntrega] = useState('retiro')
  const [direccion, setDireccion] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [pisoDepto, setPisoDepto] = useState('')
  const [pago, setPago] = useState('efectivo')
  const [error, setError] = useState('')

  useEffect(() => {
    if (local) document.title = `Confirmar pedido · ${local.nombre}`
  }, [local])

  if (cargando) return <p className="contenedor">Cargando…</p>
  if (!local) return <NoEncontrado />

  const manejarEnvioWhatsApp = (e) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Tu carrito está vacío. Agregá al menos un producto.')
      return
    }
    if (!nombre.trim() || !telefono.trim()) {
      setError('Completá tu nombre y apellido y un teléfono de contacto.')
      return
    }
    if (entrega === 'envio' && (!direccion.trim() || !codigoPostal.trim())) {
      setError('Para envío a domicilio completá la dirección y el código postal.')
      return
    }

    setError('')
    const mensaje = armarMensajePedido({
      localNombre: local.nombre,
      items,
      total: totalPrecio,
      datos: { nombre, telefono, notas, entrega, direccion, codigoPostal, pisoDepto, pago },
    })
    const url = crearUrlWhatsApp(local.whatsapp, mensaje)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="menu checkout" style={variablesTema(local.tema)}>
      <header className="checkout__encabezado">
        <div className="contenedor checkout__encabezado-interior">
          <Link to={`/${slug}`} className="checkout__volver">
            ← Volver al menú
          </Link>
          <h1>{local.nombre}</h1>
        </div>
      </header>

      <main className="contenedor checkout__contenido">
        {items.length === 0 ? (
          <section className="checkout__vacio">
            <h2>No tenés productos en tu pedido</h2>
            <p>Volvé al menú para elegir lo que quieras pedir.</p>
            <Link to={`/${slug}`} className="btn-primario">
              Ir al menú
            </Link>
          </section>
        ) : (
          <form className="checkout__formulario" onSubmit={manejarEnvioWhatsApp} noValidate>
            <section className="checkout__bloque">
              <h2>Detalle del pedido</h2>
              <ul className="checkout__lista">
                {items.map((item) => (
                  <li key={item.id} className="checkout__item">
                    <div>
                      <strong>{item.nombre}</strong>
                      <span>
                        {formatearPrecio(item.precio)} c/u · Subtotal:{''}
                        {formatearPrecio(item.precio * item.cantidad)}
                      </span>
                    </div>
                    <div className="selector-cantidad">
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        aria-label="Restar"
                      >
                        −
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        aria-label="Sumar"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="checkout__total">
                <span>Total a pagar</span>
                <strong>{formatearPrecio(totalPrecio)}</strong>
              </div>
            </section>

            <section className="checkout__bloque">
              <h2>Tus datos</h2>
              <div className="campo">
                <label htmlFor="cli-nombre">Nombre y apellido *</label>
                <input
                  id="cli-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. María Gómez"
                />
              </div>

              <div className="campo">
                <label htmlFor="cli-telefono">Teléfono *</label>
                <input
                  id="cli-telefono"
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 11 2345 6789"
                />
              </div>

              <div className="campo">
                <label htmlFor="cli-notas">Texto adicional (opcional)</label>
                <textarea
                  id="cli-notas"
                  rows="2"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Aclaraciones sobre el pedido, alergias, etc."
                />
              </div>
            </section>

            <section className="checkout__bloque">
              <h2>Forma de entrega</h2>
              <div className="opciones-radio">
                <label className={entrega === 'retiro' ? 'opcion-card opcion-card--activa' : 'opcion-card'}>
                  <input
                    type="radio"
                    name="entrega"
                    value="retiro"
                    checked={entrega === 'retiro'}
                    onChange={() => setEntrega('retiro')}
                  />
                  <span>Retiro personalmente</span>
                </label>

                <label className={entrega === 'envio' ? 'opcion-card opcion-card--activa' : 'opcion-card'}>
                  <input
                    type="radio"
                    name="entrega"
                    value="envio"
                    checked={entrega === 'envio'}
                    onChange={() => setEntrega('envio')}
                  />
                  <span>Envío a domicilio</span>
                </label>
              </div>

              {entrega === 'envio' && (
                <div className="checkout__subcampos">
                  <div className="campo">
                    <label htmlFor="envio-direccion">Dirección completa *</label>
                    <input
                      id="envio-direccion"
                      type="text"
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Calle y altura, localidad"
                    />
                  </div>

                  <div className="campo-doble">
                    <div className="campo">
                      <label htmlFor="envio-cp">Código postal *</label>
                      <input
                        id="envio-cp"
                        type="text"
                        required
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
                        placeholder="Ej. 1755"
                      />
                    </div>

                    <div className="campo">
                      <label htmlFor="envio-piso">Piso / Depto (opcional)</label>
                      <input
                        id="envio-piso"
                        type="text"
                        value={pisoDepto}
                        onChange={(e) => setPisoDepto(e.target.value)}
                        placeholder="Ej. 3° B"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="checkout__bloque">
              <h2>Forma de pago</h2>
              <div className="opciones-radio opciones-radio--tres">
                {[
                  { id: 'efectivo', texto: 'Efectivo' },
                  { id: 'mercadopago', texto: 'Link de Mercado Pago' },
                  { id: 'transferencia', texto: 'Transferencia' },
                ].map((opcion) => (
                  <label
                    key={opcion.id}
                    className={pago === opcion.id ? 'opcion-card opcion-card--activa' : 'opcion-card'}
                  >
                    <input
                      type="radio"
                      name="pago"
                      value={opcion.id}
                      checked={pago === opcion.id}
                      onChange={() => setPago(opcion.id)}
                    />
                    <span>{opcion.texto}</span>
                  </label>
                ))}
              </div>
            </section>

            {error && (
              <p className="checkout__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn-whatsapp">
              Pedir por WhatsApp
            </button>
          </form>
        )}
      </main>

      <Pie nombreMarca={local.nombre} instagramUrl={local.instagram} />
    </div>
  )
}
