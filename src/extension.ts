import * as vscode from "vscode";
import { getResolverByMethod } from "./util";

export function activate(context: vscode.ExtensionContext) {
	
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const projectPath = workspaceFolders?.[0]?.uri.fsPath;
	const nestSrc = `${ projectPath }/nest/src/`;
	
  function provideDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.Location> {
		const fileName = document.fileName;
		if (!fileName.endsWith("Api.ts") && !fileName.endsWith(".graphql") && !fileName.endsWith(".gql")) {
			return;
		}
		const wordRange = document.getWordRangeAtPosition(position);
		const word = document.getText(wordRange);
		const location = getResolverByMethod(nestSrc, word);
		return location;
	}
  
  context.subscriptions.push(vscode.languages.registerDefinitionProvider([ "typescript", "graphql" ], {
	  provideDefinition,
	}));
}

export function deactivate() {
}
