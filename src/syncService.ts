import * as vscode from "vscode";
import * as auth from "./auth";
import * as gistService from "./gistService";
import * as localFiles from "./localFiles";

export class SyncService {
  async syncUp() {
    const token = await auth.getGithubToken();
    if (!token) {
      return; // Auth failed, handled in auth.ts
    }

    vscode.window.setStatusBarMessage(
      "$(sync~spin) Sync-On: Uploading...",
      3000,
    );

    try {
      const settings = await localFiles.getFileContent(
        localFiles.SETTINGS_FILE,
      );
      const keybindings = await localFiles.getFileContent(
        localFiles.KEYBINDINGS_FILE,
      );
      const mcpConfig = await localFiles.getFileContent(localFiles.MCP_FILE);
      const extensions = localFiles.getInstalledExtensions();

      // Gather custom files if configured
      // const customFiles = ... (Future implementation)

      const data: gistService.SyncData = {
        settings: settings || undefined,
        keybindings: keybindings || undefined,
        mcpConfig: mcpConfig || undefined,
        extensions: extensions.map((e) => `${e.id}@${e.version}`),
        lastUpload: new Date().toISOString(),
      };

      const existingGist = await gistService.getGist(token);
      if (existingGist) {
        await gistService.updateGist(token, existingGist.id, data);
      } else {
        await gistService.createGist(token, data);
      }

      vscode.window.setStatusBarMessage(
        "$(check) Sync-On: Upload Complete",
        3000,
      );
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Sync-On: Upload failed.");
    }
  }

  async syncDown() {
    const token = await auth.getGithubToken();
    if (!token) {
      return;
    }

    vscode.window.setStatusBarMessage(
      "$(sync~spin) Sync-On: Downloading...",
      3000,
    );

    try {
      const gist = await gistService.getGist(token);
      if (!gist || !gist.files["sync-on-data.json"]) {
        console.log("No sync data found.");
        return;
      }

      const content = gist.files["sync-on-data.json"].content;
      const data: gistService.SyncData = JSON.parse(content);

      if (data.settings) {
        await localFiles.writeFileContent(
          localFiles.SETTINGS_FILE,
          data.settings,
        );
      }
      if (data.keybindings) {
        await localFiles.writeFileContent(
          localFiles.KEYBINDINGS_FILE,
          data.keybindings,
        );
      }
      if (data.mcpConfig) {
        await localFiles.writeFileContent(localFiles.MCP_FILE, data.mcpConfig);
      }
      if (data.extensions) {
        const extsToInstall = data.extensions.map((e) => {
          const [id, version] = e.split("@");
          return { id, version };
        });
        await localFiles.installExtensions(extsToInstall);
      }

      vscode.window.setStatusBarMessage(
        "$(check) Sync-On: Download Complete",
        3000,
      );
      vscode.commands.executeCommand("workbench.action.reloadWindow"); // Optional: Reload to apply settings/extensions
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Sync-On: Download failed.");
    }
  }
}
