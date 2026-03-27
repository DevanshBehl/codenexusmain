import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import CodeArena from './pages/student/CodeArena';
import CodeArenaLeaderboard from './pages/student/CodeArenaLeaderboard';
import CodeArenaSubmissions from './pages/student/CodeArenaSubmissions';
import CodeArenaProblem from './pages/student/CodeArenaProblem';
import DesignArenaProblem from './pages/student/DesignArenaProblem';
import StudentInterview from './pages/student/StudentInterview';
import StudentProjects from './pages/student/StudentProjects';
import StudentProfile from './pages/student/StudentProfile';
import DesignArena from './pages/student/DesignArena';
import UniversityDashboard from './pages/university/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import CreateContest from './pages/company/CreateContest';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterInterview from './pages/recruiter/RecruiterInterview';
import CompanyEvaluation from './pages/company/Evaluation';
import SchedulePPT from './pages/company/SchedulePPT';
import WebinarRoom from './pages/shared/WebinarRoom';
import WebinarList from './pages/shared/WebinarList';
import Mail from './pages/mail/Mail';
import UniversityEvaluation from './pages/university/Evaluation';
import AboutDeveloper from './pages/AboutDeveloper';
import Recordings from './pages/shared/Recordings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about-developer" element={<AboutDeveloper />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/mail/*" element={<Mail />} />
        <Route path="/university/mail/*" element={<Mail />} />
        <Route path="/company/mail/*" element={<Mail />} />
        <Route path="/recruiter/mail/*" element={<Mail />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/codearena" element={<CodeArena />} />
        <Route path="/student/codearena/leaderboard" element={<CodeArenaLeaderboard />} />
        <Route path="/student/codearena/submissions" element={<CodeArenaSubmissions />} />
        <Route path="/student/codearena/:id" element={<CodeArenaProblem />} />
        <Route path="/student/designarena" element={<DesignArena />} />
        <Route path="/student/designarena/:id" element={<DesignArenaProblem />} />
        <Route path="/student/interview" element={<StudentInterview />} />
        <Route path="/student/projects" element={<StudentProjects />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/recording" element={<Recordings userRole="STUDENT" />} />
        <Route path="/student/webinars" element={<WebinarList userRole="STUDENT" />} />
        <Route path="/student/webinar" element={<WebinarRoom userRole="STUDENT" />} />
        <Route path="/university/dashboard" element={<UniversityDashboard />} />
        <Route path="/university/recording" element={<Recordings userRole="UNIVERSITY" />} />
        <Route path="/university/webinars" element={<WebinarList userRole="UNIVERSITY" />} />
        <Route path="/university/evaluation" element={<UniversityEvaluation />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/create-contest" element={<CreateContest />} />
        <Route path="/company/evaluation" element={<CompanyEvaluation />} />
        <Route path="/company/recording" element={<Recordings userRole="COMPANY" />} />
        <Route path="/company/ppt" element={<SchedulePPT />} />
        <Route path="/company/webinar" element={<WebinarRoom userRole="COMPANY" />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/interview" element={<RecruiterInterview />} />
        <Route path="/recruiter/recording" element={<Recordings userRole="RECRUITER" />} />
      </Routes>
    </Router>
  );
}

export default App;
