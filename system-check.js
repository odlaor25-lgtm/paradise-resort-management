import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// โหลด Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const prompt = `
คุณเป็นผู้ช่วย DevOps ตรวจสอบไฟล์โค้ดนี้:
- รายงาน error, path ผิด, การตั้งค่าไม่ถูกต้อง
- แนะนำการแก้ไข
ไฟล์: ${filePath}

โค้ด:
${content}
  `;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function main() {
  const projectDir = process.cwd();
  const files = [];

  function readDirRecursive(dir) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        readDirRecursive(fullPath);
      } else if (/\.(html|js|css)$/i.test(file)) {
        files.push(fullPath);
      }
    });
  }

  readDirRecursive(projectDir);

  console.log("🔍 Checking project files with Gemini...");
  for (const file of files) {
    console.log("\n========================================");
    console.log("📄 File:", file);
    try {
      const feedback = await checkFile(file);
      console.log(feedback);
    } catch (err) {
      console.error("❌ Error checking", file, err.message);
    }
  }
}

main();
