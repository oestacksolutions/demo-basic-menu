import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Pie from '../components/Pie'
import { useLocal } from '../lib/useLocal'
import { variablesTema } from '../lib/tema'
import { urlPublicaMenu } from '../lib/urlPublica'
import NoEncontrado from './NoEncontrado'

const OPCIONES_QR = { errorCorrectionLevel: 'M', margin: 4 }

function descargar(href, nombreArchivo) {
  const enlace = document.createElement('a')
  enlace.href = href
  enlace.download = nombreArchivo
  enlace.click()
}

export default function QrPage() {
  const { slug } = useParams()
  const { cargando, local } = useLocal(slug)
  const [qr, setQr] = useState({ svg: null, error: false })
  const url = urlPublicaMenu(slug)

  useEffect(() => {
    if (!local) return
    let vigente = true
    import('qrcode')
      .then((QRCode) => QRCode.toString(url, { ...OPCIONES_QR, type: 'svg' }))
      .then((svg) => vigente && setQr({ svg, error: false }))
      .catch(() => vigente && setQr({ svg: null, error: true }))
    return () => {
      vigente = false
    }
  }, [local, url])

  useEffect(() => {
    if (local) document.title = `QR · ${local.nombre}`
  }, [local])

  if (cargando) return <p>Cargando…</p>
  if (!local) return <NoEncontrado />

  const descargarSvg = () => {
    const blob = new Blob([qr.svg], { type: 'image/svg+xml' })
    const href = URL.createObjectURL(blob)
    descargar(href, `qr-${slug}.svg`)
    URL.revokeObjectURL(href)
  }

  const descargarPng = async () => {
    const QRCode = await import('qrcode')
    const href = await QRCode.toDataURL(url, { ...OPCIONES_QR, width: 1200 })
    descargar(href, `qr-${slug}.png`)
  }

  return (
    <div className="menu qr" style={variablesTema(local.tema)}>
      <main className="contenedor">
        <section className="qr__tarjeta" aria-labelledby="qr-titulo">
          <h1 id="qr-titulo">{local.nombre}</h1>

          {qr.svg && (
            <div
              className="qr__codigo"
              role="img"
              aria-label={`Código QR del menú de ${local.nombre}`}
              dangerouslySetInnerHTML={{ __html: qr.svg }}
            />
          )}
          {qr.error && <p role="alert">No pudimos generar el código QR. Probá recargar la página.</p>}

          <p className="qr__texto">Escaneá para ver el menú</p>
          <p className="qr__url">{url}</p>
        </section>

        <div className="qr__acciones">
          <button type="button" onClick={descargarPng} disabled={!qr.svg}>
            Descargar PNG
          </button>
          <button type="button" onClick={descargarSvg} disabled={!qr.svg}>
            Descargar SVG
          </button>
        </div>
      </main>
      <Pie nombreMarca={local.nombre} instagramUrl={local.instagram} />
    </div>
  )
}
