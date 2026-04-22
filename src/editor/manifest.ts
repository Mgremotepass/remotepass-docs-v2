import type { Manifest, Folder, Page } from "./types";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function addFolder(manifest: Manifest, name: string): Manifest {
  const id = slugify(name);
  const newFolder: Folder = { id, name, pages: [] };
  return { ...manifest, folders: [...manifest.folders, newFolder] };
}

export function addPage(manifest: Manifest, folderId: string, name: string): Manifest {
  const id = slugify(name);
  const folder = manifest.folders.find((f) => f.id === folderId)!;
  const newPage: Page = { id, name, file: `${folderId}/${id}.md` };
  const updatedFolder: Folder = { ...folder, pages: [...folder.pages, newPage] };
  return {
    ...manifest,
    folders: manifest.folders.map((f) => (f.id === folderId ? updatedFolder : f)),
  };
}

export function renameFolder(manifest: Manifest, folderId: string, name: string): Manifest {
  return {
    ...manifest,
    folders: manifest.folders.map((f) =>
      f.id === folderId ? { ...f, name } : f
    ),
  };
}

export function renamePage(
  manifest: Manifest,
  folderId: string,
  pageId: string,
  name: string
): Manifest {
  return {
    ...manifest,
    folders: manifest.folders.map((f) =>
      f.id === folderId
        ? {
            ...f,
            pages: f.pages.map((p) => (p.id === pageId ? { ...p, name } : p)),
          }
        : f
    ),
  };
}

export function deleteFolder(manifest: Manifest, folderId: string): Manifest {
  return {
    ...manifest,
    folders: manifest.folders.filter((f) => f.id !== folderId),
  };
}

export function deletePage(manifest: Manifest, folderId: string, pageId: string): Manifest {
  return {
    ...manifest,
    folders: manifest.folders.map((f) =>
      f.id === folderId
        ? { ...f, pages: f.pages.filter((p) => p.id !== pageId) }
        : f
    ),
  };
}

export function reorderFolders(manifest: Manifest, from: number, to: number): Manifest {
  const folders = [...manifest.folders];
  const [moved] = folders.splice(from, 1);
  folders.splice(to, 0, moved);
  return { ...manifest, folders };
}

export function reorderPages(
  manifest: Manifest,
  folderId: string,
  from: number,
  to: number
): Manifest {
  return {
    ...manifest,
    folders: manifest.folders.map((f) => {
      if (f.id !== folderId) return f;
      const pages = [...f.pages];
      const [moved] = pages.splice(from, 1);
      pages.splice(to, 0, moved);
      return { ...f, pages };
    }),
  };
}
