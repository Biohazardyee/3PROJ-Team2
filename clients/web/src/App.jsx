import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Par défaut, on affiche la page Register */}
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        {/* Route pour la page Login */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;