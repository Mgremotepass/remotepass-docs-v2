import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useEffect } from "react";
import { getDocs } from "@/fixtures/endpoints";
import { isAuthenticated, readTokenFromFragment, setToken, clearToken } from "@/editor/auth";
import { LoginPage } from "@/editor/LoginPage";
import { EditorLayout } from "@/editor/EditorLayout";
import "@/editor/editor.css";

const REMOTEPASS_THEME = `
  :root {
    --scalar-font: 'Mulish', system-ui, -apple-system, sans-serif;
    --scalar-font-code: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    --scalar-color-accent: #114ef7;
    --scalar-color-1: #121212;
    --scalar-color-2: #474747;
    --scalar-color-3: #808080;
    --scalar-color-ghost: #999999;
    --scalar-background-1: #ffffff;
    --scalar-background-2: #f7f7f7;
    --scalar-background-3: #f1f1f1;
    --scalar-background-4: #ebebeb;
    --scalar-background-accent: rgba(17, 78, 247, 0.06);
    --scalar-border-color: #ebebeb;
    --scalar-border-width: 1px;
    --scalar-radius: 8px;
    --scalar-radius-lg: 12px;
    --scalar-radius-xl: 16px;
    --scalar-sidebar-background-1: #f7f7f7;
    --scalar-sidebar-color-1: #121212;
    --scalar-sidebar-color-2: #474747;
    --scalar-sidebar-color-active: #114ef7;
    --scalar-sidebar-border-color: #ebebeb;
    --scalar-sidebar-item-active-background: rgba(17, 78, 247, 0.08);
    --scalar-sidebar-item-hover-background: rgba(0, 0, 0, 0.04);
    --scalar-sidebar-item-hover-color: #121212;
    --scalar-sidebar-search-background: #ffffff;
    --scalar-sidebar-search-border-color: #d9d9d9;
    --scalar-color-green: #008033;
    --scalar-color-red: #de2626;
    --scalar-color-orange: #eb5004;
    --scalar-color-blue: #1b80de;
    --scalar-color-yellow: #b78f00;
    --scalar-color-purple: #710899;
    --scalar-scrollbar-color: rgba(0, 0, 0, 0.12);
    --scalar-scrollbar-color-active: rgba(0, 0, 0, 0.24);
  }
  .sidebar-pages::before {
    content: '';
    display: block;
    flex-shrink: 0;
    height: 22px;
    margin: 16px 6px 14px;
    background-image: url('/logo.svg');
    background-repeat: no-repeat;
    background-position: left center;
    background-size: auto 22px;
  }
  .start-logo {
    width: 80px !important;
    height: 80px !important;
    aspect-ratio: 1 !important;
    border-radius: 20px !important;
    background-color: #ffffff !important;
    background-image: url('/icon.svg') !important;
    background-repeat: no-repeat !important;
    background-size: 52px auto !important;
    background-position: center !important;
  }
  .start-logo svg { display: none !important; }
`;

function LoadingScreen() {
  return (
    <div className="status-screen">
      <div className="spinner" />
      <span>Loading API reference…</span>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="status-screen error">
      <span className="error-icon">⚠</span>
      <span className="error-title">Could not load API docs</span>
      <span className="error-message">{message}</span>
    </div>
  );
}

function ViewerPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["docs"],
    queryFn: getDocs,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (isLoading) return <LoadingScreen />;
  if (error)
    return (
      <ErrorScreen message={error instanceof Error ? error.message : "Unknown error"} />
    );

  return (
    <ApiReferenceReact
      configuration={{
        spec: { content: data },
        theme: "default",
        layout: "modern",
        darkMode: false,
        showSidebar: true,
        hideDownloadButton: false,
        customCss: REMOTEPASS_THEME,
        metaData: { title: "RemotePass API Reference" },
      }}
    />
  );
}

function EditorRoute() {
  useEffect(() => {
    const token = readTokenFromFragment();
    if (token) setToken(token);
  }, []);

  if (!isAuthenticated()) return <LoginPage />;

  return <EditorLayout onSignOut={() => { clearToken(); window.location.reload(); }} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ViewerPage />} />
        <Route path="/editor" element={<EditorRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
