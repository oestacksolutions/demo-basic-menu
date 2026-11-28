import { useContext } from 'react'
import { IdiomaContext } from './IdiomaContext'

export function useIdioma() {
  const ctx = useContext(IdiomaContext)
  if (!ctx) throw new Error('useIdioma debe usarse dentro de IdiomaProvider')
  return ctx
}
