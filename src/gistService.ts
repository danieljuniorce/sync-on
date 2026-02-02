import * as vscode from "vscode";

const GIST_DESCRIPTION = "Sync-On Configuration";
const GIST_FILENAME = "sync-on-data.json";

interface GistFile {
  content: string;
}

export interface SyncData {
  settings?: string;
  keybindings?: string;
  extensions?: string[];
  [key: string]: any;
}

export async function getGist(token: string): Promise<any | undefined> {
  try {
    const response = await fetch("https://api.github.com/gists", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gists: ${response.statusText}`);
    }

    const gists = (await response.json()) as any[];
    const syncGist = gists.find((g: any) => g.description === GIST_DESCRIPTION);

    if (syncGist) {
      // Fetch full gist content to get files
      const detailResponse = await fetch(syncGist.url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (detailResponse.ok) {
        return await detailResponse.json();
      }
    }
    return undefined;
  } catch (error) {
    console.error("Sync-On Get Gist Error:", error);
    return undefined;
  }
}

export async function createGist(
  token: string,
  data: SyncData,
): Promise<any | undefined> {
  try {
    const files: { [key: string]: { content: string } } = {
      [GIST_FILENAME]: {
        content: JSON.stringify(data, null, 2),
      },
    };

    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false,
        files: files,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create gist: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Sync-On Create Gist Error:", error);
    vscode.window.showErrorMessage("Sync-On: Failed to create Gist.");
    return undefined;
  }
}

export async function updateGist(
  token: string,
  gistId: string,
  data: SyncData,
): Promise<any | undefined> {
  try {
    const files: { [key: string]: { content: string } } = {
      [GIST_FILENAME]: {
        content: JSON.stringify(data, null, 2),
      },
    };

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: files,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update gist: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Sync-On Update Gist Error:", error);
    vscode.window.showErrorMessage("Sync-On: Failed to update Gist.");
    return undefined;
  }
}
