import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:5600/swagger/v1/swagger.json', 
  output: 'src/app/api',
  plugins: [
    {
      name: '@hey-api/typescript',
      dates: 'types+transform',
      enums: 'javascript',
      definitions: {
        case: 'preserve', // or 'PascalCase', 'camelCase', etc.
        name: '{{name}}' // template for the name
      },      
    },
    {
      dates: true, 
      name: '@hey-api/transformers',
    }    
  ],
});