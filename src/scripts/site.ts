export {};
type CatalogEntry = { id: string; type: string; title: string; description: string; body: string; url: string; categories: string[]; tags: string[] };
type SiteData = { lang: string; base: string; demo: boolean; usePagefind: boolean; ui: Record<string, string>; catalog: CatalogEntry[] };
const dataElement = document.querySelector('#site-data');
const data: SiteData = JSON.parse(dataElement?.textContent || '{}');
const t = data.ui;
const savedKey = 'euc-rover:read-later:v1';
const languageKey = 'euc-rover:language:v1';
const toast = document.querySelector<HTMLElement>('[data-toast]');
let toastTimer: ReturnType<typeof setTimeout>;
function announce(message: string) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message; toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 7000);
}
function readSaved(): Set<string> {
  const value = JSON.parse(localStorage.getItem(savedKey) || '[]');
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new Error('Invalid reading list');
  return new Set(value);
}
let saved = new Set<string>();
try { saved = readSaved(); } catch { announce(t.storageError); }

const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('#primary-nav');
function setMenu(open: boolean) {
  menu?.classList.toggle('is-open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  const label = menuButton?.querySelector('[data-menu-label]');
  if (label) label.textContent = open ? t.closeMenu : t.menu;
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
});
document.querySelectorAll<HTMLAnchorElement>('[data-language]').forEach(link => {
  link.addEventListener('click', () => { try { localStorage.setItem(languageKey, link.dataset.language || data.lang); } catch { /* Direct language links remain usable. */ } });
});

function paintSaved() {
  document.querySelectorAll<HTMLButtonElement>('[data-save-id]').forEach(button => {
    const active = saved.has(button.dataset.saveId || '');
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? t.unsave : t.save);
    button.title = active ? t.unsave : t.save;
    const label = button.querySelector('[data-save-label]');
    if (label) label.textContent = active ? t.isSaved : t.save;
  });
  const current = data.catalog.filter(entry => saved.has(entry.id)).length;
  document.querySelectorAll<HTMLElement>('[data-saved-count]').forEach(count => { count.textContent = String(current); count.hidden = current === 0; });
}
document.querySelectorAll<HTMLButtonElement>('[data-save-id]').forEach(button => {
  button.addEventListener('click', () => {
    try {
      // Read current storage to avoid losing another tab's changes.
      const next = readSaved();
      const id = button.dataset.saveId!;
      const remove = next.has(id);
      if (remove) next.delete(id); else next.add(id);
      localStorage.setItem(savedKey, JSON.stringify([...next]));
      saved = next; paintSaved();
      if (collection?.dataset.collection === 'saved') renderCollection();
      announce(remove ? t.removed : t.added);
      if (remove && collection?.dataset.collection === 'saved') {
        const nextControl = collection.querySelector<HTMLButtonElement>('[data-entry-id]:not([hidden]) [data-save-id]');
        if (nextControl) nextControl.focus(); else { const heading = empty?.querySelector('h2'); heading?.setAttribute('tabindex', '-1'); heading?.focus(); }
      }
    } catch { announce(t.storageError); }
  });
});
window.addEventListener('storage', event => {
  if (event.key === savedKey || event.key === null) {
    try { saved = readSaved(); paintSaved(); if (collection?.dataset.collection === 'saved') renderCollection(); } catch { announce(t.storageError); }
  }
});
paintSaved();

const publicUrl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
document.querySelector<HTMLButtonElement>('[data-copy-link]')?.addEventListener('click', async () => {
  try { if (!publicUrl) throw new Error('No public URL'); await navigator.clipboard.writeText(publicUrl); announce(t.copied); } catch { announce(t.copyError); }
});
const share = document.querySelector<HTMLButtonElement>('[data-share]');
if (share && typeof navigator.share === 'function' && !data.demo) {
  share.hidden = false;
  share.addEventListener('click', async () => {
    try { if (!publicUrl) throw new Error('No public URL'); await navigator.share({ title: document.title, url: publicUrl }); }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) announce(t.copyError); }
  });
}

const collection = document.querySelector<HTMLElement>('[data-collection]');
const grid = collection?.querySelector<HTMLElement>('[data-results-grid]');
const cards = [...collection?.querySelectorAll<HTMLElement>('[data-entry-id]') || []];
const empty = collection?.querySelector<HTMLElement>('[data-empty-state]');
const status = collection?.querySelector<HTMLElement>('[data-results-status]');
const pagination = collection?.querySelector<HTMLElement>('[data-pagination]');
const filterSelects = [...collection?.querySelectorAll<HTMLSelectElement>('[data-filter]') || []];
const queryInput = collection?.querySelector<HTMLInputElement>('#search-query');
const clearButton = collection?.querySelector<HTMLButtonElement>('[data-clear-filters]');
const params = new URLSearchParams(location.search);
let page = Math.max(1, Number(params.get('page')) || 1);
let matchedIds: Set<string> | null = null;
let requestNumber = 0;
const normalized = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase(data.lang);
filterSelects.forEach(select => {
  const key = select.dataset.filter!;
  const value = params.get(key) || '';
  if ([...select.options].some(option => option.value === value)) select.value = value;
});
if (queryInput) queryInput.value = params.get('q') || '';
const filtersPanel = collection?.querySelector<HTMLDetailsElement>('.filter-panel');
if (filtersPanel && matchMedia('(max-width: 48rem)').matches) filtersPanel.open = false;
// A closed mobile disclosure must reopen when its summary disappears on desktop.
matchMedia('(min-width: 48.001rem)').addEventListener('change', event => { if (event.matches && filtersPanel) filtersPanel.open = true; });

