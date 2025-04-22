// organizer.js

const fs = require("fs");
const path = require("path");

// Define file type categories
const fileTypes = {
  Images: [".jpg", ".jpeg", ".png", ".gif", ".svg"],
  Documents: [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
  ],
  Videos: [".mp4", ".mkv", ".avi", ".mov"],
  Music: [".mp3", ".wav", ".flac"],
  Archives: [".zip", ".rar", ".7z", ".tar", ".gz"],
  Code: [".js", ".java", ".py", ".cpp", ".html", ".css"],
  Others: [],
};

// Get directory from command-line arguments
const directory = process.argv[2];

function getCategory(extension) {
  for (let category in fileTypes) {
    if (fileTypes[category].includes(extension.toLowerCase())) {
      return category;
    }
  }
  return "Others";
}

function organizeFiles(dirPath) {
  try {
    if (!dirPath) {
      console.log("❌ Please provide a directory path.");
      return;
    }

    // Check if the directory exists
    if (!fs.existsSync(dirPath)) {
      console.log("❌ The specified directory does not exist.");
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);

      // Skip directories
      if (fs.lstatSync(fullPath).isDirectory()) return;

      const extension = path.extname(file);
      const category = getCategory(extension);

      const categoryFolder = path.join(dirPath, category);

      // Create category folder if it doesn't exist
      if (!fs.existsSync(categoryFolder)) {
        fs.mkdirSync(categoryFolder);
      }

      // Move file to the category folder
      const destPath = path.join(categoryFolder, file);
      fs.renameSync(fullPath, destPath);

      console.log(`✅ Moved: ${file} → ${category}/`);
    });

    console.log("\n🎉 Files organized successfully!");
  } catch (err) {
    console.error("⚠️ Error:", err.message);
  }
}

// Run the function with the provided directory
organizeFiles(directory);
