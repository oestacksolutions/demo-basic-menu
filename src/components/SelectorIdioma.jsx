import { useIdioma } from '../context/useIdioma'

const IDIOMAS = [
  { id: 'es', label: 'ES', nombre: 'Español' },
  { id: 'en', label: 'EN', nombre: 'English' },
  { id: 'zh', label: '中文', nombre: '中文' },
]

export default function SelectorIdioma() {
  const { idioma, setIdioma, t } = useIdioma()

  return (
    <div className="selector-idioma" role="group" aria-label={t('idiomaLabel')}>
      {IDIOMAS.map((op) => (
        <button
          key={op.id}
          type="button"
          title={op.nombre}
          aria-pressed={idioma === op.id}
          className={idioma === op.id ? 'selector-idioma__btn selector-idioma__btn--activo' : 'selector-idioma__btn'}
          onClick={() => setIdioma(op.id)}
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}
