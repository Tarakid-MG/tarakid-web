import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import TeacherLogin from "./pages/auth/TeacherLogin";
import Quiz from "./pages/auth/Quiz";
import FreeTrialBooking from "./pages/FreeTrialBooking";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminSessions from "./pages/admin/AdminSessions";
import { AuthProvider } from "./context/AuthContext";
import { KidModeProvider } from "./context/KidModeContext";
import { TeacherSessions } from "./pages/TeacherSessions";
import KidDashboard from "./pages/KidDashboard";
import QuizGuard from "./components/auth/QuizGuard";
import SchedulePage from "./pages/SchedulePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import BookingCalendarPage from "./pages/BookingCalendarPage";
import LessonsPage from "./pages/LessonsPage";
import LessonPlayerPage from "./pages/LessonPlayerPage";
import { ClassroomWrapper } from "./pages/ClassroomPage";
import Settings from "./pages/Settings";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import { ExitKidModeModal } from "./components/kid-mode/ExitKidModeModal";
import TeacherGuard from "./components/auth/TeacherGuard";
import { useKidMode } from "./hooks/useKidMode";

const AppRoutes = () => {
  const { isKidMode, showExitModal } = useKidMode();

  return (
    <>
      <Routes>
        {/* Auth Routes - Always accessible */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/quiz" element={<Quiz />} />

        {isKidMode ? (
          /* Kid Mode Routes - Restricted set when active */
          <>
            <Route
              path="/kid-dashboard"
              element={
                <QuizGuard>
                  <KidDashboard />
                </QuizGuard>
              }
            />
            <Route
              path="/lessons"
              element={
                <QuizGuard>
                  <LessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/lesson/:lessonId"
              element={
                <QuizGuard>
                  <LessonPlayerPage />
                </QuizGuard>
              }
            />
            <Route
              path="/classroom/:bookingId"
              element={<ClassroomWrapper />}
            />
            {/* Redirect any other path to kid dashboard in kid mode */}
            <Route
              path="*"
              element={<Navigate to="/kid-dashboard" replace />}
            />
          </>
        ) : (
          /* Parent Mode Routes - Regular access */
          <>
            <Route
              path="/free-trial-booking"
              element={
                <QuizGuard>
                  <FreeTrialBooking />
                </QuizGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <QuizGuard>
                  <Dashboard />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-dashboard"
              element={
                <QuizGuard>
                  <KidDashboard />
                </QuizGuard>
              }
            />
            <Route
              path="/schedule"
              element={
                <QuizGuard>
                  <SchedulePage />
                </QuizGuard>
              }
            />
            <Route
              path="/subscription"
              element={
                <QuizGuard>
                  <SubscriptionPage />
                </QuizGuard>
              }
            />
            <Route
              path="/book-classes"
              element={
                <QuizGuard>
                  <BookingCalendarPage />
                </QuizGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <QuizGuard>
                  <Settings />
                </QuizGuard>
              }
            />
            <Route
              path="/payment-success"
              element={
                <QuizGuard>
                  <PaymentSuccessPage />
                </QuizGuard>
              }
            />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route
              path="/teacher/dashboard"
              element={
                <TeacherGuard>
                  <TeacherDashboard />
                </TeacherGuard>
              }
            />
            <Route
              path="/teacher/sessions"
              element={
                <TeacherGuard>
                  <TeacherSessions />
                </TeacherGuard>
              }
            />
            <Route path="/" element={<Navigate to="/quiz" replace />} />
            <Route path="*" element={<Navigate to="/quiz" replace />} />
          </>
        )}
      </Routes>
      {showExitModal && <ExitKidModeModal />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <KidModeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </KidModeProvider>
    </AuthProvider>
  );
}

export default App;
