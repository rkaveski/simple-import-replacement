
# Simple Import Replacement

A script to replace relative imports with absolute imports in TypeScript and JavaScript files.

## Description

This script processes files in your current directory (or a specified one) and its subdirectories, converting relative import paths to absolute import paths. It supports `ts`, `tsx`, `js`, and `jsx` file extensions.

## Installation

### Local Installation

You can install the package locally as a development dependency:

```bash
npm install --save-dev simple-import-replacement
```

or using yarn:

```bash
yarn add --dev simple-import-replacement
```

### Global Installation

You can install the package globally:

```bash
npm install -g simple-import-replacement
```

or using yarn:

```bash
yarn global add simple-import-replacement
```

### Using npx

You can run the script directly using npx without installing it:

```bash
npx simple-import-replacement
```

## Usage

### Local Installation

Add a script to your `package.json`:

```json
{
  "scripts": {
    "replace-imports": "simple-import-replacement"
  }
}
```

Run the script:

```bash
npm run replace-imports
```

or using yarn:

```bash
yarn replace-imports
```

### Global Installation

Run the script directly:

```bash
replace-imports
```

### Using npx

Run the script using npx:

```bash
npx simple-import-replacement
```

### Additional Examples

#### Default behavior (scan for **/*.{ts,tsx,js,jsx} files in the current directory and its subdirectories)

```bash
npx simple-import-replacement
```

#### Specify a root directory (scan for **/*.{ts,tsx,js,jsx} files in the specified directory and its subdirectories)

```bash
npx simple-import-replacement /path/to/your/project/src
```

#### Specify a root directory and custom file patterns

```bash
npx simple-import-replacement /path/to/your/project/src **/*.ts **/*.js
```

## Example

Suppose you have a project structure as follows:

```
/path/to/your/project/src/
├── com/
│   ├── test/
│   │   ├── foo/
│   │   │   ├── bar/
│   │   │   │   └── example.ts
│   │   │   └── another/
│   │   │       └── anotherThing.ts
│   └── components/
│       └── MyComponent.ts
```

And your `example.ts` file contains the following imports:

```typescript
import something from './something';
import anotherThing from '../another/anotherThing';
import React from 'react';
export { MyComponent } from '../../components/MyComponent';
```

Running the script:

```bash
npx simple-import-replacement
```

will update `example.ts` to:

```typescript
import something from 'com/test/foo/bar/something';
import anotherThing from 'com/test/foo/another/anotherThing';
import React from 'react';
export { MyComponent } from 'com/components/MyComponent';
```

## Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions for improvements.

## License

This project is licensed under the MIT License.
