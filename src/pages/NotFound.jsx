import { Link } from "react-router";
import { Compass } from "lucide-react";
import Layout from "../components/Layout";
import { Empty } from "../components/States";

export default function NotFound() {
  return (
    <Layout>
      <Empty title="Esta página no existe." icon={Compass}>
        <Link to="/" className="btn btn-primary">
          Ir a la cartelera
        </Link>
      </Empty>
    </Layout>
  );
}
