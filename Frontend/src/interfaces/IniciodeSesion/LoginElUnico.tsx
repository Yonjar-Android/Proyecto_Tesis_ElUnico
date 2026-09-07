import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUserRound, Lock, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import logo from "../../assets/LogoAzulNaranja-transparente.png";
import { enviarRecuperacion, loginUsuario } from "../../services/auth.service";

type RecoveryStatus = "idle" | "loading" | "sent" | "error";

export default function LoginElUnico() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [showRecovery, setShowRecovery] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>("");
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>("idle");
  const [recoveryError, setRecoveryError] = useState<string>("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!usuario || !password) {
      setError("Completa tu usuario y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const response = await loginUsuario(usuario, password);
      if (!response.success) {
        throw new Error(response.message || "Credenciales inválidas");
      }
      localStorage.setItem("usuario", JSON.stringify(response.user));
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      navigate("/home");
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecovery(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = recoveryEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setRecoveryError("Ingresa tu correo electrónico.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setRecoveryError("Ingresa un correo válido.");
      return;
    }

    setRecoveryStatus("loading");
    setRecoveryError("");
    try {
      const response = await enviarRecuperacion(trimmedEmail);
      if (!response.success) {
        throw new Error(response.message || "No se pudo enviar el correo");
      }
      setRecoveryStatus("sent");
    } catch (err: any) {
      setRecoveryStatus("error");
      setRecoveryError(
        err?.response?.data?.message || err?.message || "No se pudo enviar el correo. Verifica la dirección."
      );
    }
  }

  function closeRecovery() {
    setShowRecovery(false);
    setRecoveryEmail("");
    setRecoveryStatus("idle");
    setRecoveryError("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Fondo gris oscuro con halo sutil de luz azul central
        background: "radial-gradient(ellipse at 50% 30%, #0f1c30 0%, #0c1017 60%, #07090d 100%)",
        fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .login-input-wrap:focus-within {
          border-color: #0047ab !important;
          box-shadow: 0 0 0 3px rgba(0, 71, 171, 0.25) !important;
        }
        .login-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #ffa029 0%, #ff7300 100%) !important;
          box-shadow: 0 6px 20px rgba(255, 140, 0, 0.45) !important;
          transform: translateY(-1px);
        }
        .login-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 410,
          background: "#14181f",
          border: "1px solid rgba(0, 71, 171, 0.45)",
          borderRadius: 20,
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(0, 71, 171, 0.15), 0 15px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Logo / marca */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
          <img
            src={logo}
            alt="El Único Moto Repuestos"
            style={{
              width: 210,
              height: "auto",
              marginBottom: 16,
              filter: "drop-shadow(0 4px 12px rgba(0, 71, 171, 0.3))",
            }}
          />
          <h1
            style={{
              color: "#ffffff",
              fontSize: 20,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Acceso al sistema
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13.5, marginTop: 6, textAlign: "center" }}>
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Usuario */}
          <div>
            <label style={labelStyle}>Usuario</label>
            <div className="login-input-wrap" style={inputWrapStyle}>
              <CircleUserRound size={18} color="#0047ab" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingrese su usuario"
                style={inputStyle}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label style={labelStyle}>Contraseña</label>
            <div className="login-input-wrap" style={inputWrapStyle}>
              <Lock size={18} color="#0047ab" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
              </button>
            </div>
          </div>

          {/* Olvidé mi contraseña */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              style={{
                background: "none",
                border: "none",
                color: "#ff8c00",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffa533")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ff8c00")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Mensaje de error de login */}
          {error && (
            <div
              style={{
                color: "#ff7b7b",
                fontSize: 13,
                background: "rgba(220, 38, 38, 0.12)",
                border: "1px solid rgba(220, 38, 38, 0.4)",
                borderRadius: 8,
                padding: "9px 13px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Botón Iniciar Sesión en Naranja corporativo vibrante */}
          <button
            type="submit"
            disabled={loading}
            className="login-btn-primary"
            style={{
              marginTop: 4,
              background: loading
                ? "#7a4404"
                : "linear-gradient(135deg, #ff8c00 0%, #ea7000 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(255, 140, 0, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>

      {/* Modal recuperar contraseña */}
      {showRecovery && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 6, 12, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
          onClick={closeRecovery}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 390,
              background: "#14181f",
              border: "1px solid rgba(0, 71, 171, 0.5)",
              borderRadius: 18,
              padding: "28px 26px",
              position: "relative",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
            }}
          >
            <button
              onClick={closeRecovery}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
              aria-label="Cerrar"
            >
              <X size={18} color="#9ca3af" />
            </button>

            {recoveryStatus !== "sent" ? (
              <>
                <h2 style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
                  Recuperar contraseña
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 13.5, margin: "0 0 20px", lineHeight: 1.5 }}>
                  Ingresa tu correo y te enviaremos una nueva contraseña.
                </p>
                <form onSubmit={handleRecovery} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="login-input-wrap" style={inputWrapStyle}>
                    <CircleUserRound size={18} color="#0047ab" />
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      style={inputStyle}
                      autoFocus
                      required
                    />
                  </div>

                  {recoveryStatus === "error" && (
                    <div
                      style={{
                        color: "#ff7b7b",
                        fontSize: 13,
                        background: "rgba(220, 38, 38, 0.12)",
                        border: "1px solid rgba(220, 38, 38, 0.4)",
                        borderRadius: 8,
                        padding: "8px 12px",
                      }}
                    >
                      {recoveryError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={recoveryStatus === "loading"}
                    className="login-btn-primary"
                    style={{
                      background:
                        recoveryStatus === "loading"
                          ? "#7a4404"
                          : "linear-gradient(135deg, #ff8c00 0%, #ea7000 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 0",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: recoveryStatus === "loading" ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(255, 140, 0, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {recoveryStatus === "loading" ? "Enviando..." : "Enviar enlace"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <CheckCircle2 size={44} color="#ff8c00" style={{ marginBottom: 12 }} />
                <h2 style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>
                  Revisa tu correo
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
                  Enviamos tu nueva contraseña a{" "}
                  <strong style={{ color: "#ffffff" }}>{recoveryEmail}</strong>.
                </p>
                <button
                  onClick={closeRecovery}
                  style={{
                    marginTop: 22,
                    background: "rgba(0, 71, 171, 0.15)",
                    border: "1px solid #0047ab",
                    color: "#ffffff",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#0047ab")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0, 71, 171, 0.15)")}
                >
                  Volver a iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#cbd5e1",
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 6,
};

const inputWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#0c0f13",
  border: "1px solid #232a35",
  borderRadius: 10,
  padding: "11px 14px",
  transition: "all 0.2s ease",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#ffffff",
  fontSize: 14.5,
};