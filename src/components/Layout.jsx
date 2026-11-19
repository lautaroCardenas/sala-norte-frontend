import Header from "./Header";

// Estructura común de las pantallas del cliente: encabezado, contenido y pie.
export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="page">{children}</main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>Sala Norte · Boletería online</span>
          <span>Pago simulado · Proyecto académico, Programación IV</span>
        </div>
      </footer>
    </>
  );
}
