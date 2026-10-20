import { buildSearchHaystack, tokenizeSearchQuery } from '../utils/format';

const root = document.querySelector<HTMLElement>('[data-tag-results]');
if (root) {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]')!;
  const reset = root.querySelector<HTMLButtonElement>('[data-tag-reset]')!;
  const summary = root.querySelector<HTMLElement>('[data-tag-summary]')!;
  const empty = root.querySelector<HTMLElement>('[data-tag-empty]')!;
  const scopes = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tag-scope]'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-tag-result]')).map((el) => ({
    el, haystack: buildSearchHaystack([el.dataset.search ?? ''])
  }));
  let scope = 'all';
  const update = () => {
    const terms = tokenizeSearchQuery(input.value);
    let count = 0;
    for (const { el, haystack } of items) {
      const matches = (scope === 'all' || el.dataset.kind === scope) && terms.every((term) => haystack.includes(term));
      el.hidden = !matches;
      if (matches) count++;
    }
    scopes.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.tagScope === scope)));
    summary.textContent = `${count} 条结果`;
    empty.hidden = count > 0;
    reset.hidden = input.value.length === 0;
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    if (scope !== 'all') url.searchParams.set('type', scope);
    else url.searchParams.delete('type');
    window.history.replaceState(null, '', url);
  };
  const restore = () => {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') ?? '';
    const type = params.get('type');
    scope = type === 'essay' || type === 'bits' ? type : 'all';
    update();
  };
  root.querySelectorAll<HTMLElement>('[data-tag-client]').forEach((el) => { el.hidden = false; });
  input.addEventListener('input', update);
  scopes.forEach((button) => button.addEventListener('click', () => {
    scope = button.dataset.tagScope ?? 'all';
    update();
  }));
  reset.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  root.querySelector('[data-tag-show-all]')?.addEventListener('click', () => {
    scope = 'all'; input.value = ''; update(); input.focus();
  });
  window.addEventListener('popstate', restore);
  restore();
}
