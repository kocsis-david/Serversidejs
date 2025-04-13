/**
 * Utility functions for the application
 */

/**
 * Converts a name into a URL-friendly slug
 * @param {string} name - The name to slugify
 * @returns {string} - The slugified name
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumerics with hyphens
    .replace(/^-+|-+$/g, '');      // Trim leading/trailing hyphens
}

module.exports = {
  slugify
};
