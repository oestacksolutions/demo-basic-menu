import { useCallback, useEffect, useMemo, useState } from 'react'
import { CarritoContext } from './carritoContext'

export function CarritoProvider({ slug, children }) {
  const claveStorage = `oestack_carrito_${slug}`

  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(claveStorage)
      return guardado ? JSON.parse(guardado) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(claveStorage, JSON.stringify(items))
    } catch {
      // Ignora errores de cuota
    }
  }, [claveStorage, items])

  const agregarProducto = useCallback((producto, cantidad = 1) => {
    if (!producto.disponible || cantidad <= 0) return
    setItems((prev) => {
      const existente = prev.find((i) => i.id === producto.id)
      if (existente) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen || null,
          cantidad,
        },
      ]
    })
  }, [])

  const actualizarCantidad = useCallback((id, nuevaCantidad) => {
    setItems((prev) =>
      nuevaCantidad <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, cantidad: nuevaCantidad } : i)),
    )
  }, [])

  const vaciarCarrito = useCallback(() => setItems([]), [])

  const resumen = useMemo(() => {
    let totalUnidades = 0
    let totalPrecio = 0
    for (const item of items) {
      totalUnidades += item.cantidad
      totalPrecio += item.precio * item.cantidad
    }
    return { totalUnidades, totalPrecio }
  }, [items])

  const valor = useMemo(
    () => ({
      items,
      agregarProducto,
      actualizarCantidad,
      vaciarCarrito,
      totalUnidades: resumen.totalUnidades,
      totalPrecio: resumen.totalPrecio,
    }),
    [items, agregarProducto, actualizarCantidad, vaciarCarrito, resumen],
  )

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}
