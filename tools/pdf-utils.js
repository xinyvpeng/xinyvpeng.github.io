const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractTextFromPDF(pdfPath) {
  if (typeof pdfPath !== 'string' || !pdfPath) {
    throw new Error('pdfPath must be a non-empty string');
  }

  const resolvedPath = path.resolve(pdfPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`PDF file not found: ${resolvedPath}`);
  }

  const dataBuffer = await fs.promises.readFile(resolvedPath);
  const parser = new PDFParse({ data: dataBuffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

module.exports = {
  extractTextFromPDF
};