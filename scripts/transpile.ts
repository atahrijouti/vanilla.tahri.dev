import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs"
import path from "path"

const SRC_FOLDER = "./src"
const DIST_FOLDER = "./dist"

const transpiler = new Bun.Transpiler({
  loader: "ts",
  target: "browser",
})

export const listTypeScriptFiles = (dir: string): string[] => {
  const files: string[] = []
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath))
    } else if (fullPath.endsWith(".ts")) {
      files.push(fullPath)
    }
  }

  return files
}

export const transpileAndWriteFiles = async (tsFiles: string[]) => {
  for (const file of tsFiles) {
    const code = await Bun.file(file).text()

    const fileRelativePath = path.relative(SRC_FOLDER, file)
    const outputPath = path.join(DIST_FOLDER, fileRelativePath.replace(/\.ts$/, ".js"))

    const transpiledCode = transpiler.transformSync(code)

    mkdirSync(path.dirname(outputPath), { recursive: true })

    writeFileSync(outputPath, transpiledCode, "utf8")

    // console.log(`Transpile :\t${file} -> ${outputPath}`)
  }
}
