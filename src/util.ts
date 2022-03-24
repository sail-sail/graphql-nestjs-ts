import { readdirSync, readFileSync, statSync } from "fs";
import * as vscode from "vscode";

// export function getProjectPath(fileName: string): string {
//   let projectPath = "";
//   const workspaceFolders = vscode.workspace.workspaceFolders;
//   if (workspaceFolders) {
//     for (const folder of workspaceFolders) {
//       if (fileName.startsWith(folder.uri.fsPath)) {
//         projectPath = folder.uri.fsPath;
//         break;
//       }
//     }
//   }
//   return projectPath;
// }

export function getResolverByMethod(
  nestSrc: string,
  method: string,
): vscode.Location {
  const reg = new RegExp(`(@Query\\(.*?,[\\s]*?\\{[\\s]*?name:[\\s]*?"${ method }"[\\s]*?,)|@Mutation\\(.*?,[\\s]*?\\{[\\s]*?name:[\\s]*?"${ method }"[\\s]*?,`);
  let location: vscode.Location = undefined;
  function tmpFn(dir: string) {
    const files = readdirSync(nestSrc + dir);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const stats = statSync(nestSrc + dir + "/" + file);
      if (file === "node_modules") {
        continue;
      }
      if (stats.isDirectory()) {
        tmpFn(dir + "/" + file);
        continue;
      }
      if (stats.isFile()) {
        if (file.endsWith(".resolver.ts")) {
          const resolverFile = nestSrc + dir + "/" + file;
          const resolverContent = readFileSync(resolverFile, "utf-8");
          const arr = resolverContent.split("\n");
          let has = false;
          let lineNum = 0;
          let characterNum = 0;
          for (let i = 0; i < arr.length; i++) {
            const line = arr[i];
            if (reg.test(line)) {
              lineNum = i + 1;
              for (let k = lineNum; k < arr.length; k++) {
                if (!arr[k].trim().startsWith("@")) {
                  lineNum = k;
                  break;
                }
              }
              characterNum = arr[lineNum]?.length - 2;
              has = true;
              break;
            }
          }
          if (has) {
            location = new vscode.Location(
              vscode.Uri.file(resolverFile),
              new vscode.Position(lineNum, characterNum),
            );
            break;
          }
        }
      }
    }
  }
  tmpFn("/");
  return location;
}
