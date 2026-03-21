import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Interview from './pages/Interview';
import StudentDashboard from './pages/student/Dashboard';
import CodeArena from './pages/student/CodeArena';
import CodeArenaProblem from './pages/student/CodeArenaProblem';
import UniversityDashboard from './pages/university/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/codearena" element={<CodeArena />} />
        <Route path="/student/codearena/:id" element={<CodeArenaProblem />} />
        <Route path="/university/dashboard" element={<UniversityDashboard />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
