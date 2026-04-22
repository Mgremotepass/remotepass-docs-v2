import {useQuery} from "@tanstack/react-query";
import {ApiReferenceReact} from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import {getDocs} from "@/fixtures/endpoints";
import {createRemotePassTheme} from "@/fixtures/theme.ts";

const API_KEY_SECURITY_SCHEME_NAME = "ApiKeyAuth";

const REMOTEPASS_THEME = createRemotePassTheme({
  logoUrl: `${import.meta.env.BASE_URL}logo.svg`,
  darkLogoUrl: `${import.meta.env.BASE_URL}logo-dark.svg`,
  iconUrl: `${import.meta.env.BASE_URL}icon.svg`,
  gettingStartedIconUrl: `${import.meta.env.BASE_URL}sidebar-getting-started.svg`,
  apiReferenceIconUrl: `${import.meta.env.BASE_URL}sidebar-api-reference.svg`,
});

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

export default function App() {
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
      <ErrorScreen
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );

  return (
    <ApiReferenceReact
      configuration={{
        spec: { content: data },
        theme: "kepler",
        hideModels: true,
        layout: "modern",
        darkMode: true,
        forceDarkModeState: "dark",
        hideDarkModeToggle: true,
        showSidebar: true,
        hideDownloadButton: false,
        authentication: {
          preferredSecurityScheme: API_KEY_SECURITY_SCHEME_NAME,
          securitySchemes: {
            [API_KEY_SECURITY_SCHEME_NAME]: {
              type: "apiKey",
              in: "header",
              name: "x-api-key",
              value: "",
              description: "API key used to authorize requests.",
            },
          },
        },
        customCss: REMOTEPASS_THEME,
        metaData: { title: "RemotePass API Reference" },
      } as never}
    />
  );
}
