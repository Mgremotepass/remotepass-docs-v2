import { describe, it, expect, beforeEach } from "vitest";
import {
  setToken,
  getToken,
  clearToken,
  isAuthenticated,
  readTokenFromFragment,
} from "../auth";

describe("auth helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("setToken stores token in sessionStorage", () => {
    setToken("abc123");
    expect(sessionStorage.getItem("gh_token")).toBe("abc123");
  });

  it("getToken retrieves the stored token", () => {
    sessionStorage.setItem("gh_token", "xyz789");
    expect(getToken()).toBe("xyz789");
  });

  it("getToken returns null when no token stored", () => {
    expect(getToken()).toBeNull();
  });

  it("clearToken removes the token", () => {
    sessionStorage.setItem("gh_token", "abc");
    clearToken();
    expect(sessionStorage.getItem("gh_token")).toBeNull();
  });

  it("isAuthenticated returns true when token exists", () => {
    sessionStorage.setItem("gh_token", "abc");
    expect(isAuthenticated()).toBe(true);
  });

  it("isAuthenticated returns false when no token", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("readTokenFromFragment extracts token from URL hash and clears it", () => {
    window.history.replaceState(null, "", "/editor#token=mytoken123");
    const token = readTokenFromFragment();
    expect(token).toBe("mytoken123");
    expect(window.location.hash).toBe("");
  });

  it("readTokenFromFragment returns null when no token in hash", () => {
    window.history.replaceState(null, "", "/editor");
    expect(readTokenFromFragment()).toBeNull();
  });
});
