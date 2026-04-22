type RemotePassThemeOptions = {
  logoUrl: string;
  darkLogoUrl: string;
  iconUrl: string;
  gettingStartedIconUrl: string;
  apiReferenceIconUrl: string;
};

export const createRemotePassTheme = ({
  logoUrl,
  darkLogoUrl,
  iconUrl,
  gettingStartedIconUrl,
  apiReferenceIconUrl,
}: RemotePassThemeOptions) => `
  :root {
    /* Typography */
    --scalar-font: 'Mulish', system-ui, -apple-system, sans-serif;
    --scalar-font-code: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

    /* Brand accent */
    --scalar-color-accent: #114ef7;

    /* Text hierarchy */
    --scalar-color-1: #121212;
    --scalar-color-2: #474747;
    --scalar-color-3: #808080;
    --scalar-color-ghost: #999999;

    /* Backgrounds */
    --scalar-background-1: #ffffff;
    --scalar-background-2: #f7f7f7;
    --scalar-background-3: #f1f1f1;
    --scalar-background-4: #ebebeb;
    --scalar-background-accent: rgba(17, 78, 247, 0.06);

    /* Borders */
    --scalar-border-color: #ebebeb;
    --scalar-border-width: 1px;

    /* Border radius */
    --scalar-radius: 8px;
    --scalar-radius-lg: 12px;
    --scalar-radius-xl: 16px;

    /* Sidebar */
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

    /* Semantic colors */
    --scalar-color-green: #008033;
    --scalar-color-red: #de2626;
    --scalar-color-orange: #eb5004;
    --scalar-color-blue: #1b80de;
    --scalar-color-yellow: #b78f00;
    --scalar-color-purple: #710899;

    /* Scrollbar */
    --scalar-scrollbar-color: rgba(0, 0, 0, 0.12);
    --scalar-scrollbar-color-active: rgba(0, 0, 0, 0.24);
  }

  /* Sidebar logo */
  .sidebar-pages::before,
  .t-doc__sidebar > .group\\/items.custom-scroll::before {
    content: '';
    display: block;
    flex-shrink: 0;
    height: 22px;
    margin: 16px 6px 14px;
    background-image: url('${logoUrl}');
    background-repeat: no-repeat;
    background-position: left center;
    background-size: auto 22px;
  }

  .dark-mode .sidebar-pages::before,
  .dark-mode .t-doc__sidebar > .group\\/items.custom-scroll::before {
    background-image: url('${darkLogoUrl}');
  }

  /* Sidebar section icons */
  .t-doc__sidebar [data-sidebar-id$='/tag-group/getting-started'] > .group\\/button > .group\\/button-label,
  .t-doc__sidebar [data-sidebar-id$='/tag-group/api-reference'] > .group\\/button > .group\\/button-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .t-doc__sidebar [data-sidebar-id$='/tag-group/getting-started'] > .group\\/button > .group\\/button-label::before,
  .t-doc__sidebar [data-sidebar-id$='/tag-group/api-reference'] > .group\\/button > .group\\/button-label::before {
    content: '';
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 16px 16px;
  }

  .t-doc__sidebar [data-sidebar-id$='/tag-group/getting-started'] > .group\\/button > .group\\/button-label::before {
    background-image: url('${gettingStartedIconUrl}');
  }

  .t-doc__sidebar [data-sidebar-id$='/tag-group/api-reference'] > .group\\/button > .group\\/button-label::before {
    background-image: url('${apiReferenceIconUrl}');
  }

  /* Hide Scalar branding/footer row */
  .darklight-reference {
    display: none !important;
  }

  /* Welcome screen: replace circular Scalar icon with RemotePass icon */
  .start-logo {
    width: 80px !important;
    height: 80px !important;
    aspect-ratio: 1 !important;
    border-radius: 20px !important;
    background-color: #ffffff !important;
    background-image: url('${iconUrl}') !important;
    background-repeat: no-repeat !important;
    background-size: 52px auto !important;
    background-position: center !important;
  }
  .start-logo svg {
    display: none !important;
  }
`;
