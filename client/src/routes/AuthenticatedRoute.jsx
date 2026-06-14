import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { appRoutes } from "./paths.js";

function AuthenticatedRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={appRoutes.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default AuthenticatedRoute;
