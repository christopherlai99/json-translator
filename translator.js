const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

// Available languages to translate to
const languages = {
  es: 'Spanish',
  vi: 'Vietnamese',
  pt: 'Portuguese',
  ar: 'Arabic',
  fr: 'French',
  ru: 'Russian',
  de: 'German',
  // Add more languages as needed
};

// Path to your English JSON file
const inputFile = 'en.json';

// Function to translate JSON content
async function translateJSON(jsonObj, targetLang) {
  const translatedObj = {};
  
  // Process each key in the JSON
  for (const key in jsonObj) {
    try {
      // Skip translation if the value is not a string
      if (typeof jsonObj[key] !== 'string') {
        translatedObj[key] = jsonObj[key];
        continue;
      }
      
      // Translate the value
      const result = await translate(jsonObj[key], { to: targetLang });
      translatedObj[key] = result.text;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error translating ${key}: ${error}`);
      // Keep the original text if translation fails
      translatedObj[key] = jsonObj[key];
    }
  }
  
  return translatedObj;
}

// Main function to read the source file and generate translations
async function generateTranslations() {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`Input file '${inputFile}' not found.`);
      return;
    }
    
    // Read and parse the English JSON file
    const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log(`Successfully read ${inputFile}`);
    
    // Create output directory if it doesn't exist
    const outputDir = 'translations';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Translate to each language
    for (const langCode in languages) {
      console.log(`Translating to ${languages[langCode]} (${langCode})...`);
      
      const translatedData = await translateJSON(jsonData, langCode);
      
      // Write the translated JSON to a file
      const outputFile = path.join(outputDir, `${langCode}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(translatedData, null, 2), 'utf8');
      
      console.log(`Translation to ${languages[langCode]} completed: ${outputFile}`);
    }
    
    console.log('\nAll translations completed!');
    
  } catch (error) {
    console.error('Error in translation process:', error);
  }
}

// Run the program
generateTranslations();