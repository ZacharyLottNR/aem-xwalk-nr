import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { resolveNestedBlocks } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // Each row is a tab sub-block (UE block div, or an imported nested table).
  const tabBlocks = resolveNestedBlocks(block, 'tabbed-content-tab-stryker');

  await Promise.all(tabBlocks.map(async (row) => {
    decorateBlock(row);
    await loadBlock(row);
  }));

  // Keep only tabs that resolved a non-empty name.
  const tabs = tabBlocks
    .map((el) => ({ el, name: el.dataset.tabName?.trim() }))
    .filter((t) => t.name);

  block.textContent = '';

  if (!tabs.length) return;

  const tablist = document.createElement('div');
  tablist.className = 'tabbed-content-stryker-tablist';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabbed-content-stryker-panels';

  tabs.forEach((tab, i) => {
    const id = `tabbed-content-stryker-${i}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabbed-content-stryker-tab';
    button.textContent = tab.name;
    button.setAttribute('role', 'tab');
    button.id = `${id}-tab`;
    button.setAttribute('aria-controls', `${id}-panel`);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) button.classList.add('is-active');

    const panel = tab.el;
    panel.classList.add('tabbed-content-stryker-panel');
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${id}-tab`);
    panel.hidden = i !== 0;

    button.addEventListener('click', () => {
      tablist.querySelectorAll('.tabbed-content-stryker-tab').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.querySelectorAll('.tabbed-content-stryker-panel').forEach((p) => {
        p.hidden = true;
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
      panel.hidden = false;
    });

    tablist.append(button);
    panels.append(panel);
  });

  block.append(tablist, panels);
}
