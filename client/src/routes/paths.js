export const appRoutes = {
  login: "/login",
  register: "/register",
  home: "/home",
  admin: "/admin",

  userHome(userId) {
    return `/users/${userId}`;
  },

  userTodos(userId) {
    return `/users/${userId}/todos`;
  },

  userPosts(userId) {
    return `/users/${userId}/posts`;
  },

  userAlbums(userId) {
    return `/users/${userId}/albums`;
  },

  userAccount(userId) {
    return `/users/${userId}/account`;
  },

  albumPhotos(userId, albumId) {
    return `/users/${userId}/albums/${albumId}/photos`;
  },

  patterns: {
    userRoot: "/users/:userId",
    todos: "todos",
    posts: "posts",
    albums: "albums",
    account: "account",
    albumPhotos: "albums/:albumId/photos"
  }
};
