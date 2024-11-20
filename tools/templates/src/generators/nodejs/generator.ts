import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  names,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { NodejsExampleGeneratorSchema } from './schema';

export async function nodejsExampleGenerator(
  tree: Tree,
  options: NodejsExampleGeneratorSchema
) {
  const resolvedOptions = {
    ...options,
    name: names(options.name).fileName,
  };

  const projectRoot = `${resolvedOptions.category}/${resolvedOptions.name}`;
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
