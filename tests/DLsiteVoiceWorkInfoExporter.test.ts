import { describe, it, expect } from 'vitest';
import { determineGenre, parseReleaseDate, sanitizeFileName } from '../src/DLsiteVoiceWorkInfoExporter';

describe('determineGenre', () => {
    it('returns HVoiceDrama for R-18', () => {
        expect(determineGenre('R-18')).toBe('HVoiceDrama');
    });
    it('returns HVoiceDrama for R18', () => {
        expect(determineGenre('R18')).toBe('HVoiceDrama');
    });
    it('returns HVoiceDrama for 18禁', () => {
        expect(determineGenre('18禁')).toBe('HVoiceDrama');
    });
    it('returns VoiceDrama for 全年齢', () => {
        expect(determineGenre('全年齢')).toBe('VoiceDrama');
    });
    it('returns VoiceDrama for R-15', () => {
        expect(determineGenre('R-15')).toBe('VoiceDrama');
    });
    it('returns VoiceDrama for others', () => {
        expect(determineGenre('')).toBe('VoiceDrama');
        expect(determineGenre('  ')).toBe('VoiceDrama');
    });
});

describe('parseReleaseDate', () => {
    it('parses date from URL', () => {
        const url = 'https://www.dlsite.com/maniax/work/=/product_id/RJ01234567.html/?locale=ja_JP/year/2023/mon/05/day/01';
        expect(parseReleaseDate(null, url)).toEqual({ year: '2023', month: '05', day: '01' });
    });

    it('parses date from text', () => {
        const text = '2023年5月1日 0時';
        expect(parseReleaseDate(text, null)).toEqual({ year: '2023', month: '5', day: '1' });
    });

    it('parses date from text with leading zeros', () => {
        const text = '2023年05月01日 0時';
        expect(parseReleaseDate(text, null)).toEqual({ year: '2023', month: '05', day: '01' });
    });

    it('prioritizes URL over text', () => {
        const url = '/year/2025/mon/12/day/27';
        const text = '2020年01月01日';
        expect(parseReleaseDate(text, url)).toEqual({ year: '2025', month: '12', day: '27' });
    });

    it('falls back to text if URL does not contain date', () => {
        const url = 'https://www.dlsite.com/home/work/=/product_id/RJ01524462.html';
        const text = '2025年12月27日 0時';
        expect(parseReleaseDate(text, url)).toEqual({ year: '2025', month: '12', day: '27' });
    });

    it('returns empty strings if neither available', () => {
        expect(parseReleaseDate(null, null)).toEqual({ year: '', month: '', day: '' });
    });
});

describe('sanitizeFileName', () => {
    it('replaces forbidden characters', () => {
        expect(sanitizeFileName('foo:bar')).toBe('foo：bar');
        expect(sanitizeFileName('foo*bar')).toBe('foo＊bar');
        expect(sanitizeFileName('foo?bar')).toBe('foo？bar');
        expect(sanitizeFileName('foo"bar')).toBe('foo”bar');
        expect(sanitizeFileName('foo<bar')).toBe('foo＜bar');
        expect(sanitizeFileName('foo>bar')).toBe('foo＞bar');
        expect(sanitizeFileName('foo|bar')).toBe('foo｜bar');
        expect(sanitizeFileName('foo/bar')).toBe('foo／bar');
        expect(sanitizeFileName('foo\\bar')).toBe('foo￥bar');
        expect(sanitizeFileName('foo!bar')).toBe('foo！bar');
    });

    it('leaves safe characters alone', () => {
        expect(sanitizeFileName('Safe Name 123')).toBe('Safe Name 123');
    });
});
