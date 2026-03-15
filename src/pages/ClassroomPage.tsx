import { useParams } from "react-router-dom";
import Classroom from "../components/classroom/Classroom";
import { useAuth } from "../context/AuthContextDefinition";

export const ClassroomWrapper = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();

  return <Classroom bookingId={bookingId!} userId={Number(user?.id)} />;
};
