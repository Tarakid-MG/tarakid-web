import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Quiz from './pages/auth/Quiz';
import FreeTrialBooking from './pages/FreeTrialBooking';
import Dashboard from './pages/Dashboard';
import AdminSessions from './pages/admin/AdminSessions';
import { AuthProvider } from './context/AuthContext';
import { KidModeProvider } from './context/KidModeContext';
import KidDashboard from './pages/KidDashboard';
import QuizGuard from './components/auth/QuizGuard';
import SchedulePage from './pages/SchedulePage';
import SubscriptionPage from './pages/SubscriptionPage';
import BookingCalendarPage from './pages/BookingCalendarPage';

function App() {
  return (
    <AuthProvider>
      <KidModeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/free-trial-booking" element={
              <QuizGuard>
                <FreeTrialBooking />
              </QuizGuard>
            } />
            <Route path="/dashboard" element={
              <QuizGuard>
                <Dashboard />
              </QuizGuard>
            } />
            <Route path="/kid-dashboard" element={
              <QuizGuard>
                <KidDashboard />
              </QuizGuard>
            } />
            <Route path="/schedule" element={
              <QuizGuard>
                <SchedulePage />
              </QuizGuard>
            } />
            <Route path="/subscription" element={
              <QuizGuard>
                <SubscriptionPage />
              </QuizGuard>
            } />
            <Route path="/book-classes" element={
              <QuizGuard>
                <BookingCalendarPage />
              </QuizGuard>
            } />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/" element={<Navigate to="/quiz" replace />} />
            <Route path="*" element={<Navigate to="/quiz" replace />} />
          </Routes>
        </Router>
      </KidModeProvider>
    </AuthProvider>
  );
}

export default App;
