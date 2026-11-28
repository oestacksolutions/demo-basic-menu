import { useDeferredValue, useMemo, useState } from 'react'
import BuscadorMenu from '../components/BuscadorMenu'
import CarritoFlotante from '../components/CarritoFlotante'
import EncabezadoLocal from '../components/EncabezadoLocal'
import FondoGranos from '../components/FondoGranos'
import NavCategorias from '../components/NavCategorias'
import Pie from '../components/Pie'
import SeccionCategoria from '../components/SeccionCategoria'
import { useIdioma } from '../context/useIdioma'
import { variablesTema } from '../lib/tema'
import { normalizarTexto } from '../lib/texto'

export default function MenuBasica({ local }) {
  const [busqueda, setBusqueda] = useState('')
  const busquedaDiferida = useDeferredValue(busqueda)
  const { tr } = useIdioma()

  const { categoriasFiltradas, totalCoincidencias } = useMemo(() => {
    const activas = local.categorias.filter((cat) => cat.activa !== false)
    const termino = normalizarTexto(busquedaDiferida)
    if (!termino) return { categoriasFiltradas: activas, totalCoincidencias: 0 }
    const filtradas = activas.map((cat) => ({
      ...cat,
      productos: cat.productos.filter((p) => p._indiceBusqueda.includes(termino) || normalizarTexto(tr(p.nombre) + ' ' + tr(p.descripcion || '') + ' ' + tr(cat.nombre)).includes(termino)),
    })).filter((cat) => cat.productos.length > 0)
    return { categoriasFiltradas: filtradas, totalCoincidencias: filtradas.reduce((acc, c) => acc + c.productos.length, 0) }
  }, [local.categorias, busquedaDiferida, tr])

  return (
    <div className="menu menu--con-carrito" style={variablesTema(local.tema)}>
      <FondoGranos />
      <EncabezadoLocal nombre={local.nombre} rubro={local.rubro} descripcion={local.descripcion} logo={local.logo} />
      {categoriasFiltradas.length > 0 && <NavCategorias categorias={categoriasFiltradas} />}
      <main className="contenedor">
        <BuscadorMenu valor={busqueda} onChange={setBusqueda} cantidadResultados={totalCoincidencias} />
        {categoriasFiltradas.map((categoria, index) => <SeccionCategoria key={categoria.id} categoria={categoria} qrSlug={index === 0 ? local.slug : ''} />)}
      </main>
      <CarritoFlotante slug={local.slug} />
      <Pie nombreMarca={local.nombre} instagramUrl={local.instagram} slug={local.slug} />
    </div>
  )
}
