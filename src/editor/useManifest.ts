import { useState, useCallback } from "react";
import type { Manifest, Page } from "./types";
import {
  addFolder,
  addPage,
  renameFolder,
  renamePage,
  deleteFolder,
  deletePage,
  reorderFolders,
  reorderPages,
} from "./manifest";

export interface UseManifestReturn {
  manifest: Manifest;
  selectedPage: Page | null;
  pageContents: Record<string, string>;
  selectPage: (folderId: string, pageId: string) => void;
  updatePageContent: (pageId: string, content: string) => void;
  addFolder: (name: string) => void;
  addPage: (folderId: string, name: string) => void;
  renameFolder: (folderId: string, name: string) => void;
  renamePage: (folderId: string, pageId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  deletePage: (folderId: string, pageId: string) => void;
  reorderFolders: (from: number, to: number) => void;
  reorderPages: (folderId: string, from: number, to: number) => void;
}

export function useManifest(
  initialManifest: Manifest,
  initialContents: Record<string, string>
): UseManifestReturn {
  const [manifest, setManifest] = useState<Manifest>(initialManifest);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pageContents, setPageContents] = useState<Record<string, string>>(initialContents);

  const selectPage = useCallback(
    (folderId: string, pageId: string) => {
      const folder = manifest.folders.find((f) => f.id === folderId);
      const page = folder?.pages.find((p) => p.id === pageId) ?? null;
      setSelectedPage(page);
    },
    [manifest]
  );

  const updatePageContent = useCallback((pageId: string, content: string) => {
    setPageContents((prev) => ({ ...prev, [pageId]: content }));
  }, []);

  return {
    manifest,
    selectedPage,
    pageContents,
    selectPage,
    updatePageContent,
    addFolder: (name) => setManifest((m) => addFolder(m, name)),
    addPage: (folderId, name) => setManifest((m) => addPage(m, folderId, name)),
    renameFolder: (folderId, name) => setManifest((m) => renameFolder(m, folderId, name)),
    renamePage: (folderId, pageId, name) => setManifest((m) => renamePage(m, folderId, pageId, name)),
    deleteFolder: (folderId) => setManifest((m) => deleteFolder(m, folderId)),
    deletePage: (folderId, pageId) => setManifest((m) => deletePage(m, folderId, pageId)),
    reorderFolders: (from, to) => setManifest((m) => reorderFolders(m, from, to)),
    reorderPages: (folderId, from, to) => setManifest((m) => reorderPages(m, folderId, from, to)),
  };
}
