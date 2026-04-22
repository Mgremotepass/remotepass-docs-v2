import { capitalize, keys, merge, pick, set } from "lodash";
import manifestData from "../fixtures/articles/manifest.json";
import overviewMd from "../fixtures/articles/overview.md?raw";
import authorizationMd from "../fixtures/articles/authorization.md?raw";
import basicUsageMd from "../fixtures/articles/basic-usage.md?raw";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpenAPIObject = Record<string, any>;

interface Server {
  url: string;
  description: string;
}

const servers: Server[] = [
  {
    url: "https://api-staging.remotepass.com",
    description: "Staging",
  },
  {
    url: "https://api-production.remotepass.com",
    description: "Production",
  },
];

const apis: string[] = ["users", "contract", "expense", "timeoff"];

const excludes = [
  "/openapi/contract/v1/status",
  "/openapi/contract/v1/attribute",
];
const API_KEY_HEADER_NAME = "x-api-key";
const API_KEY_SECURITY_SCHEME_NAME = "ApiKeyAuth";
const API_KEY_INTRO_TEXT =
  "For security, include the `x-api-key` header in every request.";

const guideContents: Record<string, string> = {
  "./overview.md": overviewMd,
  "./authorization.md": authorizationMd,
  "./basic-usage.md": basicUsageMd,
  "overview.md": overviewMd,
  "authorization.md": authorizationMd,
  "basic-usage.md": basicUsageMd,
  "getting-started/overview.md": overviewMd,
  "getting-started/authorization.md": authorizationMd,
  "api-usage/basic-usage.md": basicUsageMd,
};

const articleTags = manifestData.folders.flatMap((folder) =>
  folder.pages.map((page) => ({
    name: page.name,
    description:
      guideContents[page.file] ??
      guideContents[`${folder.id}/${page.file.replace(/^\.\//, "")}`] ??
      "",
  }))
);

const ensureApiKeySecurity = (security: unknown): OpenAPIObject[] => {
  const securityEntries = Array.isArray(security)
    ? (security.filter(
        (entry): entry is OpenAPIObject =>
          Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
      ) as OpenAPIObject[])
    : [];

  if (
    securityEntries.some((entry) =>
      Object.prototype.hasOwnProperty.call(entry, API_KEY_SECURITY_SCHEME_NAME)
    )
  ) {
    return securityEntries;
  }

  return [...securityEntries, { [API_KEY_SECURITY_SCHEME_NAME]: [] }];
};

const normalizeOperationParameters = (parameters: unknown): OpenAPIObject[] => {
  const normalized: OpenAPIObject[] = [];
  const seen = new Set<string>();

  for (const parameter of Array.isArray(parameters) ? parameters : []) {
    if (!parameter || typeof parameter !== "object") continue;

    const parameterObject = parameter as OpenAPIObject;
    const parameterIn = String(parameterObject.in ?? "").toLowerCase();
    const parameterName = String(parameterObject.name ?? "").toLowerCase();

    // API key auth is represented via security schemes, not duplicated as manual header params.
    if (
      parameterIn === "header" &&
      (parameterName === "x-company-id" || parameterName === API_KEY_HEADER_NAME)
    ) {
      continue;
    }

    const dedupeKey = `${parameterIn}:${parameterName}`;
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    normalized.push(parameterObject);
  }

  return normalized;
};

const transformOperation = (
  operation: OpenAPIObject,
  api: string
): OpenAPIObject => {
  set(operation, "parameters", normalizeOperationParameters(operation.parameters));

  const firstTag: string = operation?.tags?.[0] ?? "";
  if (["Country", "Currency"].includes(firstTag)) {
    set(operation, "tags", ["Collections"]);
  } else {
    set(operation, "tags", [capitalize(api)]);
  }

  set(operation, "security", ensureApiKeySecurity(operation.security));

  return operation;
};

const transformPaths = (
  paths: Record<string, OpenAPIObject>,
  api: string
): Record<string, OpenAPIObject> => {
  const result: Record<string, OpenAPIObject> = {};
  for (const pathKey of Object.keys(paths)) {
    const pathItem = paths[pathKey];
    const transformedItem: Record<string, OpenAPIObject> = {};
    for (const method of Object.keys(pathItem)) {
      transformedItem[method] = transformOperation({ ...pathItem[method] }, api);
    }
    result[pathKey] = transformedItem;
  }
  return result;
};

const fetchApiDocs = async (api: string): Promise<OpenAPIObject> => {
  const response = await fetch(
    `${servers[0].url}/openapi/${api}/docs-json`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch API docs for "${api}" (${response.status})`);
  }
  const data: OpenAPIObject = await response.json();
  return { ...data, paths: transformPaths(data.paths ?? {}, api) };
};

export const getDocs = async (): Promise<OpenAPIObject> => {
  const results = await Promise.all(apis.map(fetchApiDocs));
  const merged: OpenAPIObject = merge({}, ...results);
  const mergedDescription = String(merged?.info?.description ?? "").trim();
  const infoDescription = /x-api-key/i.test(mergedDescription)
    ? mergedDescription
    : [mergedDescription, API_KEY_INTRO_TEXT].filter(Boolean).join("\n\n");

  const filteredPaths = pick(
    merged.paths,
    keys(merged.paths).filter(
      (p) => !excludes.includes(p) && !p.includes("healthy")
    )
  );

  return {
    ...merged,
    info: {
      ...merged.info,
      title: "RemotePass API",
      description: infoDescription,
    },
    servers,
    paths: filteredPaths,
    components: {
      ...(merged.components ?? {}),
      securitySchemes: {
        ...(merged?.components?.securitySchemes ?? {}),
        [API_KEY_SECURITY_SCHEME_NAME]: {
          type: "apiKey",
          in: "header",
          name: API_KEY_HEADER_NAME,
          description: "API key used to authorize requests.",
        },
      },
    },
    security: ensureApiKeySecurity(merged.security),
    tags: [
      ...articleTags,
      ...(Array.isArray(merged.tags)
        ? (merged.tags as OpenAPIObject[]).filter(
            (t) => !articleTags.some((a) => a.name === t?.name)
          )
        : []),
    ],
    "x-tagGroups": [
      ...manifestData.folders.map((folder) => ({
        name: folder.name,
        tags: folder.pages.map((p) => p.name),
      })),
      {
        name: "API Reference",
        tags: ["Users", "Contract", "Expense", "Timeoff", "Collections"],
      },
    ],
  };
};
