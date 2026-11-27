import { useState } from 'react'
import { Link } from 'react-router-dom'
import { iniciarSesionAdmin } from '../lib/authJwt'

export default function AdminLogin({ local, onAutenticado }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [intentos, setIntentos] = useState(0)
  const [bloqueadoHasta, setBloqueadoHasta] = useState(0)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const manejarSubmit = async (e) => {
    e.preventDefault()
    const ahora = Date.now()
    if (bloqueadoHasta > ahora) {
      const seg = Math.ceil((bloqueadoHasta - ahora) / 1000)
      setError(`Demasiados intentos. Esperá ${seg}s para volver a probar.`)
      return
    }

    setEnviando(true)
    const res = await iniciarSesionAdmin({ email, password, local })
    setEnviando(false)

    if (res.ok) {
      setIntentos(0)
      setError('')
      onAutenticado(res.token)
      return
    }

    const nuevosIntentos = intentos + 1
    setIntentos(nuevosIntentos)
    if (nuevosIntentos >= 5) {
      setBloqueadoHasta(Date.now() + 30000)
      setIntentos(0)
      setError('Bloqueado por 30 segundos tras 5 intentos fallidos.')
    } else {
      setError(res.error)
    }
  }

  return (
    <section className="admin-login" aria-labelledby="login-titulo">
      <Link to={`/${local.slug}`} className="checkout__volver">
        ← Volver al menú de {local.nombre}
      </Link>

      <form className="admin-login__card" onSubmit={manejarSubmit}>
        <span className="admin-login__badge">Acceso exclusivo · /{local.slug}</span>
        <h1 id="login-titulo">Panel de administración</h1>
        <p className="admin-login__sub">Ingresá con el correo y contraseña de {local.nombre}.</p>

        <div className="campo">
          <label htmlFor="admin-email">Correo electrónico</label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@aroma.com"
          />
        </div>

        <div className="campo">
          <label htmlFor="admin-pass">Contraseña</label>
          <div className="campo-pass">
            <input
              id="admin-pass"
              type={verPass ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" className="btn-secundario" onClick={() => setVerPass((v) => !v)}>
              {verPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        {error && (
          <p className="checkout__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primario admin-login__btn" disabled={enviando}>
          {enviando ? 'Verificando…' : 'Ingresar al panel'}
        </button>
      </form>
    </section>
  )
}
