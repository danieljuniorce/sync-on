import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Commands should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("sync-on.login"),
      "sync-on.login should be registered",
    );
    assert.ok(
      commands.includes("sync-on.upload"),
      "sync-on.upload should be registered",
    );
    assert.ok(
      commands.includes("sync-on.download"),
      "sync-on.download should be registered",
    );
  });
});
