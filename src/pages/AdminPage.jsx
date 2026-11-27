import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLogin from '../components/AdminLogin'
import Pie from '../components/Pie'
import { cerrarSesionAdmin, hashPassword, obtenerTokenAdmin, verificarJwt } from '../lib/authJwt'
import { formatearPrecio } from '../lib/formato'
import { guardarLocal, leerLocalCrudo } from '../lib/locales'
import { variablesTema } from '../lib/tema'
import { useLocal } from '../lib/useLocal'
import NoEncontrado from './NoEncontrado'

const generarId = (texto) => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4)

function comprimirLogo(archivo) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      const max = 320
      const escala = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/webp', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer')) }
    img.src = url
  })
}

export default function AdminPage() {
  const { slug } = useParams()
  const { cargando, local: localInicial } = useLocal(slug)
  const [datos, setDatos] = useState(() => leerLocalCrudo(slug))
  const [sesion, setSesion] = useState(null)
  const [verificandoJwt, setVerificandoJwt] = useState(true)
  const [tab, setTab] = useState('productos')
  const [aviso, setAviso] = useState('')
  const [nuevaCat, setNuevaCat] = useState('')
  const [editCatId, setEditCatId] = useState(null)
  const [editCatNombre, setEditCatNombre] = useState('')
  const [filtroCat, setFiltroCat] = useState('todas')
  const [formProd, setFormProd] = useState(() => ({ categoriaId: leerLocalCrudo(slug)?.categorias?.[0]?.id || '', nombre: '', descripcion: '', precio: '' }))
  const [editProd, setEditProd] = useState(null)
  const [nuevaClave, setNuevaClave] = useState('')

  useEffect(() => {
    let activo = true
    verificarJwt(obtenerTokenAdmin(slug), slug).then((p) => { if (activo) { setSesion(p); setVerificandoJwt(false) } })
    return () => { activo = false }
  }, [slug])

  useEffect(() => { if (localInicial) document.title = 'Admin · ' + localInicial.nombre }, [localInicial])

  const notificar = (msg) => { setAviso(msg); setTimeout(() => setAviso(''), 2500) }
  const persistir = (sig, msg = 'Cambios guardados en vivo') => { setDatos(sig); guardarLocal(slug, sig); notificar(msg) }

  if (cargando || verificandoJwt) return <p className="contenedor">Cargando panel…</p>
  if (!localInicial || !datos) return <NoEncontrado />
  if (!sesion) return (<div className="menu admin-page" style={variablesTema(datos.tema)}><main className="contenedor"><AdminLogin local={datos} onAutenticado={async (t) => setSesion(await verificarJwt(t, slug))} /></main><Pie nombreMarca={datos.nombre} instagramUrl={datos.instagram} /></div>)

  const manejarSubidaLogo = async (e) => { const f = e.target.files?.[0]; if (!f) return; try { persistir({ ...datos, logo: await comprimirLogo(f) }, 'Imagen de marca actualizada') } catch { notificar('No se pudo procesar') } }
  const cambiarPassword = async (e) => { e.preventDefault(); if (nuevaClave.trim().length < 6) return notificar('Mínimo 6 caracteres'); const passwordHash = await hashPassword(nuevaClave.trim()); persistir({ ...datos, admin: { ...(datos.admin || {}), email: sesion.sub, passwordHash } }, 'Contraseña actualizada'); setNuevaClave('') }
  const crearCategoria = (e) => { e.preventDefault(); if (!nuevaCat.trim()) return; const id = generarId(nuevaCat); persistir({ ...datos, categorias: [...datos.categorias, { id, nombre: nuevaCat.trim(), activa: true, productos: [] }] }, 'Categoría creada'); setNuevaCat(''); if (!formProd.categoriaId) setFormProd((f) => ({ ...f, categoriaId: id })) }
  const toggleCategoria = (id) => persistir({ ...datos, categorias: datos.categorias.map((c) => (c.id === id ? { ...c, activa: c.activa === false } : c)) })
  const guardarNombreCategoria = (id) => { if (!editCatNombre.trim()) return; persistir({ ...datos, categorias: datos.categorias.map((c) => (c.id === id ? { ...c, nombre: editCatNombre.trim() } : c)) }); setEditCatId(null) }
  const eliminarCategoria = (id) => { if (window.confirm('¿Eliminar categoría y sus productos?')) persistir({ ...datos, categorias: datos.categorias.filter((c) => c.id !== id) }, 'Categoría eliminada') }
  const crearProducto = (e) => { e.preventDefault(); const catId = formProd.categoriaId || datos.categorias[0]?.id; const precio = Number(formProd.precio); if (!catId || !formProd.nombre.trim() || Number.isNaN(precio) || precio < 0) return; const nuevo = { id: generarId(formProd.nombre), nombre: formProd.nombre.trim(), descripcion: formProd.descripcion.trim(), precio, disponible: true }; persistir({ ...datos, categorias: datos.categorias.map((c) => (c.id === catId ? { ...c, productos: [...c.productos, nuevo] } : c)) }, 'Producto agregado'); setFormProd({ categoriaId: catId, nombre: '', descripcion: '', precio: '' }) }
  const toggleProducto = (catId, prodId) => persistir({ ...datos, categorias: datos.categorias.map((c) => (c.id === catId ? { ...c, productos: c.productos.map((p) => (p.id === prodId ? { ...p, disponible: !p.disponible } : p)) } : c)) })
  const guardarEdicionProducto = (e) => { e.preventDefault(); const precio = Number(editProd?.precio); if (!editProd?.nombre.trim() || Number.isNaN(precio) || precio < 0) return; const limpio = { id: editProd.id, nombre: editProd.nombre.trim(), descripcion: editProd.descripcion.trim(), precio, disponible: editProd.disponible }; const sinAnt = datos.categorias.map((c) => ({ ...c, productos: c.productos.filter((p) => p.id !== editProd.id) })); persistir({ ...datos, categorias: sinAnt.map((c) => (c.id === editProd.categoriaId ? { ...c, productos: [...c.productos, limpio] } : c)) }, 'Producto actualizado'); setEditProd(null) }
  const eliminarProducto = (catId, prodId) => { if (window.confirm('¿Eliminar producto?')) persistir({ ...datos, categorias: datos.categorias.map((c) => (c.id === catId ? { ...c, productos: c.productos.filter((p) => p.id !== prodId) } : c)) }, 'Producto eliminado') }
  const categoriasVisibles = filtroCat === 'todas' ? datos.categorias : datos.categorias.filter((c) => c.id === filtroCat)

  return (
    <div className="menu admin-page" style={variablesTema(datos.tema)}>
      <header className="checkout__encabezado">
        <div className="contenedor admin__topbar">
          <div><span className="admin-login__badge"> {sesion.sub}</span><h1>Admin · {datos.nombre}</h1></div>
          <div className="admin__topbar-acciones"><Link to={`/${slug}`} className="btn-secundario admin__btn-claro">Ver menú</Link><button type="button" className="btn-secundario admin__btn-claro" onClick={() => { cerrarSesionAdmin(slug); setSesion(null) }}>Salir</button></div>
        </div>
      </header>
      <main className="contenedor admin__contenido">
        {aviso && <p className="admin__aviso" role="status">{aviso}</p>}
        <nav className="admin__tabs" aria-label="Secciones">{[['productos', 'Productos'], ['categorias', 'Categorías'], ['marca', 'Marca y Seguridad']].map(([id, l]) => (<button key={id} type="button" className={tab === id ? 'admin__tab admin__tab--activa' : 'admin__tab'} onClick={() => setTab(id)}>{l}</button>))}</nav>
        {tab === 'marca' && (<div className="admin__stack"><section className="checkout__bloque"><h2>Identidad de la marca</h2><div className="campo"><label htmlFor="m-nom">Nombre de la marca</label><input id="m-nom" type="text" value={datos.nombre} onChange={(e) => persistir({ ...datos, nombre: e.target.value })} /></div><div className="campo"><label htmlFor="m-rub">Rubro</label><input id="m-rub" type="text" value={datos.rubro || ''} onChange={(e) => persistir({ ...datos, rubro: e.target.value })} /></div><div className="campo"><label htmlFor="m-esl">Eslogan</label><input id="m-esl" type="text" value={datos.descripcion || ''} onChange={(e) => persistir({ ...datos, descripcion: e.target.value })} /></div><div className="campo-doble"><div className="campo"><label htmlFor="m-wsp">WhatsApp</label><input id="m-wsp" type="text" value={datos.whatsapp || ''} onChange={(e) => persistir({ ...datos, whatsapp: e.target.value })} /></div><div className="campo"><label htmlFor="m-ig">Instagram</label><input id="m-ig" type="url" value={datos.instagram || ''} onChange={(e) => persistir({ ...datos, instagram: e.target.value })} /></div></div><div className="campo"><label htmlFor="m-logo">Imagen / Logo (opcional)</label><input id="m-logo" type="file" accept="image/*" onChange={manejarSubidaLogo} />{datos.logo && (<div className="admin__logo-preview"><img src={datos.logo} alt="Logo" /><button type="button" className="btn-secundario" onClick={() => persistir({ ...datos, logo: null }, 'Logo quitado')}>Quitar imagen</button></div>)}</div></section><section className="checkout__bloque"><h2>Seguridad</h2><form onSubmit={cambiarPassword} className="admin__inline-form"><input type="password" value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} placeholder="Nueva contraseña (mín. 6)" /><button type="submit" className="btn-primario">Actualizar clave</button></form></section></div>)}
        {tab === 'categorias' && (<div className="admin__stack"><section className="checkout__bloque"><h2>Nueva categoría</h2><form onSubmit={crearCategoria} className="admin__inline-form"><input type="text" required value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="Ej. Bebidas frías" /><button type="submit" className="btn-primario">Crear categoría</button></form></section><section className="checkout__bloque"><h2>Categorías ({datos.categorias.length})</h2><ul className="admin__lista">{datos.categorias.map((cat) => { const activa = cat.activa !== false; return (<li key={cat.id} className="admin__row">{editCatId === cat.id ? (<div className="admin__inline-form"><input type="text" value={editCatNombre} onChange={(e) => setEditCatNombre(e.target.value)} /><button type="button" className="btn-primario" onClick={() => guardarNombreCategoria(cat.id)}>Guardar</button><button type="button" className="btn-secundario" onClick={() => setEditCatId(null)}>Cancelar</button></div>) : (<><div><strong>{cat.nombre}</strong><span className="admin__meta">{cat.productos.length} productos · {activa ? 'Visible' : 'Oculta'}</span></div><div className="admin__acciones"><button type="button" className={activa ? 'badge-estado badge-estado--on' : 'badge-estado'} onClick={() => toggleCategoria(cat.id)}>{activa ? 'Activa' : 'Desactivada'}</button><button type="button" className="btn-secundario" onClick={() => { setEditCatId(cat.id); setEditCatNombre(cat.nombre) }}>Editar</button><button type="button" className="btn-peligro" onClick={() => eliminarCategoria(cat.id)}>Eliminar</button></div></>)}</li>) })}</ul></section></div>)}
        {tab === 'productos' && (<div className="admin__stack"><section className="checkout__bloque"><h2>Nuevo producto</h2><form onSubmit={crearProducto} className="admin__grid-form"><div className="campo"><label htmlFor="p-cat">Categoría</label><select id="p-cat" value={formProd.categoriaId} onChange={(e) => setFormProd({ ...formProd, categoriaId: e.target.value })}>{datos.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div><div className="campo"><label htmlFor="p-nom">Nombre</label><input id="p-nom" type="text" required value={formProd.nombre} onChange={(e) => setFormProd({ ...formProd, nombre: e.target.value })} placeholder="Ej. Capuccino" /></div><div className="campo"><label htmlFor="p-pre">Precio (ARS)</label><input id="p-pre" type="number" min="0" required value={formProd.precio} onChange={(e) => setFormProd({ ...formProd, precio: e.target.value })} placeholder="4500" /></div><div className="campo"><label htmlFor="p-des">Descripción</label><input id="p-des" type="text" value={formProd.descripcion} onChange={(e) => setFormProd({ ...formProd, descripcion: e.target.value })} placeholder="Opcional" /></div><button type="submit" className="btn-primario">Agregar producto</button></form></section><section className="checkout__bloque"><div className="categoria__cabecera"><h2>Listado de productos</h2><select className="admin__select" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}><option value="todas">Todas</option>{datos.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>{categoriasVisibles.map((cat) => (<div key={cat.id} className="admin__grupo-cat"><h3>{cat.nombre}</h3><ul className="admin__lista">{cat.productos.map((prod) => (<li key={prod.id} className="admin__row">{editProd?.id === prod.id ? (<form onSubmit={guardarEdicionProducto} className="admin__edit-box"><select value={editProd.categoriaId} onChange={(e) => setEditProd({ ...editProd, categoriaId: e.target.value })}>{datos.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select><input type="text" required value={editProd.nombre} onChange={(e) => setEditProd({ ...editProd, nombre: e.target.value })} /><input type="number" min="0" required value={editProd.precio} onChange={(e) => setEditProd({ ...editProd, precio: e.target.value })} /><input type="text" value={editProd.descripcion} onChange={(e) => setEditProd({ ...editProd, descripcion: e.target.value })} /><div className="admin__acciones"><button type="submit" className="btn-primario">Guardar</button><button type="button" className="btn-secundario" onClick={() => setEditProd(null)}>Cancelar</button></div></form>) : (<><div><strong>{prod.nombre} · {formatearPrecio(prod.precio)}</strong>{prod.descripcion && <span className="admin__meta">{prod.descripcion}</span>}</div><div className="admin__acciones"><button type="button" className={prod.disponible ? 'badge-estado badge-estado--on' : 'badge-estado'} onClick={() => toggleProducto(cat.id, prod.id)}>{prod.disponible ? 'Activo' : 'Desactivado'}</button><button type="button" className="btn-secundario" onClick={() => setEditProd({ ...prod, descripcion: prod.descripcion || '', categoriaId: cat.id })}>Editar</button><button type="button" className="btn-peligro" onClick={() => eliminarProducto(cat.id, prod.id)}>Eliminar</button></div></>)}</li>))}</ul></div>))}</section></div>)}
      </main>
      <Pie nombreMarca={datos.nombre} instagramUrl={datos.instagram} />
    </div>
  )
}
