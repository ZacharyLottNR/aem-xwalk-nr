import { searchAssets } from '../../scripts/asset-search-api.js';
import { renderCard } from '../cards-asset/cards-asset.js';

const DAYS = 30;

function isRecent(dateStr) {
  if (!dateStr) return false;
  const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  return new Date(dateStr).getTime() >= cutoff;
}

export default async function decorate(block) {
  block.textContent = '';

  const loading = document.createElement('p');
  loading.className = 'cards-recent-loading';
  loading.textContent = 'Loading recent assets…';
  block.append(loading);

  try {
    const results = await searchAssets({
      orderBy: 'modified',
      orderDirection: 'desc',
      limit: 100,
    });

    const recent = results.hits.filter((hit) => isRecent(hit.modified));

    block.textContent = '';

    if (!recent.length) {
      const empty = document.createElement('p');
      empty.className = 'cards-recent-empty';
      empty.textContent = 'No assets have been added or updated in the last 30 days.';
      block.append(empty);
      return;
    }

    const ul = document.createElement('ul');
    recent.forEach((asset) => ul.append(renderCard(asset)));
    block.append(ul);
  } catch (err) {
    block.textContent = '';
    const error = document.createElement('p');
    error.className = 'cards-recent-error';
    error.textContent = 'Unable to load recent assets. Please try again later.';
    block.append(error);
  }
}
