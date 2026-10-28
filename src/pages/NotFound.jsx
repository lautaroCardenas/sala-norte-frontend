import { Link } from "react-router";
import Header from "../components/Header";
import { Empty } from "../components/States";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="page">
        <Empty title="Esta página no existe.">
          <Link to="/" className="btn btn-primary">
            Ir a la cartelera
          </Link>
        </Empty>
      </main>
    </>
  );
}
