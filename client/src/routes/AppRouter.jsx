import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import AlbumsPage from "../pages/AlbumsPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import PostsPage from "../pages/PostsPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import TodosPage from "../pages/TodosPage.jsx";
import AuthenticatedRoute from "./AuthenticatedRoute.jsx";
import CurrentUserRoute from "./CurrentUserRoute.jsx";
import { appRoutes } from "./paths.js";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={appRoutes.login} element={<LoginPage />} />
        <Route path={appRoutes.register} element={<RegisterPage />} />

        <Route element={<AuthenticatedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={appRoutes.home} element={<HomePage />} />

            <Route path={appRoutes.patterns.userRoot} element={<CurrentUserRoute />}>
              <Route path={appRoutes.patterns.todos} element={<TodosPage />} />
              <Route path={appRoutes.patterns.posts} element={<PostsPage />} />
              <Route path={appRoutes.patterns.albums} element={<AlbumsPage />} />
              <Route path={appRoutes.patterns.albumPhotos} element={<AlbumsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={appRoutes.home} replace />} />
        <Route path="*" element={<Navigate to={appRoutes.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
