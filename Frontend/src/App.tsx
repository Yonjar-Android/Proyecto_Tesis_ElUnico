import { BrowserRouter, Routes, Route } from "react-router-dom";
 
import Home from "./interfaces/Home/Home";
import Layout from "./components/Layout";
import Marca from "./interfaces/Marca/Marca";
import Categoria from "./interfaces/Categoria/Categoria";
import Cliente from "./interfaces/Clientes/Cliente";
import Proveedor from "./interfaces/Proveedores/Proveedor";
import Inventario from "./interfaces/Productos/Inventario";
import EditarProducto from "./interfaces/Productos/EditarProducto";
import CrearProducto from "./interfaces/Productos/CrearProducto";
import Facturacion from "./interfaces/Facturacion/Facturacion";
import Compras from "./interfaces/Compras/Compras";
import LoginElUnico from "./interfaces/IniciodeSesion/LoginElUnico";
import ReporteCuentasPorCobrar from "./interfaces/Reportes/ReporteCuentasPorCobrar/ReporteCuentasPorCobrar";
import ReporteStockProximoAgotarse from "./interfaces/Reportes/ReporteStockPromiAgotarse/ReporteStockBajo";
import ReporteCompras from "./interfaces/Reportes/ReporteCompras/ReporteCompras";
import ReporteVentas from "./interfaces/Reportes/ReporteVentas/ReporteVentas";
import Mantenimiento from "./interfaces/Mantenimiento/Mantenimiento";
import Usuario from "./interfaces/Usuario/Usuario";
import Caja from "./interfaces/Caja/Caja";
import AperturaCaja from "./interfaces/Caja/AperturaCaja";
import CierreCaja from "./interfaces/Caja/CierreCaja";
import Servicio from "./interfaces/Servicio/Servicio";
import Devoluciones from "./interfaces/Devoluciones/Devoluciones";
import SalidasInventario from "./interfaces/SalidasInventario/SalidasInventario";
import { CajaProvider } from "./context/CajaContext";
import RutaProtegidaCaja from "./components/RutaProtegidaCaja";
 
function App() {
  return (
    <BrowserRouter>
      <CajaProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LoginElUnico />} />
            <Route path="/home" element={<Home />} />
            <Route path="/marcas" element={<Marca />} />
            <Route path="/categorias" element={<Categoria />} />
            <Route path="/clientes" element={<Cliente />} />
            <Route path="/proveedores" element={<Proveedor />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/salidasInventario" element={<SalidasInventario />} />
            <Route path="/devoluciones" element={<Devoluciones />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/inventario/crear" element={<CrearProducto />} />
            <Route path="/inventario/editar/:id" element={<EditarProducto />} />
            <Route path="/mantenimiento" element={<Mantenimiento />} />
            <Route path="/usuario" element={<Usuario />} />
            <Route path="/servicio" element={<Servicio />} />
 
            {/* Rutas protegidas: requieren sesión de caja abierta */}
            <Route
              path="/facturacion"
              element={
                <RutaProtegidaCaja>
                  <Facturacion />
                </RutaProtegidaCaja>
              }
            />
 
            <Route
              path="/caja"
              element={
                <RutaProtegidaCaja>
                  <Caja />
                </RutaProtegidaCaja>
              }
            />
 
            {/* Apertura de caja NO se protege: es la única salida cuando la caja está cerrada */}
            <Route path="/caja/apertura" element={<AperturaCaja />} />
 
            <Route
              path="/caja/cierre"
              element={
                <RutaProtegidaCaja>
                  <CierreCaja />
                </RutaProtegidaCaja>
              }
            />
 
            {/* Reportes */}
            <Route path="/reportes/cuentas-por-cobrar" element={<ReporteCuentasPorCobrar />} />
            <Route path="/reportes/stock-proximo-agotarse" element={<ReporteStockProximoAgotarse />} />
            <Route path="/reportes/ventas" element={<ReporteVentas />} />
            <Route path="/reportes/compras" element={<ReporteCompras />} />
          </Route>
        </Routes>
      </CajaProvider>
    </BrowserRouter>
  );
}
 
export default App;