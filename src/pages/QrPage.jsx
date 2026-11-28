import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Pie from '../components/Pie'
import SelectorIdioma from '../components/SelectorIdioma'
import { useIdioma } from '../context/useIdioma'
import { variablesTema } from '../lib/tema'
import { urlPublicaMenu } from '../lib/urlPublica'
import { useLocal } from '../lib/useLocal'
import NoEncontrado from './NoEncontrado'

const OPCIONES_QR = { errorCorrectionLevel: 'M', margin: 4 }
const descargar = (href, nombre) => Object.assign(document.createElement('a'), { href, download: nombre }).click()

export default function QrPage() {
  const { slug } = useParams()
  const { cargando, local } = useLocal(slug)
  const { t } = useIdioma()
  const [qr, setQr] = useState({ svg: null, error: false })
  const url = urlPublicaMenu(slug)

  useEffect(() => {
    if (!local) return
    let vigente = true
    import('qrcode').then((QR) => QR.toString(url, { ...OPCIONES_QR, type: 'svg' })).then((svg) => vigente && setQr({ svg, error: false })).catch(() => vigente && setQr({ svg: null, error: true }))
    return () => { vigente = false }
  }, [local, url])

  useEffect(() => { if (local) document.title = 'QR · ' + local.nombre }, [local])
  if (cargando) return <p>Cargando…</p>
  if (!local) return <NoEncontrado />

  const descargarSvg = () => { const href = URL.createObjectURL(new Blob([qr.svg], { type: 'image/svg+xml' })); descargar(href, 'qr-' + slug + '.svg'); URL.revokeObjectURL(href) }
  const descargarPng = async () => { const QR = await import('qrcode'); descargar(await QR.toDataURL(url, { ...OPCIONES_QR, width: 1200 }), 'qr-' + slug + '.png') }

  return (
    <div className="menu qr" style={variablesTema(local.tema)}>
      <main className="contenedor">
        <div className="qr__barra-sup"><Link to={'/' + slug} className="btn-qr-filtro">{t('volverMenu')}</Link><SelectorIdioma /></div>
        <section className="qr__tarjeta"><h1 id="qr-titulo">{local.nombre}</h1>{qr.svg && <div className="qr__codigo" role="img" dangerouslySetInnerHTML={{ __html: qr.svg }} />}{qr.error && <p role="alert">{t('qrError')}</p>}<p className="qr__texto">{t('qrEscanear')}</p><p className="qr__url">{url}</p></section>
        <div className="qr__acciones"><button type="button" onClick={descargarPng} disabled={!qr.svg}>{t('qrDescargarPng')}</button><button type="button" onClick={descargarSvg} disabled={!qr.svg}>{t('qrDescargarSvg')}</button></div>
      </main>
      <Pie nombreMarca={local.nombre} instagramUrl={local.instagram} />
    </div>
  )
}
