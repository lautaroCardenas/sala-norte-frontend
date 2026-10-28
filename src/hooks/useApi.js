import { useCallback, useEffect, useState } from "react";

// Ejecuta una llamada a la API y expone sus estados: carga, error y datos.
// `reload` permite reintentar desde la interfaz.
export function useApi(request, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const run = useCallback(request, deps);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    run()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState({ data: null, error, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [run, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
