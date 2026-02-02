import * as vscode from "vscode";

const GITHUB_AUTH_PROVIDER_ID = "github";
const SCOPES = ["gist", "read:user"];

export async function getGithubToken(): Promise<string | undefined> {
  try {
    const session = await vscode.authentication.getSession(
      GITHUB_AUTH_PROVIDER_ID,
      SCOPES,
      { createIfNone: true },
    );
    return session.accessToken;
  } catch (error) {
    vscode.window.showErrorMessage(
      "Sync-On: Failed to authenticate with GitHub.",
    );
    console.error("Sync-On Auth Error:", error);
    return undefined;
  }
}

export async function getSession(): Promise<
  vscode.AuthenticationSession | undefined
> {
  try {
    const session = await vscode.authentication.getSession(
      GITHUB_AUTH_PROVIDER_ID,
      SCOPES,
      { createIfNone: false },
    );
    return session;
  } catch (error) {
    return undefined;
  }
}
