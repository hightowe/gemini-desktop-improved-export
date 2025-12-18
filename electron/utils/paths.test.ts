/**
 * Unit tests for path utilities.
 * @module paths.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as path from 'path';

// Mock path module
vi.mock('path', async () => {
    const actual = await vi.importActual('path');
    return {
        ...actual,
        join: vi.fn((...args: string[]) => args.join('/'))
    };
});

describe('paths utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetModules();
    });

    describe('getPreloadPath', () => {
        it('should return path to preload.cjs in dist-electron', async () => {
            const { getPreloadPath } = await import('./paths');
            const result = getPreloadPath();

            expect(path.join).toHaveBeenCalledWith(expect.any(String), '../preload.cjs');
            expect(result).toContain('preload.cjs');
        });
    });

    describe('getDistHtmlPath', () => {
        it('should return path to specified HTML file in dist directory', async () => {
            const { getDistHtmlPath } = await import('./paths');
            const result = getDistHtmlPath('index.html');

            expect(path.join).toHaveBeenCalledWith(expect.any(String), '../../dist', 'index.html');
            expect(result).toContain('index.html');
        });

        it('should handle options.html', async () => {
            const { getDistHtmlPath } = await import('./paths');
            const result = getDistHtmlPath('options.html');

            expect(result).toContain('options.html');
        });

        it('should handle quickchat.html', async () => {
            const { getDistHtmlPath } = await import('./paths');
            const result = getDistHtmlPath('quickchat.html');

            expect(result).toContain('quickchat.html');
        });
    });

    describe('getIconPath', () => {
        it('should return path to app icon in build directory', async () => {
            const { getIconPath } = await import('./paths');
            const result = getIconPath();

            expect(path.join).toHaveBeenCalledWith(expect.any(String), '../../build/icon.png');
            expect(result).toContain('icon.png');
        });
    });
});
