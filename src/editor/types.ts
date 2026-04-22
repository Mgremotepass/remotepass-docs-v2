export interface Page {
  id: string;
  name: string;
  file: string;
}

export interface Folder {
  id: string;
  name: string;
  pages: Page[];
}

export interface Manifest {
  folders: Folder[];
}

export type SaveStatus = "idle" | "saving" | "committed" | "error" | "conflict";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}
