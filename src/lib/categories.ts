export const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Appetizers",
  "Soups & Salads",
  "Desserts",
  "Drinks",
  "Sides",
  "Snacks",
] as const;

export type Category = (typeof CATEGORIES)[number];
