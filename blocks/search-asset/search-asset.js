import { decorateIcons } from '../../scripts/aem.js';

function getCardsBlock() {
  return document.querySelector('.cards-asset');
}

function getAllCards() {
  const cards = getCardsBlock();
  if (!cards) return [];
  return [...cards.querySelectorAll(':scope > ul > li')];
}

function getCardData(card) {
  const title = card.querySelector('h3')?.textContent?.trim() || '';
  const meta = [...card.querySelectorAll('ul li')].map((li) => li.textContent.trim());
  const type = meta.find((m) => m.startsWith('TYPE:'))?.replace('TYPE:', '').trim() || '';
  const size = meta.find((m) => m.startsWith('SIZE:'))?.replace('SIZE:', '').trim() || '';
  const res = meta.find((m) => m.startsWith('RES'))?.replace('RES.:', '').replace('RES.', '').trim() || '';
  return {
    title, type, size, res, element: card,
  };
}

function parseSize(sizeStr) {
  const match = sizeStr.match(/([\d,.]+)\s*(KB|MB|GB|B)/i);
  if (!match) return 0;
  const value = parseFloat(match[1].replace(',', ''));
  const unit = match[2].toUpperCase();
  const multipliers = {
    B: 1, KB: 1024, MB: 1048576, GB: 1073741824,
  };
  return value * (multipliers[unit] || 1);
}

function parseResWidth(resStr) {
  const match = resStr.match(/(\d+)\s*x\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseResHeight(resStr) {
  const match = resStr.match(/(\d+)\s*x\s*(\d+)/);
  return match ? parseInt(match[2], 10) : 0;
}

function updateStatistics() {
  const statsBlock = document.querySelector('.columns-statistics');
  if (!statsBlock) return;

  const cards = getAllCards();
  const displayed = cards.filter((c) => c.style.display !== 'none').length;
  const total = cards.length;

  const statValues = statsBlock.querySelectorAll('p:first-child');
  if (statValues[0]) statValues[0].innerHTML = `<strong>${displayed}</strong>`;
  if (statValues[1]) statValues[1].innerHTML = `<strong>${total}</strong>`;
}

function filterCards(query, filters) {
  const cards = getAllCards();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  cards.forEach((card) => {
    const data = getCardData(card);
    let visible = true;

    if (terms.length) {
      const searchable = `${data.title} ${data.type} ${data.size}`.toLowerCase();
      visible = terms.every((term) => searchable.includes(term));
    }

    if (visible && filters.type && filters.type.length) {
      visible = filters.type.some((t) => data.type.toLowerCase() === t.toLowerCase());
    }

    card.style.display = visible ? '' : 'none';
  });

  updateStatistics();
}

function sortCards(field, direction) {
  const cards = getCardsBlock();
  if (!cards) return;
  const ul = cards.querySelector('ul');
  if (!ul) return;

  const items = [...ul.children];
  items.sort((a, b) => {
    const dataA = getCardData(a);
    const dataB = getCardData(b);
    let valA = 0;
    let valB = 0;

    if (field === 'size') {
      valA = parseSize(dataA.size);
      valB = parseSize(dataB.size);
    } else if (field === 'width') {
      valA = parseResWidth(dataA.res);
      valB = parseResWidth(dataB.res);
    } else if (field === 'height') {
      valA = parseResHeight(dataA.res);
      valB = parseResHeight(dataB.res);
    } else {
      valA = dataA.title.toLowerCase();
      valB = dataB.title.toLowerCase();
      if (direction === 'asc') return valA < valB ? -1 : 1;
      return valA > valB ? -1 : 1;
    }

    return direction === 'asc' ? valA - valB : valB - valA;
  });

  items.forEach((item) => ul.appendChild(item));
}

function createSearchInput(onSearch) {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-asset-input-wrapper';

  const icon = document.createElement('span');
  icon.className = 'search-asset-icon';
  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'What are you looking for?';
  input.className = 'search-asset-input';
  input.setAttribute('aria-label', 'Search assets');

  const button = document.createElement('button');
  button.className = 'search-asset-button';
  button.textContent = 'Search';

  let debounceTimer;
  const handleSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => onSearch(input.value), 200);
  };

  input.addEventListener('input', handleSearch);
  input.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') onSearch(input.value);
  });
  button.addEventListener('click', () => onSearch(input.value));

  wrapper.append(icon, input, button);
  return wrapper;
}

function createViewToggles() {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-asset-view-toggles';

  const gridBtn = document.createElement('button');
  gridBtn.className = 'search-asset-toggle active';
  gridBtn.setAttribute('aria-label', 'Grid view');
  gridBtn.title = 'Card Toggle';
  gridBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>';

  const listBtn = document.createElement('button');
  listBtn.className = 'search-asset-toggle';
  listBtn.setAttribute('aria-label', 'List view');
  listBtn.title = 'List Toggle';
  listBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>';

  gridBtn.addEventListener('click', () => {
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    const cards = getCardsBlock();
    if (cards) cards.classList.remove('list-view');
  });

  listBtn.addEventListener('click', () => {
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    const cards = getCardsBlock();
    if (cards) cards.classList.add('list-view');
  });

  wrapper.append(gridBtn, listBtn);
  return wrapper;
}

function createSortControls(onSort) {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-asset-sort';

  const fieldSelect = document.createElement('select');
  fieldSelect.className = 'search-asset-sort-field';
  fieldSelect.setAttribute('aria-label', 'Sort by');
  const fields = [
    { value: 'title', label: 'Last Modified' },
    { value: 'size', label: 'Size' },
    { value: 'width', label: 'Width' },
    { value: 'height', label: 'Length' },
  ];
  fields.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    fieldSelect.appendChild(opt);
  });

  const dirSelect = document.createElement('select');
  dirSelect.className = 'search-asset-sort-dir';
  dirSelect.setAttribute('aria-label', 'Sort direction');
  const dirs = [
    { value: 'desc', label: 'DESC' },
    { value: 'asc', label: 'ASC' },
  ];
  dirs.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    dirSelect.appendChild(opt);
  });

  const handleSort = () => onSort(fieldSelect.value, dirSelect.value);
  fieldSelect.addEventListener('change', handleSort);
  dirSelect.addEventListener('change', handleSort);

  wrapper.append(fieldSelect, dirSelect);
  return wrapper;
}

function setupFilterIntegration(onFilter) {
  document.addEventListener('asc-filter-update', (e) => {
    onFilter(e.detail.filters);
  });
}

export default async function decorate(block) {
  block.innerHTML = '';

  let currentQuery = '';
  let currentFilters = {};

  const runFilter = () => filterCards(currentQuery, currentFilters);

  const searchInput = createSearchInput((query) => {
    currentQuery = query;
    runFilter();
  });

  const viewToggles = createViewToggles();

  const sortControls = createSortControls((field, dir) => {
    sortCards(field, dir);
  });

  const toolbar = document.createElement('div');
  toolbar.className = 'search-asset-toolbar';
  toolbar.append(searchInput, viewToggles, sortControls);

  block.append(toolbar);

  setupFilterIntegration((filters) => {
    currentFilters = filters;
    runFilter();
  });

  decorateIcons(block);
}
