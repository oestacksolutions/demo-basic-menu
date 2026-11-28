import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Pie from '../components/Pie'
import SelectorIdioma from '../components/SelectorIdioma'
import { useCarrito } from '../context/useCarrito'
import { useIdioma } from '../context/useIdioma'
import { formatearPrecio } from '../lib/formato'
import { variablesTema } from '../lib/tema'
import { useLocal } from '../lib/useLocal'
import { armarMensajePedido, crearUrlWhatsApp } from '../lib/whatsapp'
import NoEncontrado from './NoEncontrado'

export default function PedidoPage() {
  const { slug } = useParams()
  const { cargando, local } = useLocal(slug)
  const { items, actualizarCantidad, totalPrecio } = useCarrito()
  const { t, tr } = useIdioma()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [entrega, setEntrega] = useState('retiro')
  const [direccion, setDireccion] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [pisoDepto, setPisoDepto] = useState('')
  const [pago, setPago] = useState('efectivo')
  const [error, setError] = useState('')

  useEffect(() => { if (local) document.title = local.nombre }, [local])
  if (cargando) return <p className="contenedor">Cargando…</p>
  if (!local) return <NoEncontrado />

  const manejarEnvioWhatsApp = (e) => {
    e.preventDefault()
    if (items.length === 0) return setError(t('errVacio'))
    if (!nombre.trim() || !telefono.trim()) return setError(t('errDatos'))
    if (entrega === 'envio' && (!direccion.trim() || !codigoPostal.trim())) return setError(t('errEnvio'))
    setError('')
    const itemsTr = items.map((i) => ({ ...i, nombre: tr(i.nombre) }))
    const mensaje = armarMensajePedido({ localNombre: local.nombre, items: itemsTr, total: totalPrecio, datos: { nombre, telefono, notas, entrega, direccion, codigoPostal, pisoDepto, pago } })
    window.open(crearUrlWhatsApp(local.whatsapp, mensaje), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="menu checkout" style={variablesTema(local.tema)}>
      <header className="checkout__encabezado"><div className="contenedor checkout__encabezado-interior"><div className="admin__topbar"><Link to={'/' + slug} className="checkout__volver">{t('volverMenu')}</Link><SelectorIdioma /></div><h1>{local.nombre}</h1></div></header>
      <main className="contenedor checkout__contenido">
        {items.length === 0 ? (<section className="checkout__vacio"><h2>{t('pedidoVacioTitulo')}</h2><p>{t('pedidoVacioSub')}</p><Link to={'/' + slug} className="btn-primario">{t('irAlMenu')}</Link></section>) : (
          <form className="checkout__formulario" onSubmit={manejarEnvioWhatsApp} noValidate>
            <section className="checkout__bloque"><h2>{t('detallePedido')}</h2><ul className="checkout__lista">{items.map((item) => (<li key={item.id} className="checkout__item"><div><strong>{tr(item.nombre)}</strong><span>{formatearPrecio(item.precio)} {t('cadaUno')} · {t('subtotal')}: {formatearPrecio(item.precio * item.cantidad)}</span></div><div className="selector-cantidad"><button type="button" onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>−</button><span>{item.cantidad}</span><button type="button" onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button></div></li>))}</ul><div className="checkout__total"><span>{t('totalPagar')}</span><strong>{formatearPrecio(totalPrecio)}</strong></div></section>
            <section className="checkout__bloque"><h2>{t('tusDatos')}</h2><div className="campo"><label htmlFor="cli-nombre">{t('nombreApellido')}</label><input id="cli-nombre" type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t('nombrePh')} /></div><div className="campo"><label htmlFor="cli-telefono">{t('telefono')}</label><input id="cli-telefono" type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder={t('telefonoPh')} /></div><div className="campo"><label htmlFor="cli-notas">{t('notas')}</label><textarea id="cli-notas" rows="2" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder={t('notasPh')} /></div ></section>
            <section className="checkout__bloque"><h2>{t('formaEntrega')}</h2><div className="opciones-radio"><label className={entrega === 'retiro' ? 'opcion-card opcion-card--activa' : 'opcion-card'}><input type="radio" name="entrega" value="retiro" checked={entrega === 'retiro'} onChange={() => setEntrega('retiro')} /><span>{t('retiro')}</span></label><label className={entrega === 'envio' ? 'opcion-card opcion-card--activa' : 'opcion-card'}><input type="radio" name="entrega" value="envio" checked={entrega === 'envio'} onChange={() => setEntrega('envio')} /><span>{t('envio')}</span></label></div>{entrega === 'envio' && (<div className="checkout__subcampos"><div className="campo"><label htmlFor="envio-direccion">{t('direccion')}</label><input id="envio-direccion" type="text" required value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder={t('direccionPh')} /></div><div className="campo-doble"><div className="campo"><label htmlFor="envio-cp">{t('cp')}</label><input id="envio-cp" type="text" required value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} placeholder={t('cpPh')} /></div><div className="campo"><label htmlFor="envio-piso">{t('piso')}</label><input id="envio-piso" type="text" value={pisoDepto} onChange={(e) => setPisoDepto(e.target.value)} placeholder={t('pisoPh')} /></div></div></div>)}</section>
            <section className="checkout__bloque"><h2>{t('formaPago')}</h2><div className="opciones-radio opciones-radio--tres">{[['efectivo', t('efectivo')], ['mercadopago', t('mercadopago')], ['transferencia', t('transferencia')]].map(([id, txt]) => (<label key={id} className={pago === id ? 'opcion-card opcion-card--activa' : 'opcion-card'}><input type="radio" name="pago" value={id} checked={pago === id} onChange={() => setPago(id)} /><span>{txt}</span></label>))}</div></section>
            {error && <p className="checkout__error" role="alert">{error}</p>}
            <button type="submit" className="btn-whatsapp">{t('pedirWhatsapp')}</button>
          </form>
        )}
      </main>
      <Pie nombreMarca={local.nombre} instagramUrl={local.instagram} />
    </div>
  )
}
