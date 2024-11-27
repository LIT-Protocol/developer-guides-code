import { getExistingSubcategories } from './generator';

export default function (schema, context) {
  const category = context.category;
  const subcategoryOption = context.subcategoryOption;

  if (subcategoryOption === 'existing') {
    return getExistingSubcategories(category).map((name) => ({
      value: name,
      label: name,
    }));
  }

  // For new subcategory, return empty to allow free text input
  return [];
}
