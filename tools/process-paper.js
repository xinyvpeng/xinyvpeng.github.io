#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('./pdf-utils');

async function processPaper(paperFolder) {
  const paperPath = path.join(__dirname, '..', 'paper', paperFolder);
  
  if (!fs.existsSync(paperPath)) {
    console.error(`Paper folder not found: ${paperPath}`);
    process.exit(1);
  }
  
  const pdfFiles = fs.readdirSync(paperPath).filter(file => file.endsWith('.pdf'));
  if (pdfFiles.length === 0) {
    console.error(`No PDF files found in ${paperPath}`);
    process.exit(1);
  }
  
  const pdfFile = pdfFiles[0];
  const pdfPath = path.join(paperPath, pdfFile);
  
  console.log(`Processing: ${pdfFile}`);
  
  try {
    const text = await extractTextFromPDF(pdfPath);
    console.log(`Extracted ${text.length} characters from PDF`);
    
    const textFilePath = path.join(paperPath, 'extracted-text.txt');
    fs.writeFileSync(textFilePath, text, 'utf-8');
    console.log(`Saved extracted text to: ${textFilePath}`);
    
    return {
      paperFolder,
      pdfFile,
      text,
      textFilePath,
      paperPath
    };
  } catch (error) {
    console.error(`Failed to process PDF: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  const paperFolder = process.argv[2];
  if (!paperFolder) {
    console.log('Usage: node scripts/process-paper.js <paper_folder>');
    console.log('Example: node scripts/process-paper.js NeuPAN');
    process.exit(1);
  }
  
  processPaper(paperFolder).then(result => {
    console.log('PDF text extracted successfully');
    console.log('Next step: AI assistant will analyze the text and generate outputs');
  }).catch(error => {
    console.error('Processing failed:', error);
    process.exit(1);
  });
}

module.exports = {
  processPaper
};
