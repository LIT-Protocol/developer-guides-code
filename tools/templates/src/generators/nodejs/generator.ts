import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { NodejsExampleGeneratorSchema } from './schema';
import { readdirSync } from 'fs';

export function getExistingSubcategories(category: string): string[] {
  try {
    return readdirSync(category, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch {
    return [];
  }
}

export async function nodejsExampleGenerator(
  tree: Tree,
  options: NodejsExampleGeneratorSchema
) {
  const resolvedOptions = {
    ...options,
    name: names(options.name).fileName,
  };

  let subcategory = '';
  if (options.subcategoryOption === 'existing') {
    const existingSubcategories = getExistingSubcategories(options.category);
    if (!existingSubcategories.includes(options.subcategory || '')) {
      throw new Error(
        `Subcategory "${options.subcategory}" does not exist in category "${
          options.category
        }". Available subcategories: ${existingSubcategories.join(', ')}`
      );
    }
    subcategory = options.subcategory || '';
  } else if (options.subcategoryOption === 'new') {
    subcategory = options.subcategory || '';
  }

  const projectRoot = subcategory
    ? `${resolvedOptions.category}/${subcategory}/${resolvedOptions.name}`
    : `${resolvedOptions.category}/${resolvedOptions.name}`;

  addProjectConfiguration(tree, resolvedOptions.name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    projectRoot,
    resolvedOptions
  );
  await formatFiles(tree);
}

export default nodejsExampleGenerator;
