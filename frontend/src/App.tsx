import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GiveawayPage from "./pages/GiveawayPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import RaffleDetailsPage from "./pages/RaffleDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />

        <Route path="/cadastro" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />

        <Route path="/sorteio/:slug" element={<GiveawayPage />} />

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
