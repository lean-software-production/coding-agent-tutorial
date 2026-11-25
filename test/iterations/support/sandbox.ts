import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..", "..", "..");

export type Files = Readonly<Record<string, string>>;

export type Folder = {
  readonly root: string;
  write: (files: Files) => Promise<void>;
  read: (name: string) => Promise<string>;
};

export type Sandbox = {
  readonly project: Folder;
  readonly userHome: Folder;
  remove: () => Promise<void>;
};

// A copy of the project, so nothing the agent edits, runs or logs touches the learner's own files.
export async function aSandbox(): Promise<Sandbox> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "coding-agent-")));
  const project = await aFolder(path.join(root, "project"));
  await copyAgentInto(project.root);

  return {
    project,
    userHome: await aFolder(path.join(root, "user-home")),
    remove: () => rm(root, { recursive: true, force: true }),
  };
}

async function aFolder(root: string): Promise<Folder> {
  await mkdir(root);

  return {
    root,
    write: (files) => writeAll(root, files),
    read: (name) => readFile(path.join(root, name), "utf8"),
  };
}

async function copyAgentInto(folder: string): Promise<void> {
  for (const part of ["src", "bin", "package.json", "tsconfig.json"]) {
    await cp(path.join(projectRoot, part), path.join(folder, part), { recursive: true });
  }
  await symlink(path.join(projectRoot, "node_modules"), path.join(folder, "node_modules"), "junction");
}

async function writeAll(root: string, files: Files): Promise<void> {
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
  }
}
