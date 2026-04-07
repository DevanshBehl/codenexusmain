import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
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
import Contest from './pages/student/Contest';
import DesignArena from './pages/student/DesignArena';
import UniversityDashboard from './pages/university/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import CompanyInterview from './pages/company/CompanyInterview';
import CreateContest from './pages/company/CreateContest';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterInterview from './pages/recruiter/RecruiterInterview';
// @ts-ignore
import InterviewRoom from './components/Interview/InterviewRoom';
import CompanyEvaluation from './pages/company/Evaluation';
import SchedulePPT from './pages/company/SchedulePPT';
import WebinarRoom from './pages/shared/WebinarRoom';
import WebinarList from './pages/shared/WebinarList';
import Mail from './pages/mail/Mail';
import UniversityEvaluation from './pages/university/Evaluation';
import AboutDeveloper from './pages/AboutDeveloper';
import Recordings from './pages/shared/Recordings';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[#888] font-mono text-xs uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // FORCE PROFILE COMPLETION GUARD FOR NEW SIGNUPS
  const isSignupSession = localStorage.getItem('cn_signup_session') === 'true';
  const isStudent = user?.role === 'STUDENT';
  const isProfilePage = location.pathname === '/student/profile';
  
  if (isSignupSession && isStudent && !isProfilePage) {
      return <Navigate to="/student/profile" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about-developer" element={<AboutDeveloper />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route path="/student/mail/*" element={<ProtectedRoute allowedRoles={['STUDENT']}><Mail /></ProtectedRoute>} />
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/codearena" element={<ProtectedRoute allowedRoles={['STUDENT']}><CodeArena /></ProtectedRoute>} />
          <Route path="/student/codearena/leaderboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><CodeArenaLeaderboard /></ProtectedRoute>} />
          <Route path="/student/codearena/submissions" element={<ProtectedRoute allowedRoles={['STUDENT']}><CodeArenaSubmissions /></ProtectedRoute>} />
          <Route path="/student/codearena/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><CodeArenaProblem /></ProtectedRoute>} />
          <Route path="/student/designarena" element={<ProtectedRoute allowedRoles={['STUDENT']}><DesignArena /></ProtectedRoute>} />
          <Route path="/student/designarena/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><DesignArenaProblem /></ProtectedRoute>} />
          <Route path="/student/interview" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentInterview /></ProtectedRoute>} />
          <Route path="/student/projects" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProjects /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/interview/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><InterviewRoom role="student" /></ProtectedRoute>} />
          <Route path="/student/contest" element={<ProtectedRoute allowedRoles={['STUDENT']}><Contest /></ProtectedRoute>} />
          <Route path="/student/recording" element={<ProtectedRoute allowedRoles={['STUDENT']}><Recordings userRole="STUDENT" /></ProtectedRoute>} />
          <Route path="/student/webinars" element={<ProtectedRoute allowedRoles={['STUDENT']}><WebinarList userRole="STUDENT" /></ProtectedRoute>} />
          <Route path="/student/webinar" element={<ProtectedRoute allowedRoles={['STUDENT']}><WebinarRoom userRole="STUDENT" /></ProtectedRoute>} />

          {/* University Routes */}
          <Route path="/university/dashboard" element={<ProtectedRoute allowedRoles={['UNIVERSITY']}><UniversityDashboard /></ProtectedRoute>} />
          <Route path="/university/mail/*" element={<ProtectedRoute allowedRoles={['UNIVERSITY']}><Mail /></ProtectedRoute>} />
          <Route path="/university/recording" element={<ProtectedRoute allowedRoles={['UNIVERSITY']}><Recordings userRole="UNIVERSITY" /></ProtectedRoute>} />
          <Route path="/university/webinars" element={<ProtectedRoute allowedRoles={['UNIVERSITY']}><WebinarList userRole="UNIVERSITY" /></ProtectedRoute>} />
          <Route path="/university/evaluation" element={<ProtectedRoute allowedRoles={['UNIVERSITY']}><UniversityEvaluation /></ProtectedRoute>} />

          {/* Company Routes */}
          <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/mail/*" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><Mail /></ProtectedRoute>} />
          <Route path="/company/create-contest" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><CreateContest /></ProtectedRoute>} />
          <Route path="/company/evaluation" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><CompanyEvaluation /></ProtectedRoute>} />
          <Route path="/company/recording" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><Recordings userRole="COMPANY" /></ProtectedRoute>} />
          <Route path="/company/ppt" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><SchedulePPT /></ProtectedRoute>} />
          <Route path="/company/webinar" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><WebinarRoom userRole="COMPANY" /></ProtectedRoute>} />
          <Route path="/company/interview" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><CompanyInterview /></ProtectedRoute>} />

          {/* Recruiter Routes */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/mail/*" element={<ProtectedRoute allowedRoles={['RECRUITER']}><Mail /></ProtectedRoute>} />
          <Route path="/recruiter/interview" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterInterview /></ProtectedRoute>} />
          <Route path="/recruiter/interview/:id" element={<ProtectedRoute allowedRoles={['RECRUITER']}><InterviewRoom role="recruiter" /></ProtectedRoute>} />
          <Route path="/recruiter/recording" element={<ProtectedRoute allowedRoles={['RECRUITER']}><Recordings userRole="RECRUITER" /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
