import { formatearPrecio } from './formato'

const ETIQUETAS_PAGO = {
  efectivo: 'Efectivo',
  mercadopago: 'Link de Mercado Pago',
  transferencia: 'Transferencia',
}

export function armarMensajePedido({ localNombre, items, total, datos }) {
  const lineasProductos = items.map(
    (item) => `• ${item.cantidad}x ${item.nombre} (${formatearPrecio(item.precio * item.cantidad)})`,
  )

  const lineasEntrega =
    datos.entrega === 'envio'
      ? [
          '*Entrega:* Envío a domicilio',
          `*Dirección:* ${datos.direccion}`,
          `*Código postal:* ${datos.codigoPostal}`,
          ...(datos.pisoDepto?.trim() ? [`*Piso / Depto:* ${datos.pisoDepto.trim()}`] : []),
        ]
      : ['*Entrega:* Retiro personalmente en el local']

  const bloques = [
    `Hola *${localNombre}*, quiero realizar el siguiente pedido:`,
    '',
    '*Detalle del pedido:*',
    ...lineasProductos,
    '',
    `*Total:* ${formatearPrecio(total)}`,
    '',
    '*Datos del cliente:*',
    `*Nombre:* ${datos.nombre.trim()}`,
    `*Teléfono:* ${datos.telefono.trim()}`,
    ...lineasEntrega,
    `*Forma de pago:* ${ETIQUETAS_PAGO[datos.pago] || datos.pago}`,
    ...(datos.notas?.trim() ? ['', `*Notas adicionales:* ${datos.notas.trim()}`] : []),
  ]

  return bloques.join('\n')
}

export function crearUrlWhatsApp(telefono, mensaje) {
  const limpio = (telefono || '').replace(/\D/g, '')
  const texto = encodeURIComponent(mensaje)
  return limpio ? `https://wa.me/${limpio}?text=${texto}` : `https://wa.me/?text=${texto}`
}
