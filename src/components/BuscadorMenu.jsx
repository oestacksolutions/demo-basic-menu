import { useIdioma } from '../context/useIdioma'

export default function BuscadorMenu({ valor, onChange, cantidadResultados }) {
  const { t } = useIdioma()
  const textoEstado = cantidadResultados === 0 ? t('sinResultados') : cantidadResultados === 1 ? t('unoEncontrado') : t('muchosEncontrados', { n: cantidadResultados })
  return (
    <div className="buscador">
      <label className="buscador__campo" aria-label={t('buscarAria')}>
        <svg className="buscador__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input type="search" value={valor} onChange={(e) => onChange(e.target.value)} placeholder={t('buscarPlaceholder')} autoComplete="off" />
        {valor && <button type="button" className="buscador__limpiar" onClick={() => onChange('')} aria-label={t('limpiarBusqueda')}>×</button>}
      </label>
      {valor.trim() !== '' && <p className="buscador__estado" role="status">{textoEstado}</p>}
    </div>
  )
}
