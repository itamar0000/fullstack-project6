export const appRoutes = {
  login: "/login",
  register: "/register",
  home: "/home",

  userTodos(userId) {
    return `/users/${userId}/todos`;
  },

  userPosts(userId) {
    return `/users/${userId}/posts`;
  },

  userAlbums(userId) {
    return `/users/${userId}/albums`;
  },

  albumPhotos(userId, albumId) {
    return `/users/${userId}/albums/${albumId}/photos`;
  },

  patterns: {
    userRoot: "/users/:userId",
    todos: "todos",
    posts: "posts",
    albums: "albums",
    albumPhotos: "albums/:albumId/photos"
  }
};
