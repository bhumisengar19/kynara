import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfImport = require("pdf-parse");
const pdf = pdfImport.PDFParse || (typeof pdfImport === 'function' ? pdfImport : (pdfImport.default || pdfImport));
import csv from "csv-parser";
import mammoth from "mammoth";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractTextFromFile = async (fileUrl) => {
    try {
        // If fileUrl is a local path (starts with http://.../uploads/)
        let filePath = "";
        if (fileUrl.includes("/uploads/")) {
            const fileName = decodeURIComponent(fileUrl.split("/uploads/")[1]);
            filePath = path.join(__dirname, "../../uploads", fileName);
        } else {
            console.warn("External file URLs are not supported for text extraction yet:", fileUrl);
            return "";
        }

        if (!fs.existsSync(filePath)) {
            console.error("File NOT FOUND at path:", filePath);
            return "";
        }

        const ext = path.extname(filePath).toLowerCase();
        const buffer = fs.readFileSync(filePath);

        let extractedText = "";

        if (ext === ".pdf") {
            let data;
            if (typeof pdf === 'function' && pdf.prototype && pdf.prototype.getText) {
                // New pdf-parse v2.x API
                const parser = new pdf({ data: buffer });
                data = await parser.getText();
                extractedText = data.text;
                await parser.destroy();
            } else if (typeof pdf === 'function') {
                // Old pdf-parse v1.x API
                data = await pdf(buffer);
                extractedText = data.text;
            } else {
                throw new Error("pdf parser is not a valid function or class! Type: " + typeof pdf);
            }
        } else if (ext === ".docx") {
            const data = await mammoth.extractRawText({ buffer });
            extractedText = data.value;
        } else if (ext === ".csv") {
            extractedText = await new Promise((resolve) => {
                let results = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on("data", (data) => results.push(JSON.stringify(data)))
                    .on("end", () => {
                        resolve(results.join("\n").substring(0, 10000)); // Limit to first 10k chars
                    });
            });
        } else if (ext === ".txt" || ext === ".js" || ext === ".json") {
            extractedText = buffer.toString("utf-8");
        }

        return extractedText;
    } catch (error) {
        console.error("CRITICAL EXTRACTION ERROR:", error.message);
        return "";
    }
};
