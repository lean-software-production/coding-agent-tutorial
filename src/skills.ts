import { glob, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { parse } from "yaml";

export type Skill = { name: string; description: string; text: string };

export async function loadSkills() {
  const skills = new Map<string, Skill>();
  for (const skill of await skillsIn(homedir())) skills.set(skill.name, skill);
  for (const skill of await skillsIn(process.cwd())) {
    if (skills.has(skill.name)) console.log(`Project skill ${skill.name} replaces your personal one.`);
    skills.set(skill.name, skill);
  }
  console.log(`Skills: ${skills.size}`);

  return skills;
}

async function skillsIn(folder: string) {
  const skills: Skill[] = [];
  for await (const file of glob(path.join(folder, ".agents/skills/*/SKILL.md"))) {
    try {
      skills.push(parseSkill(await readFile(file, "utf8")));
    } catch {
      console.log(`Skipped ${file}: it needs frontmatter with a name and a description.`);
    }
  }

  return skills;
}

function parseSkill(text: string): Skill {
  const frontmatter = text.split(/^---$/m)[1];
  const { name, description } = parse(frontmatter);
  if (!name || !description) throw new Error("incomplete frontmatter");

  return { name, description, text };
}
