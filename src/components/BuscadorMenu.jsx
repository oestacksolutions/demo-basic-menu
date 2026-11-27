export default function BuscadorMenu({ valor, onChange, cantidadResultados }) {
  return (
    <div className="buscador">
      <label className="buscador__campo" aria-label="Buscar producto en el menú">
        <svg
          className="buscador__icono"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar producto (ej. flat white, medialuna...)"
          autoComplete="off"
        />
        {valor && (
          <button
            type="button"
            className="buscador__limpiar"
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </label>
      {valor.trim() !== '' && (
        <p className="buscador__estado" role="status">
          {cantidadResultados === 0
            ? 'No encontramos productos con ese nombre.'
            : `${cantidadResultados} ${cantidadResultados === 1 ? 'producto encontrado' : 'productos encontrados'}`}
        </p>
      )}
    </div>
  )
}
