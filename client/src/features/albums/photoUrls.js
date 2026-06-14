export function makeThumbnailUrl(url) {
  if (!url) {
    return "https://picsum.photos/seed/project5-new-photo/160/120";
  }

  return url.replace("/600/400", "/160/120");
}

export function makeDefaultPhotoUrl() {
  return `https://picsum.photos/seed/project5-custom-${Date.now()}/600/400`;
}
