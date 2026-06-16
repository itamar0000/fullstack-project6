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
  }
};

export const todosApi = {
  listByUser(userId) {
    return apiFetch(`/todos${buildQuery({ userId })}`);
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
  list() {
    return apiFetch("/posts");
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

export const commentsApi = {
  listByPost(postId) {
    return apiFetch(`/comments${buildQuery({ postId })}`);
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
  listByUser(userId) {
    return apiFetch(`/albums${buildQuery({ userId })}`);
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
  async getPage(albumId, page, limit) {
    const payload = await apiAxiosGet(
      `/photos${buildQuery({ albumId, _page: page, _limit: limit })}`
    );

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
