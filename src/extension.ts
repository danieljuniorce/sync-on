import * as vscode from "vscode";
import { SyncService } from "./syncService";
import * as auth from "./auth";

let syncService: SyncService;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "sync-on" is now active!');

  syncService = new SyncService();

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("sync-on.login", async () => {
      const token = await auth.getGithubToken();
      if (token) {
        vscode.window.showInformationMessage("Sync-On: Logged in to GitHub!");
      }
    }),
    vscode.commands.registerCommand("sync-on.upload", () =>
      syncService.syncUp(),
    ),
    vscode.commands.registerCommand("sync-on.download", () =>
      syncService.syncDown(),
    ),
  );

  // Initial Sync (Download)
  // We delay this slightly to ensure VS Code is fully setup
  setTimeout(() => {
    auth.getSession().then((session) => {
      if (session) {
        syncService.syncDown();
      }
    });
  }, 5000);

  // Watchers (Upload on change)
  let throttleTimeout: NodeJS.Timeout | undefined;
  const triggerUpload = () => {
    if (throttleTimeout) {
      clearTimeout(throttleTimeout);
    }
    throttleTimeout = setTimeout(() => {
      syncService.syncUp();
    }, 30000); // 30 seconds debounce
  };

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration("sync-on")) {
        // Ignore our own config changes
        triggerUpload();
      }
    }),
    vscode.extensions.onDidChange(triggerUpload),
  );
}

export function deactivate() {
  // Attempt one final sync up on close
  if (syncService) {
    return syncService.syncUp();
  }
}
