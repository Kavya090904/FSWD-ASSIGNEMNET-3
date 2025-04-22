const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const sourcePath = process.argv[2];
const shouldZip = process.argv.includes("--zip");

const backupFolder = path.join(__dirname, "backup");
const logFile = path.join(__dirname, "backup-log.txt");

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function log(message) {
  fs.appendFileSync(logFile, `[${new Date().toLocaleString()}] ${message}\n`);
}

function copyFile(source, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  const stats = fs.statSync(dest);
  return stats.size;
}

function copyFolderRecursive(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  let totalSize = 0;

  for (let entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      totalSize += copyFolderRecursive(srcPath, destPath);
    } else {
      totalSize += copyFile(srcPath, destPath);
      log(`✔ Copied file: ${srcPath}`);
    }
  }
  return totalSize;
}

function zipFolder(folderPath, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(
        `📦 ZIP created: ${zipPath} (${formatBytes(archive.pointer())})`
      );
      resolve();
    });

    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

async function backup() {
  try {
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      console.error("❌ Please provide a valid path (file or folder).");
      return;
    }

    if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);

    const isFile = fs.statSync(sourcePath).isFile();
    const sourceName = path.basename(sourcePath);
    const destPath = path.join(backupFolder, sourceName);

    let totalSize = 0;

    if (isFile) {
      totalSize = copyFile(sourcePath, destPath);
      log(`✔ Copied file: ${sourcePath}`);
    } else {
      totalSize = copyFolderRecursive(sourcePath, destPath);
    }

    log(`✅ Backup complete. Total size: ${formatBytes(totalSize)}\n`);
    console.log(`✅ Backup done: ${formatBytes(totalSize)}`);

    if (shouldZip) {
      const zipFile = path.join(
        __dirname,
        `${sourceName.replace(/\.[^/.]+$/, "")}_backup.zip`
      );
      await zipFolder(destPath, zipFile);
    }
  } catch (err) {
    console.error("⚠️ Error:", err.message);
    log(`⚠️ Error: ${err.message}`);
  }
}
backup();
