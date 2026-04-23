const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch (error) {
    console.error(`Error extracting text from PDF: ${pdfPath}`, error);
    throw error;
  }
}

module.exports = {
  extractTextFromPDF
};