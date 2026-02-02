import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface ExtensionInfo {
  id: string;
  version: string;
}

function getUserDataDir(): string {
  const home = process.env.HOME || "";
  const candidates: string[] = [];

  const platform = process.platform;
  const isMac = platform === "darwin";
  const isWindows = platform === "win32";
  const isLinux = platform === "linux";

  // Standard paths
  if (isWindows && process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, "Code", "User"));
    candidates.push(path.join(process.env.APPDATA, "Code - OSS", "User"));
    candidates.push(path.join(process.env.APPDATA, "VSCodium", "User"));
    candidates.push(path.join(process.env.APPDATA, "Cursor", "User"));
    candidates.push(path.join(process.env.APPDATA, "Windsurf", "User"));
  } else if (isMac) {
    candidates.push(
      path.join(home, "Library", "Application Support", "Code", "User"),
    );
    candidates.push(
      path.join(home, "Library", "Application Support", "Code - OSS", "User"),
    );
    candidates.push(
      path.join(home, "Library", "Application Support", "VSCodium", "User"),
    );
    candidates.push(
      path.join(home, "Library", "Application Support", "Cursor", "User"),
    );
    candidates.push(
      path.join(home, "Library", "Application Support", "Windsurf", "User"),
    );
  } else if (isLinux) {
    // Standard Config
    candidates.push(path.join(home, ".config", "Code", "User"));
    candidates.push(path.join(home, ".config", "Code - OSS", "User"));
    candidates.push(path.join(home, ".config", "VSCodium", "User"));
    candidates.push(path.join(home, ".config", "Cursor", "User"));
    candidates.push(path.join(home, ".config", "Windsurf", "User"));

    // Flatpak
    candidates.push(
      path.join(
        home,
        ".var",
        "app",
        "com.visualstudio.code",
        "config",
        "Code",
        "User",
      ),
    );

    // Snap
    candidates.push(
      path.join(home, "snap", "code", "current", ".config", "Code", "User"),
    );
  }

  // Filter for paths that exist and contain settings.json
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "settings.json"))) {
      console.log(`[Sync-On] Found settings at: ${candidate}`);
      return candidate;
    }
  }

  // Fallback: Return the first candidate that exists as a directory
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log(
        `[Sync-On] Found User dir (no settings.json yet): ${candidate}`,
      );
      return candidate;
    }
  }

  // Ultimate fallback
  const defaultPath = isWindows
    ? path.join(process.env.APPDATA || "", "Code", "User")
    : isMac
      ? path.join(home, "Library", "Application Support", "Code", "User")
      : path.join(home, ".config", "Code", "User");

  console.log(
    `[Sync-On] No User dir found, validation falling back to: ${defaultPath}`,
  );
  return defaultPath;
}

export const USER_DIR = getUserDataDir();
export const SETTINGS_FILE = path.join(USER_DIR, "settings.json");
export const KEYBINDINGS_FILE = path.join(USER_DIR, "keybindings.json");
export const SNIPPETS_DIR = path.join(USER_DIR, "snippets");
export const MCP_FILE = path.join(USER_DIR, "mcp.json");

export async function getFileContent(filePath: string): Promise<string | null> {
  if (fs.existsSync(filePath)) {
    return fs.promises.readFile(filePath, "utf8");
  }
  return null;
}

export async function writeFileContent(
  filePath: string,
  content: string,
): Promise<void> {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
  await fs.promises.writeFile(filePath, content, "utf8");
}

export function getInstalledExtensions(): ExtensionInfo[] {
  return vscode.extensions.all
    .filter((ext) => !ext.packageJSON.isBuiltin)
    .map((ext) => ({
      id: ext.id,
      version: ext.packageJSON.version,
    }));
}

export async function installExtensions(extensions: ExtensionInfo[]) {
  for (const ext of extensions) {
    try {
      await vscode.commands.executeCommand(
        "workbench.extensions.installExtension",
        ext.id,
      );
    } catch (e) {
      console.error(`Failed to install ${ext.id}: `, e);
    }
  }
}

export function getCustomFiles(
  globPatterns: string[],
): Promise<{ [path: string]: string }> {
  // TODO: Implement glob matching if needed in future, for now treating as absolute paths or relative to User dir could be simple start
  return Promise.resolve({});
}
