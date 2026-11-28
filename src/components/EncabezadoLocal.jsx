import { useIdioma } from '../context/useIdioma'
import Grano from './Grano'
import Taza from './Taza'

const GRANOS = [{ izquierda: 76, arriba: 10, tamano: 34, giro: -25, retraso: 0 }, { izquierda: 90, arriba: 34, tamano: 22, giro: 20, retraso: 1.2 }, { izquierda: 66, arriba: 58, tamano: 16, giro: -60, retraso: 2.4 }, { izquierda: 82, arriba: 66, tamano: 30, giro: 35, retraso: 0.6 }]

export default function EncabezadoLocal({ nombre, rubro, descripcion, logo }) {
  const { tr } = useIdioma()
  return (
    <header className="encabezado">
      <div className="encabezado__granos" aria-hidden="true">{GRANOS.map((g) => (<span key={g.izquierda} className="encabezado__grano" style={{ '--izquierda': g.izquierda + '%', '--arriba': g.arriba + '%', '--tamano': g.tamano + 'px', '--giro': g.giro + 'deg', '--retraso': g.retraso + 's' }}><Grano /></span>))}</div>
      <div className="encabezado__interior contenedor">{logo ? <img src={logo} alt={nombre} className="encabezado__logo" /> : <Taza className="taza" />}<div className="encabezado__texto"><h1>{nombre}</h1>{rubro && <p className="encabezado__rubro">{tr(rubro)}</p>}<div className="encabezado__linea" aria-hidden="true" />{descripcion && <p className="encabezado__lema">{tr(descripcion)}</p>}</div></div>
    </header>
  )
}
