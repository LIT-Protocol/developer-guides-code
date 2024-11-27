export interface NodejsExampleGeneratorSchema {
  category: string;
  subcategoryOption: 'none' | 'existing' | 'new';
  subcategory?: string;
  newSubcategory?: string;
  name: string;
}
