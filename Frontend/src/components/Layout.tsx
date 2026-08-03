import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();
  const esLogin = location.pathname === "/";

  if (esLogin) {
    return <Outlet />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}