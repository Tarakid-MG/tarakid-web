import { useParams } from "react-router-dom";
import Classroom from "../components/classroom/Classroom";
import { useAuth } from "../context/AuthContextDefinition";

export const ClassroomWrapper = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,212,0,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(76,201,240,0.18),transparent_24%),linear-gradient(180deg,#f5fbff_0%,#eef7fb_45%,#f7fbfd_100%)]">
      <Classroom bookingId={bookingId!} userId={Number(user?.id)} />
    </div>
  );
};
