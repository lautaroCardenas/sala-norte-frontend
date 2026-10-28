import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { FiltersProvider } from "./filters/FiltersContext";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Billboard from "./pages/Billboard";
import MovieDetail from "./pages/MovieDetail";
import SeatSelection from "./pages/SeatSelection";
import MyTickets from "./pages/MyTickets";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FiltersProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/" element={<Billboard />} />
            <Route path="/proximamente" element={<Billboard comingSoon />} />
            <Route path="/peliculas/:id" element={<MovieDetail />} />
            <Route
              path="/funciones/:id"
              element={
                <RequireAuth>
                  <SeatSelection />
                </RequireAuth>
              }
            />
            <Route
              path="/mis-entradas"
              element={
                <RequireAuth>
                  <MyTickets />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FiltersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
