import React from "react";
import { Navigate } from "react-router-dom";

const KidActivityPage: React.FC = () => {
  return <Navigate to="/kid-dashboard" replace />;
};

export default KidActivityPage;