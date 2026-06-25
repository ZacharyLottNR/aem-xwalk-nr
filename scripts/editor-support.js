import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadScript,
  loadSections,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import { decorateMain, decorateSectionAnchors } from './scripts.js';

let promiseChanges$ = Promise.resolve();

async function applyChanges(event) {
  await promiseChanges$;

  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  if (!resource) return false;
  const updates = detail?.response?.updates;
  if (!updates.length) return false;
  const { content } = updates[0];
  if (!content) return false;

  // load dompurify
  await loadScript(`${window.hlx.codeBasePath}/scripts/dompurify.min.js`);

  const sanitizedContent = window.DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  const parsedUpdate = new DOMParser().parseFromString(sanitizedContent, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);

  if (element) {
    if (element.matches('main')) {
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      if (!newMain) return false;
      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadSections(newMain);
      element.remove();
      newMain.style.display = null;
      // eslint-disable-next-line no-use-before-define
      attachEventListeners(newMain);
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);
        await loadBlock(newBlock);
        block.remove();
        newBlock.style.display = null;
        return true;
      }
    } else {
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        if (element.matches('.section')) {
          const [newSection] = newElements;
          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateSectionAnchors(parentElement);
          decorateBlocks(parentElement);
          await loadSections(parentElement);
          element.remove();
          newSection.style.display = null;
        } else {
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
        }
        return true;
      }
    }
  }

  return false;
}

// Reloading is the intended fallback when a change can't be applied in place
// (e.g. adding/moving items). But if a reload re-fires the same unappliable
// event we can spin into an infinite loop. Guard with a short-lived counter:
// allow a few rapid reloads, then stop and let the editor settle.
const RELOAD_GUARD_KEY = 'aue-reload-guard';
const RELOAD_GUARD_WINDOW = 5000;
const RELOAD_GUARD_MAX = 3;

function reloadWithGuard() {
  let count = 0;
  try {
    const raw = window.sessionStorage.getItem(RELOAD_GUARD_KEY);
    if (raw) {
      const { ts, n } = JSON.parse(raw);
      if (Date.now() - ts < RELOAD_GUARD_WINDOW) count = n;
    }
    if (count >= RELOAD_GUARD_MAX) {
      // eslint-disable-next-line no-console
      console.error('Skipping reload to avoid a Universal Editor refresh loop.');
      return;
    }
    const next = JSON.stringify({ ts: Date.now(), n: count + 1 });
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, next);
  } catch (e) { /* sessionStorage unavailable; fall through to reload */ }
  window.location.reload();
}

function attachEventListeners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
    'aue:content-copy',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    let applied = false;
    try {
      promiseChanges$ = applyChanges(event);
      applied = await promiseChanges$;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('applyChanges failed', e);
    }
    if (applied) {
      try { window.sessionStorage.removeItem(RELOAD_GUARD_KEY); } catch (e) { /* ignore */ }
    } else {
      reloadWithGuard();
    }
  }));
}

attachEventListeners(document.querySelector('main'));

// decorate rich text
// this has to happen after decorateMain(), and everythime decorateBlocks() is called
decorateRichtext();
// in cases where the block decoration is not done in one synchronous iteration we need to listen
// for new richtext-instrumented elements. this happens for example when using experimentation.
const observer = new MutationObserver(() => decorateRichtext());
observer.observe(document, { attributeFilter: ['data-richtext-prop'], subtree: true });
