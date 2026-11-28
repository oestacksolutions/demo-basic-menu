import { useCallback, useEffect, useState } from 'react'
import { CATALOGO_I18N, leerCacheTraduccion, solicitarTraduccionRemota } from '../lib/i18nCatalogo'
import { TEXTOS } from '../lib/i18nTextos'
import { IdiomaContext } from './IdiomaContext'

export function IdiomaProvider({ children }) {
  const [idioma, setIdiomaState] = useState(() => {
    const g = localStorage.getItem('oestack_lang')
    return g === 'en' || g === 'zh' ? g : 'es'
  })
  const [, setTick] = useState(0)

  const setIdioma = useCallback((nuevo) => {
    setIdiomaState(nuevo)
    localStorage.setItem('oestack_lang', nuevo)
  }, [])

  useEffect(() => {
    document.documentElement.lang = idioma === 'zh' ? 'zh-CN' : idioma
  }, [idioma])

  const t = useCallback((clave, vars = {}) => {
    let texto = TEXTOS[idioma]?.[clave] || TEXTOS.es[clave] || clave
    for (const [k, v] of Object.entries(vars)) texto = texto.replace('{' + k + '}', String(v))
    return texto
  }, [idioma])

  const tr = useCallback((textoOriginal) => {
    if (!textoOriginal || idioma === 'es') return textoOriginal || ''
    const limpio = textoOriginal.trim()
    const estatico = CATALOGO_I18N[limpio]?.[idioma]
    if (estatico) return estatico
    const cache = leerCacheTraduccion(idioma)
    if (cache[limpio]) return cache[limpio]
    solicitarTraduccionRemota(limpio, idioma, () => setTick((n) => n + 1))
    return textoOriginal
  }, [idioma])

  return <IdiomaContext.Provider value={{ idioma, setIdioma, t, tr }}>{children}</IdiomaContext.Provider>
}
