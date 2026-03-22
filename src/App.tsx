import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import CodeArena from './pages/student/CodeArena';
import CodeArenaProblem from './pages/student/CodeArenaProblem';
import StudentInterview from './pages/student/StudentInterview';
import UniversityDashboard from './pages/university/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import CreateContest from './pages/company/CreateContest';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterInterview from './pages/recruiter/RecruiterInterview';
import CompanyEvaluation from './pages/company/Evaluation';
import Mail from './pages/mail/Mail';
import UniversityEvaluation from './pages/university/Evaluation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mail/*" element={<Mail />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/codearena" element={<CodeArena />} />
        <Route path="/student/codearena/:id" element={<CodeArenaProblem />} />
        <Route path="/student/interview" element={<StudentInterview />} />
        <Route path="/university/dashboard" element={<UniversityDashboard />} />
        <Route path="/university/evaluation" element={<UniversityEvaluation />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/create-contest" element={<CreateContest />} />
        <Route path="/company/evaluation" element={<CompanyEvaluation />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/interview" element={<RecruiterInterview />} />
      </Routes>
    </Router>
  );
}

export default App;
