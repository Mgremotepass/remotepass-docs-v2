import { describe, it, expect } from "vitest";
import {
  slugify,
  addFolder,
  addPage,
  renameFolder,
  renamePage,
  deleteFolder,
  deletePage,
  reorderFolders,
  reorderPages,
} from "../manifest";
import type { Manifest } from "../types";

const base: Manifest = {
  folders: [
    {
      id: "getting-started",
      name: "Getting Started",
      pages: [
        { id: "overview", name: "API Overview", file: "getting-started/overview.md" },
        { id: "authorization", name: "Authorization", file: "getting-started/authorization.md" },
      ],
    },
    {
      id: "api-usage",
      name: "API Usage",
      pages: [
        { id: "basic-usage", name: "Basic Usage", file: "api-usage/basic-usage.md" },
      ],
    },
  ],
};

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("API Overview")).toBe("api-overview");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
  it("collapses multiple spaces", () => {
    expect(slugify("Getting   Started")).toBe("getting-started");
  });
});

describe("addFolder", () => {
  it("appends a new folder with an empty pages array", () => {
    const result = addFolder(base, "New Section");
    expect(result.folders).toHaveLength(3);
    expect(result.folders[2].name).toBe("New Section");
    expect(result.folders[2].id).toBe("new-section");
    expect(result.folders[2].pages).toEqual([]);
  });
  it("does not mutate the original manifest", () => {
    addFolder(base, "Test");
    expect(base.folders).toHaveLength(2);
  });
});

describe("addPage", () => {
  it("appends a page to the specified folder", () => {
    const result = addPage(base, "getting-started", "Quick Start");
    const folder = result.folders.find((f) => f.id === "getting-started")!;
    expect(folder.pages).toHaveLength(3);
    expect(folder.pages[2].name).toBe("Quick Start");
    expect(folder.pages[2].id).toBe("quick-start");
    expect(folder.pages[2].file).toBe("getting-started/quick-start.md");
  });
  it("does not affect other folders", () => {
    const result = addPage(base, "getting-started", "Quick Start");
    const other = result.folders.find((f) => f.id === "api-usage")!;
    expect(other.pages).toHaveLength(1);
  });
});

describe("renameFolder", () => {
  it("updates folder name without changing id or pages", () => {
    const result = renameFolder(base, "getting-started", "Onboarding");
    const folder = result.folders.find((f) => f.id === "getting-started")!;
    expect(folder.name).toBe("Onboarding");
    expect(folder.id).toBe("getting-started");
    expect(folder.pages).toHaveLength(2);
  });
});

describe("renamePage", () => {
  it("updates page name without changing id or file path", () => {
    const result = renamePage(base, "getting-started", "overview", "Platform Overview");
    const folder = result.folders.find((f) => f.id === "getting-started")!;
    const page = folder.pages.find((p) => p.id === "overview")!;
    expect(page.name).toBe("Platform Overview");
    expect(page.id).toBe("overview");
    expect(page.file).toBe("getting-started/overview.md");
  });
});

describe("deleteFolder", () => {
  it("removes the folder entirely", () => {
    const result = deleteFolder(base, "api-usage");
    expect(result.folders).toHaveLength(1);
    expect(result.folders[0].id).toBe("getting-started");
  });
});

describe("deletePage", () => {
  it("removes the page from its folder", () => {
    const result = deletePage(base, "getting-started", "authorization");
    const folder = result.folders.find((f) => f.id === "getting-started")!;
    expect(folder.pages).toHaveLength(1);
    expect(folder.pages[0].id).toBe("overview");
  });
});

describe("reorderFolders", () => {
  it("moves a folder from one index to another", () => {
    const result = reorderFolders(base, 0, 1);
    expect(result.folders[0].id).toBe("api-usage");
    expect(result.folders[1].id).toBe("getting-started");
  });
});

describe("reorderPages", () => {
  it("moves a page within a folder", () => {
    const result = reorderPages(base, "getting-started", 0, 1);
    const folder = result.folders.find((f) => f.id === "getting-started")!;
    expect(folder.pages[0].id).toBe("authorization");
    expect(folder.pages[1].id).toBe("overview");
  });
});
