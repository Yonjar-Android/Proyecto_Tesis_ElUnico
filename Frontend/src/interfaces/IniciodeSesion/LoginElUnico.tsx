import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CircleUserRound, Lock, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import logo from "../../assets/LogoTransparente.png";
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
        background:
          "radial-gradient(circle at 20% 20%, #1c2128 0%, #12151a 55%, #0b0d10 100%)",
        fontFamily:
          "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#181c22",
          border: "1.5px solid #E04759",
          borderRadius: 20,
          padding: "40px 32px",
          boxShadow: "0 20px 60px rgba(224,71,89,0.15), 0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* Logo / marca */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img
            src={logo}
            alt="El Único"
            style={{
              width: 220,
              height: "auto",
              marginBottom: 20,
            }}
          />
          <h1
            style={{
              color: "#f4f5f7",
              fontSize: 20,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Acceso al sistema
          </h1>
          <p style={{ color: "#8b93a1", fontSize: 13.5, marginTop: 6, textAlign: "center" }}>
            Ingresa a tu usuario para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Usuario */}
          <div>
            <label style={labelStyle}>Usuario</label>
            <div style={inputWrapStyle}>
              <CircleUserRound size={17} color="#6b7280" />
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
            <div style={inputWrapStyle}>
              <Lock size={17} color="#6b7280" />
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
                {showPassword ? <EyeOff size={17} color="#6b7280" /> : <Eye size={17} color="#6b7280" />}
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
                color: "#E04759",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: 13,
                background: "#2a1516",
                border: "1px solid #4a2323",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              background: loading ? "#E04761" : "linear-gradient(135deg, #fc617b, #E04761)",
              color: "#0b0d10",
              border: "none",
              borderRadius: 10,
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.15s ease, opacity 0.15s ease",
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
            background: "rgba(0,0,0,0.6)",
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
              maxWidth: 380,
              background: "#181c22",
              border: "1px solid #262c35",
              borderRadius: 16,
              padding: "28px 26px",
              position: "relative",
            }}
          >
            <button
              onClick={closeRecovery}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}
              aria-label="Cerrar"
            >
              <X size={18} color="#6b7280" />
            </button>

            {recoveryStatus !== "sent" ? (
              <>
                <h2 style={{ color: "#f4f5f7", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
                  Recuperar contraseña
                </h2>
                <p style={{ color: "#8b93a1", fontSize: 13.5, margin: "0 0 20px", lineHeight: 1.5 }}>
                  Ingresa tu correo y te enviaremos una nueva contraseña.
                </p>
                <form onSubmit={handleRecovery} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={inputWrapStyle}>
                    <CircleUserRound size={17} color="#6b7280" />
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
                        color: "#ff6b6b",
                        fontSize: 13,
                        background: "#2a1516",
                        border: "1px solid #4a2323",
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
                    style={{
                      background: "linear-gradient(135deg, #fc617b, #E04761)",
                      color: "#0b0d10",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 0",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: recoveryStatus === "loading" ? "not-allowed" : "pointer",
                    }}
                  >
                    {recoveryStatus === "loading" ? "Enviando..." : "Enviar enlace"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <CheckCircle2 size={40} color="#2ecc71" style={{ marginBottom: 12 }} />
                <h2 style={{ color: "#f4f5f7", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>
                  Revisa tu correo
                </h2>
                <p style={{ color: "#8b93a1", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
                  Enviamos tu nueva contraseña a{" "}
                  <strong style={{ color: "#f4f5f7" }}>{recoveryEmail}</strong>.
                </p>
                <button
                  onClick={closeRecovery}
                  style={{
                    marginTop: 20,
                    background: "none",
                    border: "1px solid #262c35",
                    color: "#f4f5f7",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
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
  color: "#a8afba",
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 6,
};

const inputWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#0f1216",
  border: "1px solid #2a313c",
  borderRadius: 10,
  padding: "11px 14px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#f4f5f7",
  fontSize: 14.5,
};