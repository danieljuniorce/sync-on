import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface ExtensionInfo {
  id: string;
  version: string;
}

function getUserDataDir(): string {
  // Attempt to detect User directory based on platform
  // This is a best-guess and might need configuration for some forks
  const appData =
    process.env.APPDATA ||
    (process.platform === "darwin"
      ? process.env.HOME + "/Library/Application Support"
      : process.env.HOME + "/.config");

  // We try to detect the code variant.
  // 'Code' is standard. 'Code - OSS' is VSCodium/others. 'Cursor' is Cursor.
  // We can check what process is running or check folder existence.
  const possibleDirs = ["Code", "Code - OSS", "VSCodium", "Cursor", "Windsurf"];

  for (const dir of possibleDirs) {
    const fullPath = path.join(appData, dir, "User");
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Fallback to standard Code if nothing found (or let user configure)
  return path.join(appData, "Code", "User");
}

export const USER_DIR = getUserDataDir();
export const SETTINGS_FILE = path.join(USER_DIR, "settings.json");
export const KEYBINDINGS_FILE = path.join(USER_DIR, "keybindings.json");
export const SNIPPETS_DIR = path.join(USER_DIR, "snippets");

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
