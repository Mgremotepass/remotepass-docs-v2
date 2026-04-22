import { describe, it, expect, vi, beforeEach } from "vitest";
import { commitFiles, fetchCurrentUser } from "../github";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("../github", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../github")>();
  return mod;
});

function makeOkResponse(data: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });
}

describe("commitFiles", () => {
  beforeEach(() => mockFetch.mockReset());

  it("calls GitHub API in correct sequence and resolves on success", async () => {
    mockFetch
      .mockImplementationOnce(() => makeOkResponse({ object: { sha: "commit-sha-1" } }))
      .mockImplementationOnce(() => makeOkResponse({ tree: { sha: "tree-sha-1" } }))
      .mockImplementationOnce(() => makeOkResponse({ sha: "blob-sha-1" }))
      .mockImplementationOnce(() => makeOkResponse({ sha: "new-tree-sha" }))
      .mockImplementationOnce(() => makeOkResponse({ sha: "new-commit-sha" }))
      .mockImplementationOnce(() => makeOkResponse({ ref: "refs/heads/staging" }));

    await expect(
      commitFiles("token123", [{ path: "scalar/guides/test.md", content: "# Test" }], "docs: test")
    ).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledTimes(6);
    const calls = mockFetch.mock.calls;
    expect(calls[0][0]).toContain("/git/ref/heads/");
    expect(calls[3][0]).toContain("/git/trees");
    expect(calls[4][0]).toContain("/git/commits");
    expect(calls[5][0]).toContain("/git/refs/heads/");
  });

  it("throws CONFLICT error when PATCH returns 422", async () => {
    mockFetch
      .mockImplementationOnce(() => makeOkResponse({ object: { sha: "sha1" } }))
      .mockImplementationOnce(() => makeOkResponse({ tree: { sha: "tsha" } }))
      .mockImplementationOnce(() => makeOkResponse({ sha: "bsha" }))
      .mockImplementationOnce(() => makeOkResponse({ sha: "ntsha" }))
      .mockImplementationOnce(() => makeOkResponse({ sha: "ncsha" }))
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: false, status: 422, json: () => Promise.resolve({}) })
      );

    await expect(
      commitFiles("token123", [{ path: "scalar/guides/test.md", content: "x" }], "test")
    ).rejects.toThrow("CONFLICT");
  });
});

describe("fetchCurrentUser", () => {
  beforeEach(() => mockFetch.mockReset());

  it("returns user data from /user endpoint", async () => {
    mockFetch.mockImplementationOnce(() =>
      makeOkResponse({ login: "mehdi", name: "Mehdi G", avatar_url: "https://avatar.url" })
    );
    const user = await fetchCurrentUser("token123");
    expect(user.login).toBe("mehdi");
    expect(user.name).toBe("Mehdi G");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token123" }) })
    );
  });
});
