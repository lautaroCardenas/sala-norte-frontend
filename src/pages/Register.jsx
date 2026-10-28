import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "./AuthLayout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS = [
  { name: "name", label: "Nombre y apellido", type: "text", autoComplete: "name" },
  { name: "email_address", label: "Correo electrónico", type: "email", autoComplete: "email" },
  { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password" },
  { name: "password_confirmation", label: "Repetir contraseña", type: "password", autoComplete: "new-password" },
];

export default function Register() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email_address: "", password: "", password_confirmation: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiErrors, setApiErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  // Mismas reglas que el modelo User de Rails, para avisar antes de enviar.
  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Ingresá tu nombre.";
    if (!EMAIL_REGEX.test(form.email_address)) errors.email_address = "Ingresá un correo válido.";
    if (form.password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (form.password !== form.password_confirmation) errors.password_confirmation = "Las contraseñas no coinciden.";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setApiErrors([]);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setApiErrors(err.details?.length ? err.details : [err.message]);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Crear cuenta</h1>
        <p className="muted">Registrate para comprar entradas y ver tus compras.</p>

        {apiErrors.length > 0 && (
          <div className="alert alert-error" role="alert">
            <ul>
              {apiErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        {FIELDS.map((field) => (
          <div className="field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              aria-invalid={Boolean(fieldErrors[field.name])}
              aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
            />
            {fieldErrors[field.name] && (
              <span id={`${field.name}-error`} className="field-error">
                {fieldErrors[field.name]}
              </span>
            )}
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-block btn-large" disabled={submitting}>
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