function updateAddress() {
  const next = new URLSearchParams();
  if (queryInput?.value.trim()) next.set('q', queryInput.value.trim());
  filterSelects.forEach(select => { if (select.value) next.set(select.dataset.filter!, select.value); });
  if (page > 1) next.set('page', String(page));
  const suffix = next.toString();
  history.replaceState(history.state, '', `${location.pathname}${suffix ? `?${suffix}` : ''}`);
}

function renderCollection() {
  if (!collection || !grid) return;
  const selected = Object.fromEntries(filterSelects.map(select => [select.dataset.filter!, select.value]));
  const mode = collection.dataset.collection;
  const idsOnPage = new Set(cards.map(card => card.dataset.entryId!));
  const filtered = data.catalog.filter(entry => idsOnPage.has(entry.id)
    && (mode !== 'saved' || saved.has(entry.id))
    && (!selected.type || entry.type === selected.type)
    && (!selected.category || entry.categories.includes(selected.category))
    && (!selected.tag || entry.tags.includes(selected.tag))
    && (matchedIds === null || matchedIds.has(entry.id)));
  const pageSize = Number(collection.dataset.pageSize) || 12;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  page = Math.min(Math.max(1, Math.floor(page)), pages);
  const visible = new Set(filtered.slice((page - 1) * pageSize, page * pageSize).map(entry => entry.id));
  cards.forEach(card => { card.hidden = !visible.has(card.dataset.entryId!); });
  grid.hidden = filtered.length === 0;
  if (empty) empty.hidden = filtered.length > 0;
  if (status) status.textContent = `${t.results}: ${filtered.length}`;
  const active = filterSelects.filter(select => select.value).map(select => select.options[select.selectedIndex].textContent || '');
  const activeText = collection.querySelector('[data-active-filters]');
  if (activeText) activeText.textContent = active.join(' · ');
  if (clearButton) clearButton.hidden = !active.length && !queryInput?.value.trim();
  if (pagination) {
    pagination.replaceChildren(); pagination.hidden = pages <= 1;
    const addButton = (label: string, target: number, current = false) => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      if (current) { button.setAttribute('aria-current', 'page'); button.setAttribute('aria-label', `${t.page} ${target}`); }
      button.addEventListener('click', () => { page = target; renderCollection(); collection.scrollIntoView({ block: 'start' }); pagination.querySelector<HTMLButtonElement>('[aria-current]')?.focus({ preventScroll: true }); });
      pagination.append(button);
    };
    if (page > 1) addButton(t.previous, page - 1);
    // Bounded pagination remains usable when an archive eventually contains many pages.
    const numbers = [...new Set([1, pages, page - 1, page, page + 1].filter(value => value >= 1 && value <= pages))].sort((a, b) => a - b);
    numbers.forEach((number, index) => { if (index > 0 && number - numbers[index - 1] > 1) { const dots = document.createElement('span'); dots.textContent = '…'; dots.setAttribute('aria-hidden', 'true'); pagination.append(dots); } addButton(String(number), number, number === page); });
    if (page < pages) addButton(t.next, page + 1);
  }
  if (mode !== 'saved') updateAddress();
}

async function search() {
  const request = ++requestNumber;
  const query = queryInput?.value.trim() || '';
  if (!query) { matchedIds = null; renderCollection(); return; }
  if (!data.catalog.length) { matchedIds = new Set(); renderCollection(); return; }
  if (status) status.textContent = t.searching;
  try {
    let ids: string[];
    if (!data.usePagefind) {
      const words = normalized(query).split(/\s+/);
      ids = data.catalog.filter(entry => words.every(word => normalized(`${entry.title} ${entry.description} ${entry.body} ${entry.tags.join(' ')}`).includes(word))).map(entry => entry.id);
    } else {
      const moduleUrl = `${data.base}pagefind/pagefind.js`;
      const pagefind = await import(/* @vite-ignore */ moduleUrl);
      await pagefind.options({ baseUrl: data.base });
      const results = await pagefind.search(query);
      const records = await Promise.all(results.results.map((result: { data: () => Promise<{ meta: { id?: string }; url: string }> }) => result.data()));
      ids = records.map((record: { meta: { id?: string }; url: string }) => record.meta.id || data.catalog.find(entry => entry.url === record.url)?.id).filter((id: string | undefined): id is string => typeof id === 'string');
    }
    if (request !== requestNumber) return;
    matchedIds = new Set(ids); renderCollection();
  } catch {
    if (request !== requestNumber) return;
    matchedIds = new Set(); renderCollection();
    if (status) status.textContent = t.searchError;
  }
}
collection?.querySelector<HTMLFormElement>('[data-search-form]')?.addEventListener('submit', event => { event.preventDefault(); page = 1; void search(); });
queryInput?.addEventListener('input', () => { if (!queryInput.value) { page = 1; void search(); } });
filterSelects.forEach(select => select.addEventListener('change', () => { page = 1; renderCollection(); }));
clearButton?.addEventListener('click', () => { filterSelects.forEach(select => { select.value = ''; }); if (queryInput) queryInput.value = ''; page = 1; matchedIds = null; requestNumber++; renderCollection(); });
if (collection) {
  if (queryInput?.value.trim()) void search(); else renderCollection();
  const scrollKey = () => `euc-rover:scroll:${location.pathname}${location.search}`;
  window.addEventListener('pagehide', () => { try { sessionStorage.setItem(scrollKey(), String(window.scrollY)); } catch { /* Native browser history remains available. */ } });
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigation?.type === 'back_forward') { try { const y = Number(sessionStorage.getItem(scrollKey()) || 0); requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y))); } catch { /* Native browser history remains available. */ } }
}
