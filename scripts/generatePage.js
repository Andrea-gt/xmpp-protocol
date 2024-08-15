import fs from 'fs';
import path from 'path';

// Function to generate a React page
const generatePage = (pageName) => {
  // Define the directory for the new page
  const pageDir = path.join(process.cwd(), 'src/pages', pageName);

  // Create the page directory if it doesn't exist
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // Page template
  const pageTemplate = `
import React from 'react';

const ${pageName} = () => {
  return (
    <div>
      <h1>${pageName} Page</h1>
    </div>
  );
};

export default ${pageName};
`;

  // Index file template
  const indexTemplate = `export { default } from './${pageName}';`;

  // Write the page file
  fs.writeFileSync(path.join(pageDir, `${pageName}.jsx`), pageTemplate.trim());
  
  // Write the index file
  fs.writeFileSync(path.join(pageDir, 'index.js'), indexTemplate.trim());

  console.log(`Page ${pageName} created successfully at ${pageDir}`);
};

// Get the page name from the command line arguments
const pageName = process.argv[2];

if (!pageName) {
  console.error('Please provide a page name.');
  process.exit(1);
}

// Call the function to generate the page
generatePage(pageName);