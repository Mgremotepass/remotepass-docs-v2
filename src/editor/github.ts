import type { GitHubUser } from "./types";

const GITHUB_API = "https://api.github.com";
const REPO = import.meta.env.VITE_GITHUB_REPO as string;
const BRANCH = import.meta.env.VITE_GITHUB_BRANCH as string;

export interface GitHubFile {
  path: string;
  content: string;
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function ghFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: ghHeaders(token) });
  if (!res.ok) {
    if (res.status === 422) throw new Error("CONFLICT");
    throw new Error(`GitHub API error ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function commitFiles(
  token: string,
  files: GitHubFile[],
  message: string
): Promise<void> {
  const base = `${GITHUB_API}/repos/${REPO}`;

  const refData = await ghFetch<{ object: { sha: string } }>(
    `${base}/git/ref/heads/${BRANCH}`,
    token
  );
  const latestCommitSha = refData.object.sha;

  const commitData = await ghFetch<{ tree: { sha: string } }>(
    `${base}/git/commits/${latestCommitSha}`,
    token
  );
  const baseTreeSha = commitData.tree.sha;

  const blobShas = await Promise.all(
    files.map(async (file) => {
      const blob = await ghFetch<{ sha: string }>(`${base}/git/blobs`, token, {
        method: "POST",
        body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
      });
      return { path: file.path, sha: blob.sha };
    })
  );

  const newTree = await ghFetch<{ sha: string }>(`${base}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: blobShas.map(({ path, sha }) => ({
        path,
        mode: "100644",
        type: "blob",
        sha,
      })),
    }),
  });

  const newCommit = await ghFetch<{ sha: string }>(`${base}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: newTree.sha,
      parents: [latestCommitSha],
    }),
  });

  await ghFetch(`${base}/git/refs/heads/${BRANCH}`, token, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha }),
  });
}

export async function fetchCurrentUser(token: string): Promise<GitHubUser> {
  return ghFetch<GitHubUser>(`${GITHUB_API}/user`, token);
}
