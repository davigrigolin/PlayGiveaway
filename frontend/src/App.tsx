import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GiveawayPage from "./pages/GiveawayPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import RaffleDetailsPage from "./pages/RaffleDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // Pega o token para decidir para onde mandar o usuário logo de cara
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* === ROTA RAIZ INTELIGENTE === */}
        {/* Se tiver logado, vai pro Dashboard. Se não, vai pro Login */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Rotas Públicas */}
        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />

        {/* Rota Pública do Sorteio - O ":slug" vira variável na URL */}
        <Route path="/sorteio/:slug" element={<GiveawayPage />} />

        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/dashboard/sorteio/:id"
            element={<RaffleDetailsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
