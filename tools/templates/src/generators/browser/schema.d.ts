export interface BrowserExampleGeneratorSchema {
  category: string;
  subcategoryOption: 'none' | 'existing' | 'new';
  subcategory?: string;
  newSubcategory?: string;
  name: string;
}
