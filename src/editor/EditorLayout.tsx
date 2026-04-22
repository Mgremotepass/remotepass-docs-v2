import { useState, useEffect } from "react";
import { useManifest } from "./useManifest";
import { Sidebar } from "./Sidebar";
import { EditorPane } from "./EditorPane";
import { commitFiles } from "./github";
import { getToken } from "./auth";
import { fetchCurrentUser } from "./github";
import type { Manifest, SaveStatus, GitHubUser } from "./types";
import manifestData from "../../guides/manifest.json";

const REPO_GUIDES_PATH = "scalar/guides";

const initialMarkdownFiles = import.meta.glob("../../guides/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function buildInitialContents(manifest: Manifest): Record<string, string> {
  const contents: Record<string, string> = {};
  for (const folder of manifest.folders) {
    for (const page of folder.pages) {
      const key = Object.keys(initialMarkdownFiles).find((k) => k.endsWith(page.file));
      contents[page.id] = key ? initialMarkdownFiles[key] : "";
    }
  }
  return contents;
}

function SaveButton({ status, onClick }: { status: SaveStatus; onClick: () => void }) {
  const labels: Record<SaveStatus, string> = {
    idle: "Save",
    saving: "Saving…",
    committed: "✓ Committed",
    error: "✗ Error",
    conflict: "⚠ Conflict",
  };
  return (
    <button
      className={`save-button status-${status}`}
      onClick={onClick}
      disabled={status === "saving"}
    >
      {labels[status]}
    </button>
  );
}

function UserMenu({ user, onSignOut }: { user: GitHubUser; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="user-menu">
      <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)}>
        <img src={user.avatar_url} alt={user.login} className="user-avatar" />
        <span>{user.name ?? user.login}</span>
        <span>▾</span>
      </button>
      {open && (
        <div className="user-menu-dropdown">
          <button onClick={onSignOut} className="user-menu-signout">Sign out</button>
        </div>
      )}
    </div>
  );
}

export function EditorLayout({ onSignOut }: { onSignOut: () => void }) {
  const token = getToken()!;
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const initialManifest = manifestData as Manifest;
  const {
    manifest,
    selectedPage,
    pageContents,
    selectPage,
    updatePageContent,
    addFolder,
    addPage,
    renameFolder,
    renamePage,
    deleteFolder,
    deletePage,
    reorderFolders,
    reorderPages,
  } = useManifest(initialManifest, buildInitialContents(initialManifest));

  useEffect(() => {
    fetchCurrentUser(token).then(setUser).catch(() => null);
  }, [token]);

  async function handleSave() {
    if (!selectedPage) return;
    setSaveStatus("saving");
    try {
      const files = [
        {
          path: `${REPO_GUIDES_PATH}/${selectedPage.file}`,
          content: pageContents[selectedPage.id] ?? "",
        },
        {
          path: `${REPO_GUIDES_PATH}/manifest.json`,
          content: JSON.stringify(manifest, null, 2),
        },
      ];
      await commitFiles(token, files, `docs: update guide "${selectedPage.name}"`);
      setSaveStatus("committed");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      if (err instanceof Error && err.message === "CONFLICT") {
        setSaveStatus("conflict");
      } else {
        setSaveStatus("error");
      }
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  }

  const currentContent = selectedPage ? (pageContents[selectedPage.id] ?? "") : "";

  return (
    <div className="editor-root">
      <header className="editor-topbar">
        <img src="/logo.svg" alt="RemotePass" className="editor-logo" />
        <div className="editor-topbar-actions">
          <SaveButton status={saveStatus} onClick={handleSave} />
          {user && <UserMenu user={user} onSignOut={onSignOut} />}
        </div>
      </header>
      <div className="editor-body">
        <Sidebar
          manifest={manifest}
          selectedPage={selectedPage}
          onSelectPage={selectPage}
          onAddFolder={addFolder}
          onAddPage={addPage}
          onRenameFolder={renameFolder}
          onRenamePage={renamePage}
          onDeleteFolder={deleteFolder}
          onDeletePage={deletePage}
          onReorderFolders={reorderFolders}
          onReorderPages={reorderPages}
        />
        <main className="editor-main">
          {selectedPage ? (
            <EditorPane
              value={currentContent}
              onChange={(val) => updatePageContent(selectedPage.id, val)}
            />
          ) : (
            <div className="editor-empty-state">
              Select a page from the sidebar to start editing.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
