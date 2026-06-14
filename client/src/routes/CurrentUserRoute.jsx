import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { appRoutes } from "./paths.js";

function CurrentUserRoute() {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const requestedUserId = Number(userId);

  if (requestedUserId !== currentUser.id) {
    return <Navigate to={appRoutes.home} replace />;
  }

  return <Outlet />;
}

export default CurrentUserRoute;
