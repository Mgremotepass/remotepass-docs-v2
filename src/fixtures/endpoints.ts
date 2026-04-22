import { capitalize, keys, merge, pick, set } from "lodash";
import manifestData from "../../guides/manifest.json";

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

const markdownFiles = import.meta.glob("../../guides/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getMarkdown(file: string): string {
  const key = Object.keys(markdownFiles).find((k) => k.endsWith(file));
  return key ? markdownFiles[key] : "";
}

const articleTags = manifestData.folders.flatMap((folder) =>
  folder.pages.map((page) => ({
    name: page.name,
    description: getMarkdown(page.file),
  }))
);

const transformOperation = (
  operation: OpenAPIObject,
  api: string
): OpenAPIObject => {
  set(
    operation,
    "parameters",
    (operation.parameters ?? []).map((p: OpenAPIObject) =>
      p?.name === "x-company-id" ? { ...p, name: "x-api-key" } : p
    )
  );

  const firstTag: string = operation?.tags?.[0] ?? "";
  if (["Country", "Currency"].includes(firstTag)) {
    set(operation, "tags", ["Collections"]);
  } else {
    set(operation, "tags", [capitalize(api)]);
  }

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

  const filteredPaths = pick(
    merged.paths,
    keys(merged.paths).filter(
      (p) => !excludes.includes(p) && !p.includes("healthy")
    )
  );

  return {
    ...merged,
    info: { ...merged.info, title: "RemotePass API" },
    servers,
    paths: filteredPaths,
    tags: [
      ...articleTags,
      ...(Array.isArray(merged.tags)
        ? (merged.tags as OpenAPIObject[]).filter(
            (t) => !articleTags.some((a) => a.name === t?.name)
          )
        : []),
    ],
    "x-tagGroups": [
      {
        name: "Guides",
        tags: manifestData.folders.flatMap((f) => f.pages.map((p) => p.name)),
      },
      {
        name: "API Reference",
        tags: ["Users", "Contract", "Expense", "Timeoff", "Collections"],
      },
    ],
  };
};
