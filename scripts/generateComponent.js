import fs from 'fs';
import path from 'path';

// Function to generate a React component
const generateComponent = (componentName) => {
  // Define the directory for the new component
  const componentDir = path.join(process.cwd(), 'src/components', componentName);

  // Create the component directory if it doesn't exist
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Component template
  const componentTemplate = `
import React from 'react';

const ${componentName} = () => {
  return (
    <div>
      <h2>${componentName} Component</h2>
    </div>
  );
};

export default ${componentName};
`;

  // Index file template
  const indexTemplate = `export { default } from './${componentName}';`;

  // Write the component file
  fs.writeFileSync(path.join(componentDir, `${componentName}.jsx`), componentTemplate.trim());
  
  // Write the index file
  fs.writeFileSync(path.join(componentDir, 'index.js'), indexTemplate.trim());

  console.log(`Component ${componentName} created successfully at ${componentDir}`);
};

// Get the component name from the command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error('Please provide a component name.');
  process.exit(1);
}

// Call the function to generate the component
generateComponent(componentName);