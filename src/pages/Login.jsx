import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "./AuthLayout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to={location.state?.from || "/"} replace />;

  function validate() {
    const errors = {};
    if (!EMAIL_REGEX.test(form.email)) errors.email = "Ingresá un correo válido.";
    if (!form.password) errors.password = "Ingresá tu contraseña.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError(null);
    try {
      await login(form.email, form.password, form.remember);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Iniciar sesión</h1>
        <p className="muted">Ingresá con tu cuenta para continuar tu compra.</p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="nombre@correo.com"
            value={form.email}
            onChange={update("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            autoFocus
          />
          {fieldErrors.email && (
            <span id="email-error" className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={update("password")}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password && (
            <span id="password-error" className="field-error">
              {fieldErrors.password}
            </span>
          )}
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={form.remember} onChange={update("remember")} />
          Mantener sesión iniciada
        </label>

        <button type="submit" className="btn btn-primary btn-block btn-large" disabled={submitting}>
          {submitting ? "Entrando…" : "Entrar"}
        </button>

        <p className="auth-switch">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
        <p className="auth-switch">
          <Link to="/" className="muted">
            Ver la cartelera sin iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
