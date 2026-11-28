import { Link } from 'react-router-dom'
import { useIdioma } from '../context/useIdioma'

export default function Pie({ nombreMarca = '', instagramUrl = '', slug = '' }) {
  const { t } = useIdioma()
  return (
    <footer className="pie">
      <div className="pie__interior contenedor">
        <div className="pie__izquierda">{instagramUrl && (<a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="pie__instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg><span>Instagram</span></a>)}</div>
        <div className="pie__centro"><strong>{nombreMarca}</strong>{slug && <Link to={'/' + slug + '/admin'} className="pie__admin">{t('pieAdmin')}</Link>}</div>
        <div className="pie__derecha"><a href="https://oestack.com" target="_blank" rel="noopener noreferrer">{t('pieDiseno')}</a><a href="https://oestack.com" target="_blank" rel="noopener noreferrer" className="pie__cta">{t('pieCta')}</a></div>
      </div>
    </footer>
  )
}
