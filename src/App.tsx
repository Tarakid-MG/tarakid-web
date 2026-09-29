import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { KidModeProvider } from "./context/KidModeContext";
import QuizGuard from "./components/auth/QuizGuard";
import { ExitKidModeModal } from "./components/kid-mode/ExitKidModeModal";
import TeacherGuard from "./components/auth/TeacherGuard";
import { useKidMode } from "./hooks/useKidMode";
import AdminGuard from "./components/auth/AdminGuard";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const TeacherLogin = lazy(() => import("./pages/auth/TeacherLogin"));
const Quiz = lazy(() => import("./pages/auth/Quiz"));
const FreeTrialBooking = lazy(() => import("./pages/FreeTrialBooking"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const TeacherNotifications = lazy(() => import("./pages/TeacherNotifications"));
const TeacherProfile = lazy(() => import("./pages/TeacherProfile"));
const TeacherSessions = lazy(() =>
  import("./pages/TeacherSessions").then((module) => ({
    default: module.TeacherSessions,
  })),
);
const KidDashboard = lazy(() => import("./pages/KidDashboard"));
const KidAvatarPage = lazy(() => import("./pages/KidAvatarPage"));
const KidVocabularyLessonsPage = lazy(() =>
  import("./pages/KidVocabularyLessonsPage"),
);
const KidExerciseLessonsPage = lazy(() =>
  import("./pages/KidExerciseLessonsPage"),
);
const KidGameLessonsPage = lazy(() => import("./pages/KidGameLessonsPage"));
const KidVocabularyPage = lazy(() => import("./pages/KidVocabularyPage"));
const KidExercisePage = lazy(() => import("./pages/KidExercisePage"));
const KidGamePage = lazy(() => import("./pages/KidGamePage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const BookingCalendarPage = lazy(() => import("./pages/BookingCalendarPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const LessonPlayerPage = lazy(() => import("./pages/LessonPlayerPage"));
const ClassroomWrapper = lazy(() =>
  import("./pages/ClassroomPage").then((module) => ({
    default: module.ClassroomWrapper,
  })),
);
const Settings = lazy(() => import("./pages/Settings"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminBookingHistory = lazy(() =>
  import("./pages/admin/AdminBookingHistory"),
);
const AdminTeachers = lazy(() => import("./pages/admin/AdminTeachers"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminLessons = lazy(() => import("./pages/admin/AdminLessons"));
const AdminLevels = lazy(() => import("./pages/admin/AdminLevels"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));

function AppRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f5fbff_0%,#eef7fb_45%,#f7fbfd_100%)] px-6">
      <div className="rounded-[2rem] border-4 border-white bg-white px-8 py-6 text-center shadow-[0_18px_40px_rgba(32,42,68,0.10)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue" />
        <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-navy/70">
          Loading
        </p>
      </div>
    </div>
  );
}

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
              path="/classroom/:bookingId"
              element={<ClassroomWrapper />}
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
              path="/kid-avatar"
              element={
                <QuizGuard>
                  <KidAvatarPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-vocabulary"
              element={
                <QuizGuard>
                  <KidVocabularyLessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-vocabulary/:lessonId"
              element={
                <QuizGuard>
                  <KidVocabularyPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-exercises"
              element={
                <QuizGuard>
                  <KidExerciseLessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-exercises/:lessonId"
              element={
                <QuizGuard>
                  <KidExercisePage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-games"
              element={
                <QuizGuard>
                  <KidGameLessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-games/:lessonId"
              element={
                <QuizGuard>
                  <KidGamePage />
                </QuizGuard>
              }
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
              path="/kid-avatar"
              element={
                <QuizGuard>
                  <KidAvatarPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-vocabulary"
              element={
                <QuizGuard>
                  <KidVocabularyLessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-vocabulary/:lessonId"
              element={
                <QuizGuard>
                  <KidVocabularyPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-exercises"
              element={
                <QuizGuard>
                  <KidExerciseLessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-exercises/:lessonId"
              element={
                <QuizGuard>
                  <KidExercisePage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-games"
              element={
                <QuizGuard>
                  <KidGameLessonsPage />
                </QuizGuard>
              }
            />
            <Route
              path="/kid-games/:lessonId"
              element={
                <QuizGuard>
                  <KidGamePage />
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
              path="/history"
              element={
                <QuizGuard>
                  <HistoryPage />
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
            <Route
              path="/teacher/profile"
              element={
                <TeacherGuard>
                  <TeacherProfile />
                </TeacherGuard>
              }
            />
            <Route
              path="/teacher/notifications"
              element={
                <TeacherGuard>
                  <TeacherNotifications />
                </TeacherGuard>
              }
            />

            <Route
              path="/classroom/:bookingId"
              element={<ClassroomWrapper />}
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminGuard>
                  <AdminBookings />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/booking-history"
              element={
                <AdminGuard>
                  <AdminBookingHistory />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <AdminGuard>
                  <AdminTeachers />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <AdminGuard>
                  <AdminClients />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/lessons"
              element={
                <AdminGuard>
                  <AdminLessons />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/levels"
              element={
                <AdminGuard>
                  <AdminLevels />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <AdminGuard>
                  <AdminFeedback />
                </AdminGuard>
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
          <Suspense fallback={<AppRouteFallback />}>
            <AppRoutes />
          </Suspense>
        </Router>
      </KidModeProvider>
    </AuthProvider>
  );
}

export default App;
