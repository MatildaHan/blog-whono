import { describe, expect, it } from 'vitest';
import {
  collectTagSummary,
  filterEntriesByTag,
  findTagSummary,
  getTagKeys,
  getTagPath,
  getTagSearchPath,
  isRoutableTagKey,
  normalizeTagLabel,
  toTagKey
} from '../src/lib/tags';
import { createWithBase } from '../src/utils/format';

describe('tags', () => {
  it('normalizes labels and keys', () => {
    expect(normalizeTagLabel('  Astro　Build  ')).toBe('Astro Build');
    expect(toTagKey('  Astro　Build  ')).toBe('astro-build');
  });

  it('deduplicates keys and skips non-routable values', () => {
    expect(getTagKeys(['Astro Build', ' astro  build ', '???', 'Tag/Name'])).toEqual([
      'astro-build',
      'tag-name'
    ]);
  });

  it('collects summaries with stable counts and preferred labels', () => {
    const entries = [
      { id: 'entry-a', data: { tags: ['Astro', '构建'] } },
      { id: 'entry-b', data: { tags: ['astro', '构建'] } },
      { id: 'entry-c', data: { tags: ['部署'] } }
    ];

    const summaries = collectTagSummary(entries);

    expect(summaries).toHaveLength(3);
    expect(summaries).toContainEqual({ key: 'astro', label: 'astro', count: 2 });
    expect(summaries).toContainEqual({ key: '构建', label: '构建', count: 2 });
    expect(summaries).toContainEqual({ key: '部署', label: '部署', count: 1 });
  });

  it('throws when a tag collapses into a non-routable segment', () => {
    expect(() =>
      collectTagSummary([{ id: 'broken-entry', data: { tags: ['???'] } }])
    ).toThrow(/Invalid archive tag key detected\./);
  });

  it('supports lookup, filtering and path generation', () => {
    const entries = [
      { id: 'entry-a', data: { tags: ['Astro Build'] } },
      { id: 'entry-b', data: { tags: ['Deploy'] } }
    ];
    const summaries = collectTagSummary(entries);

    expect(isRoutableTagKey('astro-build')).toBe(true);
    expect(isRoutableTagKey('..')).toBe(false);
    expect(findTagSummary(summaries, 'Astro Build')).toEqual({
      key: 'astro-build',
      label: 'Astro Build',
      count: 1
    });
    expect(filterEntriesByTag(entries, 'astro-build')).toEqual([entries[0]]);
    expect(getTagPath('archive', 'Astro Build')).toBe('/archive/tag/astro-build/');
    expect(getTagPath('archive', 'Astro Build', 3)).toBe('/archive/tag/astro-build/page/3/');
    expect(getTagPath('archive', '???')).toBe('/archive/');
  });

  it('links essay and bits labels to the same encoded search route, including base paths', () => {
    expect(getTagSearchPath('  Astro　Build ')).toBe(getTagSearchPath('astro build'));
    expect(getTagSearchPath('生活')).toBe('/tags/%E7%94%9F%E6%B4%BB/');
    expect(getTagSearchPath('loc:北京')).toBe('/tags/loc%3A%E5%8C%97%E4%BA%AC/');
    expect(createWithBase('/blog/')(getTagSearchPath('生活')!)).toBe('/blog/tags/%E7%94%9F%E6%B4%BB/');
    expect(getTagSearchPath('???')).toBeNull();
    expect(getTagSearchPath('..')).toBeNull();
  });

  it('combines shared labels and keeps exact tag matches across both content types', () => {
    const entries = [
      { id: 'essay', data: { tags: ['生活', '生活'] } },
      { id: 'bit', data: { tags: ['生活'] } },
      { id: 'another-bit', data: { tags: ['生活方式'] } }
    ];
    expect(collectTagSummary(entries).find((tag) => tag.key === '生活')?.count).toBe(2);
    expect(filterEntriesByTag(entries, '生活').map((entry) => entry.id)).toEqual(['essay', 'bit']);
  });
});
