/* eslint-disable */
/* global WebImporter */

/**
 * Parser: search-asset
 * Base block: search
 * Source: https://publish-p63260-e524717.adobeaemcloud.com/content/asset-share-commons/en/light.html
 * Generated: 2026-05-11
 *
 * Parses AEM Asset Share Commons search controls (search bar, layout toggles, sort dropdowns)
 * into a search-asset block. The block model has a single "index" field pointing to the
 * query index data source.
 *
 * Source selectors (3 instances mapped to this block):
 *   - .cmp-search-search-bar  (search input + button)
 *   - .cmp-search-layout-toggle (grid/list view toggles)
 *   - .cmp-search-sort (sort dropdowns)
 *
 * The parser creates the block table on the search bar element and removes the
 * layout toggle and sort elements (they are UI controls not represented in the block model).
 */
export default function parse(element, { document }) {
  // Determine which instance element we are processing
  const isSearchBar = element.classList.contains('cmp-search-search-bar');
  const isLayoutToggle = element.classList.contains('cmp-search-layout-toggle');
  const isSort = element.classList.contains('cmp-search-sort');

  // For layout toggle and sort elements, remove them since they are not part of the block model
  if (isLayoutToggle || isSort) {
    element.remove();
    return;
  }

  // Only the search bar element produces the block table
  // The block model has one field: "index" (string) — the path/URL to the query index
  // The source HTML does not contain an explicit index URL, so we use the default query-index path
  const indexPath = '/query-index.json';

  // Create an anchor element for the index field so the block decoration can read it
  const indexLink = document.createElement('a');
  indexLink.href = indexPath;
  indexLink.textContent = indexPath;

  // Build the field-hinted fragment for xwalk (field: index)
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(' field:index '));
  frag.appendChild(indexLink);

  // cells: 1 row with the index link (simple block, 1 non-classes field = 1 row)
  const cells = [
    [frag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-asset', cells });
  element.replaceWith(block);
}
