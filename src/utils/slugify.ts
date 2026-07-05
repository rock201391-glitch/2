/**
 * Converts a string into a URL-friendly slug.
 * Example: "عطور رجالية" → "tur-rjaly" (via Latin normalization)
 * Example: "Men Perfumes" → "men-perfumes"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w-]+/g, "");
}
