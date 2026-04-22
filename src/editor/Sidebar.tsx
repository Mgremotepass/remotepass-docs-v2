import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContextMenu } from "./ContextMenu";
import type { Manifest, Folder, Page } from "./types";

interface SidebarProps {
  manifest: Manifest;
  selectedPage: Page | null;
  onSelectPage: (folderId: string, pageId: string) => void;
  onAddFolder: (name: string) => void;
  onAddPage: (folderId: string, name: string) => void;
  onRenameFolder: (folderId: string, name: string) => void;
  onRenamePage: (folderId: string, pageId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDeletePage: (folderId: string, pageId: string) => void;
  onReorderFolders: (from: number, to: number) => void;
  onReorderPages: (folderId: string, from: number, to: number) => void;
}

function InlineRename({ value, onConfirm }: { value: string; onConfirm: (v: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <input
      className="sidebar-inline-rename"
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onConfirm(text.trim() || value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onConfirm(text.trim() || value);
        if (e.key === "Escape") onConfirm(value);
      }}
    />
  );
}

interface SortablePageItemProps {
  folder: Folder;
  page: Page;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function SortablePageItem({ folder, page, isSelected, onSelect, onRename, onDelete }: SortablePageItemProps) {
  const [renaming, setRenaming] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `${folder.id}::${page.id}`,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`sidebar-page-item${isSelected ? " selected" : ""}`}
      onClick={onSelect}
    >
      {renaming ? (
        <InlineRename value={page.name} onConfirm={(n) => { onRename(n); setRenaming(false); }} />
      ) : (
        <>
          <span className="sidebar-page-name">{page.name}</span>
          <ContextMenu
            items={[
              { label: "Rename", onClick: () => setRenaming(true) },
              { label: "Delete", onClick: onDelete, danger: true },
            ]}
          />
        </>
      )}
    </li>
  );
}

interface SortableFolderItemProps {
  folder: Folder;
  selectedPage: Page | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: (name: string) => void;
  onRenameFolder: (name: string) => void;
  onDeleteFolder: () => void;
  onRenamePage: (pageId: string, name: string) => void;
  onDeletePage: (pageId: string) => void;
  onReorderPages: (from: number, to: number) => void;
}

function SortableFolderItem({
  folder,
  selectedPage,
  onSelectPage,
  onAddPage,
  onRenameFolder,
  onDeleteFolder,
  onRenamePage,
  onDeletePage,
  onReorderPages,
}: SortableFolderItemProps) {
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: folder.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  function handlePageDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const pageIds = folder.pages.map((p) => `${folder.id}::${p.id}`);
    const from = pageIds.indexOf(String(active.id));
    const to = pageIds.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onReorderPages(from, to);
  }

  return (
    <li ref={setNodeRef} style={style} className="sidebar-folder-item">
      <div className="sidebar-folder-header" {...attributes} {...listeners}>
        <button className="sidebar-folder-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "▾" : "▸"}
        </button>
        {renamingFolder ? (
          <InlineRename value={folder.name} onConfirm={(n) => { onRenameFolder(n); setRenamingFolder(false); }} />
        ) : (
          <span className="sidebar-folder-name">{folder.name}</span>
        )}
        <ContextMenu
          items={[
            { label: "Add page", onClick: () => { onAddPage("New Page"); } },
            { label: "Rename folder", onClick: () => setRenamingFolder(true) },
            { label: "Delete folder", onClick: onDeleteFolder, danger: true },
          ]}
        />
      </div>
      {expanded && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePageDragEnd}>
          <SortableContext
            items={folder.pages.map((p) => `${folder.id}::${p.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="sidebar-pages-list">
              {folder.pages.map((page) => (
                <SortablePageItem
                  key={page.id}
                  folder={folder}
                  page={page}
                  isSelected={selectedPage?.id === page.id}
                  onSelect={() => onSelectPage(page.id)}
                  onRename={(name) => onRenamePage(page.id, name)}
                  onDelete={() => onDeletePage(page.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </li>
  );
}

export function Sidebar({
  manifest,
  selectedPage,
  onSelectPage,
  onAddFolder,
  onAddPage,
  onRenameFolder,
  onRenamePage,
  onDeleteFolder,
  onDeletePage,
  onReorderFolders,
  onReorderPages,
}: SidebarProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleFolderDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const folderIds = manifest.folders.map((f) => f.id);
    const from = folderIds.indexOf(String(active.id));
    const to = folderIds.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onReorderFolders(from, to);
  }

  return (
    <aside className="editor-sidebar">
      <div className="sidebar-section-header">
        <span className="sidebar-section-label">GUIDES</span>
        <button className="sidebar-add-folder-btn" onClick={() => onAddFolder("New Folder")} title="Add folder">
          +
        </button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFolderDragEnd}>
        <SortableContext items={manifest.folders.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <ul className="sidebar-folders-list">
            {manifest.folders.map((folder) => (
              <SortableFolderItem
                key={folder.id}
                folder={folder}
                selectedPage={selectedPage}
                onSelectPage={(pageId) => onSelectPage(folder.id, pageId)}
                onAddPage={(name) => onAddPage(folder.id, name)}
                onRenameFolder={(name) => onRenameFolder(folder.id, name)}
                onDeleteFolder={() => onDeleteFolder(folder.id)}
                onRenamePage={(pageId, name) => onRenamePage(folder.id, pageId, name)}
                onDeletePage={(pageId) => onDeletePage(folder.id, pageId)}
                onReorderPages={(from, to) => onReorderPages(folder.id, from, to)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </aside>
  );
}
