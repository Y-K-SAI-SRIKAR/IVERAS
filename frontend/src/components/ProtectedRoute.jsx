import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/LoginPage" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    const roleRoutes = {
      Admin: "/admin",
      Responder: "/helper",
      Hospital: "/hospital",
      Patient: "/patient",
      User: "/dashboard"
    };
    const redirectUrl = roleRoutes[user.userType] || "/dashboard";
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
}
