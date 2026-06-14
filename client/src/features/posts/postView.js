export function getVisiblePosts(posts, search) {
  const query = search.term.trim().toLowerCase();

  return posts.filter((post) => {
    if (!query) {
      return true;
    }

    if (search.field === "id") {
      return String(post.id).includes(query);
    }

    return post.title.toLowerCase().includes(query);
  });
}
