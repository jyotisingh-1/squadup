import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Friends from "./pages/Friends";
import Tournaments from "./pages/Tournaments";
import Settings from "./pages/Settings";
import Games from "./pages/Games";
import Squads from "./pages/Squads";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/dashboard"
        element={
        <ProtectedRoute>
          <Dashboard />
          </ProtectedRoute>
           } />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<NotFound />} />
        <Route path="/friends" element={<Friends />} />

        <Route path="/tournaments" element={<Tournaments />} />

        <Route path="/games" element={<Games />} />

        <Route path="/squads" element={<Squads />} />

        <Route path="/settings" element={<Settings />} />

      </Routes>
    </BrowserRouter>
    
  );
}

export default App;