import { apiAxiosGet, apiFetch, buildQuery, clearCache } from "./client.js";

function jsonBody(body) {
  return JSON.stringify(body);
}

function clearResourceCache(resource) {
  clearCache(`/${resource}`);
}

export const authApi = {
  async login(username, password) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: jsonBody({ username, password })
    });
  }
};

export const usersApi = {
  async getByUsername(username) {
    const users = await apiFetch(`/users${buildQuery({ username })}`);
    return users.find((user) => user.username === username) || null;
  },

  async create(user) {
    clearResourceCache("users");
    return apiFetch("/users", {
      method: "POST",
      body: jsonBody(user)
    });
  },

  async update(id, changes) {
    clearResourceCache("users");
    return apiFetch(`/users/${id}`, {
      method: "PATCH",
      body: jsonBody(changes)
    });
  },

  async changePassword(id, currentPassword, newPassword) {
    return apiFetch(`/users/${id}/password`, {
      method: "PATCH",
      body: jsonBody({ currentPassword, newPassword })
    });
  }
};

export const todosApi = {
  async getPageByUser(userId, page) {
    const payload = await apiAxiosGet(`/todos${buildQuery({ userId, _page: page })}`);

    return {
      items: payload.data,
      totalCount: payload.totalCount
    };
  },

  async create(todo) {
    clearResourceCache("todos");
    return apiFetch("/todos", {
      method: "POST",
      body: jsonBody(todo)
    });
  },

  async update(id, changes) {
    clearResourceCache("todos");
    return apiFetch(`/todos/${id}`, {
      method: "PATCH",
      body: jsonBody(changes)
    });
  },

  async remove(id) {
    clearResourceCache("todos");
    return apiFetch(`/todos/${id}`, {
      method: "DELETE"
    });
  }

};

export const postsApi = {
  async getPage(page) {
    const payload = await apiAxiosGet(`/posts${buildQuery({ _page: page })}`);

    return {
      items: payload.data,
      totalCount: payload.totalCount
    };
  },

  async getPageByUser(userId, page) {
    const payload = await apiAxiosGet(`/posts${buildQuery({ userId, _page: page })}`);

    return {
      items: payload.data,
      totalCount: payload.totalCount
    };
  },
  
  async create(post) {
    clearResourceCache("posts");
    return apiFetch("/posts", {
      method: "POST",
      body: jsonBody(post)
    });
  },

  async update(id, changes) {
    clearResourceCache("posts");
    return apiFetch(`/posts/${id}`, {
      method: "PATCH",
      body: jsonBody(changes)
    });
  },

  async remove(id) {
    clearResourceCache("posts");
    clearResourceCache("comments");
    return apiFetch(`/posts/${id}`, {
      method: "DELETE"
    });
  }
};

export const adminApi = {
  listUsers() {
    return apiFetch("/admin/users");
  },

  setUserBlocked(id, blocked) {
    clearResourceCache("users");
    return apiFetch(`/admin/users/${id}/block`, {
      method: "PATCH",
      body: jsonBody({ blocked })
    });
  },

  promoteUserToAdmin(id) {
    clearResourceCache("users");
    return apiFetch(`/admin/users/${id}/admin`, {
      method: "PATCH"
    });
  },

  listAuditLogs() {
    return apiFetch("/admin/audit-logs");
  }
};

export const commentsApi = {
  async getPageByPost(postId, page) {
    const payload = await apiAxiosGet(`/comments${buildQuery({ postId, _page: page })}`);

    return {
      items: payload.data,
      totalCount: payload.totalCount
    };
  },

  async create(comment) {
    clearResourceCache("comments");
    return apiFetch("/comments", {
      method: "POST",
      body: jsonBody(comment)
    });
  },

  async update(id, changes) {
    clearResourceCache("comments");
    return apiFetch(`/comments/${id}`, {
      method: "PATCH",
      body: jsonBody(changes)
    });
  },

  async remove(id) {
    clearResourceCache("comments");
    return apiFetch(`/comments/${id}`, {
      method: "DELETE"
    });
  }
};

export const albumsApi = {
  async getPageByUser(userId, page) {
    const payload = await apiAxiosGet(`/albums${buildQuery({ userId, _page: page })}`);

    return {
      items: payload.data,
      totalCount: payload.totalCount
    };
  },

  async create(album) {
    clearResourceCache("albums");
    return apiFetch("/albums", {
      method: "POST",
      body: jsonBody(album)
    });
  },

  async update(id, changes) {
    clearResourceCache("albums");
    return apiFetch(`/albums/${id}`, {
      method: "PATCH",
      body: jsonBody(changes)
    });
  },

  async remove(id) {
    clearResourceCache("albums");
    clearResourceCache("photos");
    return apiFetch(`/albums/${id}`, {
      method: "DELETE"
    });
  }
};

export const photosApi = {
  async getPage(albumId, page) {
    const payload = await apiAxiosGet(`/photos${buildQuery({ albumId, _page: page })}`);

    return {
      items: payload.data,
      totalCount: payload.totalCount
    };
  },

  async create(photo) {
    clearResourceCache("photos");
    return apiFetch("/photos", {
      method: "POST",
      body: jsonBody(photo)
    });
  },

  async update(id, changes) {
    clearResourceCache("photos");
    return apiFetch(`/photos/${id}`, {
      method: "PATCH",
      body: jsonBody(changes)
    });
  },

  async remove(id) {
    clearResourceCache("photos");
    return apiFetch(`/photos/${id}`, {
      method: "DELETE"
    });
  }
};
