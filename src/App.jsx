import { BrowserRouter, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { CarritoProvider } from './context/CarritoProvider'
import AdminPage from './pages/AdminPage'
import MenuPage from './pages/MenuPage'
import NoEncontrado from './pages/NoEncontrado'
import PedidoPage from './pages/PedidoPage'
import QrPage from './pages/QrPage'

function LayoutLocal() {
  const { slug } = useParams()
  return (
    <CarritoProvider slug={slug}>
      <Outlet />
    </CarritoProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:slug" element={<LayoutLocal />}>
          <Route index element={<MenuPage />} />
          <Route path="pedido" element={<PedidoPage />} />
          <Route path="qr" element={<QrPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  )
}
