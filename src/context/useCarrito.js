import { useContext } from 'react'
import { CarritoContext } from './carritoContext'

export function useCarrito() {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  return ctx
}
