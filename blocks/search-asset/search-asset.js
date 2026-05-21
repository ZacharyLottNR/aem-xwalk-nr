import { decorateIcons } from '../../scripts/aem.js';
import { searchAssets, DEFAULT_LIMIT } from '../../scripts/asset-search-api.js';
import { renderCards, appendCards } from '../cards-asset/cards-asset.js';

let apiAvailable = null;

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
  const meta = [...card.querySelectorAll('.cards-asset-card-body ul li')].map((li) => li.textContent.trim());
  const type = meta.find((m) => m.startsWith('TYPE:'))?.replace('TYPE:', '').trim() || '';
  const size = meta.find((m) => m.startsWith('SIZE:'))?.replace('SIZE:', '').trim() || '';
  return {
    title, type, size, element: card,
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

function updateStatistics(displayed, total, ms) {
  const statsBlock = document.querySelector('.columns-statistics');
  if (!statsBlock) return;
  const statValues = statsBlock.querySelectorAll('p:first-child');
  if (statValues[0]) statValues[0].innerHTML = `<strong>${displayed}</strong>`;
  if (statValues[1]) statValues[1].innerHTML = `<strong>${total}</strong>`;
  if (statValues[2] && ms !== undefined) statValues[2].innerHTML = `<strong>${ms}</strong>`;
}

function filterCardsLocal(query, filters) {
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

  const displayed = cards.filter((c) => c.style.display !== 'none').length;
  updateStatistics(displayed, cards.length);
}

function sortCardsLocal(field, direction) {
  const cards = getCardsBlock();
  if (!cards) return;
  const ul = cards.querySelector('ul');
  if (!ul) return;

  const items = [...ul.children];
  items.sort((a, b) => {
    const dataA = getCardData(a);
    const dataB = getCardData(b);

    if (field === 'size') {
      const diff = parseSize(dataA.size) - parseSize(dataB.size);
      return direction === 'asc' ? diff : -diff;
    }

    const valA = dataA.title.toLowerCase();
    const valB = dataB.title.toLowerCase();
    if (direction === 'asc') return valA < valB ? -1 : 1;
    return valA > valB ? -1 : 1;
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
    debounceTimer = setTimeout(() => onSearch(input.value), 300);
  };

  input.addEventListener('input', handleSearch);
  input.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
      clearTimeout(debounceTimer);
      onSearch(input.value);
    }
  });
  button.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    onSearch(input.value);
  });

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
  [
    { value: 'modified', label: 'Last Modified' },
    { value: 'title', label: 'Title' },
    { value: 'size', label: 'Size' },
    { value: 'width', label: 'Width' },
    { value: 'height', label: 'Length' },
  ].forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    fieldSelect.appendChild(opt);
  });

  const dirSelect = document.createElement('select');
  dirSelect.className = 'search-asset-sort-dir';
  dirSelect.setAttribute('aria-label', 'Sort direction');
  [
    { value: 'desc', label: 'DESC' },
    { value: 'asc', label: 'ASC' },
  ].forEach(({ value, label }) => {
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

function createLoadMore(onClick) {
  const btn = document.createElement('button');
  btn.className = 'search-asset-load-more';
  btn.textContent = 'Load more';
  btn.addEventListener('click', onClick);
  return btn;
}

function createFilterGroup(title, options) {
  const details = document.createElement('details');
  details.className = 'filter-group';

  const summary = document.createElement('summary');
  summary.className = 'filter-group-title';
  summary.textContent = title;
  details.append(summary);

  const list = document.createElement('ul');
  list.className = 'filter-group-options';
  options.forEach(({ label, value }) => {
    const li = document.createElement('li');
    li.dataset.value = value;
    li.textContent = label;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.addEventListener('click', () => {
      li.classList.toggle('selected');
      li.setAttribute('aria-selected', li.classList.contains('selected'));
    });
    list.append(li);
  });
  details.append(list);
  return details;
}

function createFilterSidebar(onApply, onReset) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'search-asset-filters';

  const actions = document.createElement('div');
  actions.className = 'filter-actions';
  const applyBtn = document.createElement('button');
  applyBtn.className = 'filter-apply';
  applyBtn.textContent = 'Apply';
  applyBtn.addEventListener('click', onApply);
  const resetBtn = document.createElement('button');
  resetBtn.className = 'filter-reset';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', onReset);
  actions.append(applyBtn, resetBtn);
  sidebar.append(actions);

  const typeFilter = createFilterGroup('Type', [
    { label: 'Image', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Document', value: 'document' },
    { label: 'Presentation', value: 'presentation' },
  ]);

  const modifiedFilter = createFilterGroup('Last Modified', [
    { label: 'Last 24 hours', value: '1' },
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last year', value: '365' },
  ]);

  const createdFilter = createFilterGroup('Created', [
    { label: 'Last 24 hours', value: '1' },
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last year', value: '365' },
  ]);

  const styleFilter = createFilterGroup('Style', [
    { label: 'Photography', value: 'photography' },
    { label: 'Illustration', value: 'illustration' },
    { label: 'Vector', value: 'vector' },
  ]);

  const orientationFilter = createFilterGroup('Orientation', [
    { label: 'Landscape', value: 'landscape' },
    { label: 'Portrait', value: 'portrait' },
    { label: 'Square', value: 'square' },
  ]);

  const drmFilter = createFilterGroup('DRM', [
    { label: 'Royalty Free', value: 'royalty-free' },
    { label: 'Rights Managed', value: 'rights-managed' },
  ]);

  sidebar.append(
    typeFilter,
    modifiedFilter,
    createdFilter,
    styleFilter,
    orientationFilter,
    drmFilter,
  );
  return sidebar;
}

function getSelectedFilters(sidebar) {
  const filters = {};
  sidebar.querySelectorAll('.filter-group').forEach((group) => {
    const title = group.querySelector('summary').textContent.trim().toLowerCase();
    const selected = [...group.querySelectorAll('li.selected')].map((li) => li.dataset.value);
    if (selected.length) filters[title] = selected;
  });
  return filters;
}

async function probeApi() {
  if (apiAvailable !== null) return apiAvailable;
  try {
    const result = await searchAssets({ limit: 1 });
    apiAvailable = result && Array.isArray(result.hits);
  } catch {
    apiAvailable = false;
  }
  return apiAvailable;
}

export default async function decorate(block) {
  block.innerHTML = '';

  let currentQuery = '';
  let currentFilters = {};
  let currentOrderBy = 'modified';
  let currentDirection = 'desc';
  let currentOffset = 0;
  let totalResults = 0;
  let searching = false;
  let useApi = false;

  async function executeSearchApi(append = false) {
    const cards = getCardsBlock();
    if (!cards) return;

    if (!append) {
      currentOffset = 0;
      cards.classList.add('loading');
    }

    const start = performance.now();

    try {
      const types = currentFilters.type || [];
      const results = await searchAssets({
        fulltext: currentQuery,
        types,
        offset: currentOffset,
        limit: DEFAULT_LIMIT,
        orderBy: currentOrderBy,
        orderDirection: currentDirection,
      });

      const elapsed = Math.round(performance.now() - start);
      totalResults = results.total;

      if (append) {
        appendCards(results.hits, cards);
      } else if (results.hits.length === 0) {
        cards.innerHTML = '<p class="search-asset-no-results">No results found. Try adjusting your search or filters.</p>';
      } else {
        renderCards(results.hits, cards);
      }

      currentOffset += results.hits.length;
      const displayed = cards.querySelectorAll(':scope > ul > li').length;
      updateStatistics(displayed, totalResults, elapsed);

      const loadMoreBtn = block.querySelector('.search-asset-load-more');
      if (loadMoreBtn) {
        loadMoreBtn.style.display = results.hasMore ? '' : 'none';
      }
    } finally {
      cards.classList.remove('loading');
    }
  }

  function executeSearchLocal() {
    filterCardsLocal(currentQuery, currentFilters);
    const loadMoreBtn = block.querySelector('.search-asset-load-more');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  }

  async function executeSearch(append = false) {
    if (searching) return;
    searching = true;

    try {
      if (useApi) {
        await executeSearchApi(append);
      } else {
        executeSearchLocal();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('API search failed:', err.message);
      const cards = getCardsBlock();
      if (cards) {
        cards.innerHTML = '<p class="search-asset-error">Unable to load assets. Please try again later.</p>';
      }
    } finally {
      searching = false;
    }
  }

  const searchInput = createSearchInput((query) => {
    currentQuery = query;
    executeSearch();
  });

  const viewToggles = createViewToggles();

  const sortControls = createSortControls((field, dir) => {
    currentOrderBy = field;
    currentDirection = dir;
    if (useApi) {
      executeSearch();
    } else {
      sortCardsLocal(field, dir);
    }
  });

  const loadMoreBtn = createLoadMore(() => executeSearch(true));

  const filterToggle = document.createElement('button');
  filterToggle.className = 'search-asset-filter-toggle';
  filterToggle.setAttribute('aria-label', 'Toggle filters');
  filterToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>';

  const filterSidebar = createFilterSidebar(
    () => {
      currentFilters = getSelectedFilters(filterSidebar);
      executeSearch();
    },
    () => {
      filterSidebar.querySelectorAll('li.selected').forEach((li) => {
        li.classList.remove('selected');
        li.setAttribute('aria-selected', 'false');
      });
      currentFilters = {};
      executeSearch();
    },
  );
  filterSidebar.hidden = true;

  filterToggle.addEventListener('click', () => {
    const isOpen = !filterSidebar.hidden;
    filterSidebar.hidden = isOpen;
    filterToggle.classList.toggle('active', !isOpen);
  });

  const toolbar = document.createElement('div');
  toolbar.className = 'search-asset-toolbar';
  toolbar.append(searchInput, viewToggles, sortControls, filterToggle);

  block.append(toolbar, filterSidebar);

  // Place Load More after the cards-asset block
  const placeLoadMore = () => {
    const cards = getCardsBlock();
    if (cards) {
      cards.parentElement.insertBefore(loadMoreBtn, cards.nextSibling);
    } else {
      block.append(loadMoreBtn);
    }
  };
  requestAnimationFrame(placeLoadMore);

  document.addEventListener('asc-filter-update', (e) => {
    currentFilters = e.detail.filters;
    executeSearch();
  });

  decorateIcons(block);

  // Probe the API to determine if dynamic search is available
  useApi = await probeApi();
  if (useApi) {
    await executeSearch();
  } else {
    loadMoreBtn.style.display = 'none';
    // Defer stats until cards block is decorated
    const waitForCards = () => {
      const cards = getAllCards();
      if (cards.length) {
        updateStatistics(cards.length, cards.length);
      } else {
        requestAnimationFrame(waitForCards);
      }
    };
    waitForCards();
  }
}
