import { moveInstrumentation } from '../../scripts/scripts.js';

function toggleFilterItem(li) {
  li.classList.toggle('selected');
  li.closest('.accordion-filter')?.dispatchEvent(new CustomEvent('filter-change', { bubbles: true }));
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-filter-item-label';
    summary.append(...label.childNodes);

    const body = row.children[1];
    body.className = 'accordion-filter-item-body';

    body.querySelectorAll('li').forEach((li) => {
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        const isSelected = li.classList.contains('selected');
        li.classList.toggle('selected');
        li.setAttribute('aria-selected', !isSelected);
        toggleFilterItem(li);
      });
    });

    const details = document.createElement('details');
    details.open = true;
    moveInstrumentation(row, details);
    details.className = 'accordion-filter-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  block.addEventListener('filter-change', () => {
    const filters = {};
    block.querySelectorAll('details').forEach((detail) => {
      const title = detail.querySelector('summary')?.textContent?.trim().toLowerCase();
      const selected = [...detail.querySelectorAll('li.selected')].map((li) => li.textContent.trim());
      if (selected.length && title) filters[title] = selected;
    });

    block.dispatchEvent(new CustomEvent('asc-filter-update', {
      bubbles: true,
      detail: { filters },
    }));
  });
}
