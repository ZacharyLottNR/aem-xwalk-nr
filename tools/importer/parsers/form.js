/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form variant.
 * Base block: form
 * Source: https://www.nextrow.com/
 * Selector: #request-consultation
 * Generated: 2026-05-11
 *
 * Extracts a HubSpot contact form and produces an EDS Form block
 * with a link to the form definition JSON.
 * The heading and description paragraph above the form are default content
 * (handled by the sections transformer), so this parser focuses on the form element only.
 */
export default function parse(element, { document }) {
  // Find the HubSpot form container
  const formContainer = element.querySelector('.hbspt-form, [class*="hbspt-form"]');
  const hsForm = element.querySelector('form[class*="hs-form"], form[id^="hsForm"]');

  // Extract the HubSpot form ID from the form element or container
  let formId = '';
  if (hsForm) {
    // Try to extract from form id attribute (format: hsForm_{guid})
    const formIdMatch = hsForm.id && hsForm.id.match(/hsForm_([a-f0-9-]+)/);
    if (formIdMatch) {
      formId = formIdMatch[1];
    }
  }
  if (!formId && formContainer) {
    // Try to extract from container id (format: hbspt-form-{guid})
    const containerIdMatch = formContainer.id && formContainer.id.match(/hbspt-form-([a-f0-9-]+)/);
    if (containerIdMatch) {
      formId = containerIdMatch[1];
    }
  }

  // Create a link to the form definition JSON
  // EDS form block expects an anchor pointing to the form definition
  const formLink = document.createElement('a');
  const formPath = '/forms/contact-form';
  formLink.href = formPath;
  formLink.textContent = formPath;

  // Build cells: single row with the form definition link
  const cells = [
    [formLink],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
