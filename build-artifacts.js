import path from "node:path";
import fs from "node:fs/promises";
import Zip from "adm-zip";

/** @param {import('@types/github-script').AsyncFunctionArguments} AsyncFunctionArguments */
export default async function build({ github, context }) {
  const artifactsDirectoryPath = path.join(process.cwd(), "artifacts");
  const templatesDirectoryPath = path.join(process.cwd(), "templates");
  const templatesPath = await fs.readdir(templatesDirectoryPath);

  try {
    await fs.mkdir(artifactsDirectoryPath);
  } catch {}

  const release = await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    draft: false,
    prerelease: false,
    tag_name: "latest",
  });

  async function uploadArtifact(name, path) {
    await github.rest.repos.uploadReleaseAsset({
      owner: context.repo.owner,
      repo: context.repo.repo,
      origin: release.data.upload_url,
      release_id: release.data.id,
      name,
      data: await fs.readFile(path),
    });
  }

  async function createZipArchive(name) {
    const zip = new Zip();
    const fileName = `${name}.zip`;
    const outputFile = path.resolve(artifactsDirectoryPath, fileName);
    zip.addLocalFolder(path.resolve(templatesDirectoryPath, name));
    zip.writeZip(outputFile);
    await uploadArtifact(fileName, outputFile);
    console.log(`Created "${fileName}" successfully`);
  }

  for (const templateName of templatesPath) {
    await createZipArchive(templateName);
  }

  async function createMetaFile(templates) {
    const meta = {
      last_update: Date.now(),
      templates,
    };

    const fileName = "meta.json";
    const outputFile = path.resolve(artifactsDirectoryPath, fileName);
    await fs.writeFile(outputFile, JSON.stringify(meta));
    await uploadArtifact(fileName, outputFile);
    console.log(`Created "${fileName}" successfully`);
  }

  await createMetaFile(templatesPath);

  console.log("Build artifacts done");
}
