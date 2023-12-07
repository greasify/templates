import path from "node:path";
import fs from "node:fs/promises";
import Zip from "adm-zip";

/**
 * @param {import('@types/github-script').AsyncFunctionArguments}
 * @param {string} version
 */
export default async function build({ github, context }, version) {
  const artifactsDirectoryPath = path.join(process.cwd(), "artifacts");
  const templatesDirectoryPath = path.join(process.cwd(), "templates");
  const templatesPath = await fs.readdir(templatesDirectoryPath);
  await fs.mkdir(artifactsDirectoryPath);

  const release = await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    draft: false,
    prerelease: false,
    name: version,
    tag_name: version,
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
      date: Date.now(),
      version,
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
