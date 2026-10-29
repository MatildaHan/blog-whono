import { describe, expect, it } from 'vitest';
import {
  buildBitsCardViewModel,
  deriveBitsCardText
} from '../src/lib/bits-card-view-model';

describe('bits card view model', () => {
  it('renders full Markdown regardless of length or an excerpt marker', () => {
    expect(deriveBitsCardText('短内容 **Markdown**').shouldRenderFull).toBe(true);
    const body = `${'长'.repeat(5000)}\n\n<!-- more -->\n\n最后一段。`;
    expect(deriveBitsCardText(body)).toMatchObject({
      shouldRenderFull: true,
      plainText: `${'长'.repeat(5000)} 最后一段。`,
      excerpt: `${'长'.repeat(5000)} 最后一段。`
    });
  });

  it('derives author, tags, date and media for preview cards', () => {
    const viewModel = buildBitsCardViewModel({
      id: 'demo-bit',
      slug: 'demo',
      bodyText: 'Hello',
      tags: ['loc:Shanghai', 'daily'],
      date: new Date('2026-05-27T08:30:00+08:00'),
      images: [
        { src: 'bits/a.webp', width: '800', height: 600, alt: 'A' },
        { src: 'https://example.com/b.webp', width: 'bad', height: '0' },
        { src: 'http://example.com/c.webp', width: 800, height: 600 }
      ],
      author: { name: 'Alice', avatar: 'author/alice.webp' },
      defaultAuthor: { name: '测试站点', avatar: 'author/default.webp' },
      base: '/blog/'
    });

    expect(viewModel.slug).toBe('demo');
    expect(viewModel.authorName).toBe('Alice');
    expect(viewModel.authorAvatar).toBe('/blog/author/alice.webp');
    expect(viewModel.placeText).toBe('Shanghai');
    expect(viewModel.normalTagItems).toEqual(['#daily']);
    expect(viewModel.dateLabel).toBe('2026-05-27 08:30:00');
    expect(viewModel.imageItems).toEqual([
      { src: '/blog/bits/a.webp', width: 800, height: 600, alt: 'A' },
      { src: 'https://example.com/b.webp', alt: '' }
    ]);
  });

  it('previews handwritten dates in Beijing time without requiring an offset', () => {
    const viewModel = buildBitsCardViewModel({
      id: 'handwritten',
      bodyText: 'Hello',
      date: '2026-10-20 17:56:38'
    });
    expect(viewModel.dateLabel).toBe('2026-10-20 17:56:38');
  });

  it('uses the default author avatar when the editor author avatar is empty', () => {
    const viewModel = buildBitsCardViewModel({
      id: 'demo-bit',
      bodyText: 'Hello',
      author: { name: '', avatar: '' },
      defaultAuthor: { name: '测试站点', avatar: 'author/default.webp' },
      base: '/blog/'
    });

    expect(viewModel.authorName).toBe('测试站点');
    expect(viewModel.authorAvatar).toBe('/blog/author/default.webp');
  });
});
