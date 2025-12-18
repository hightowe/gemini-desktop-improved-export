/**
 * E2E Test: Window Controls Functionality
 * 
 * Tests that window control buttons (minimize, maximize, close) actually
 * change window state, not just that they exist.
 * 
 * ## Platform Behavior
 * - **Windows/Linux**: Tests custom HTML button clicks
 * - **macOS**: Tests keyboard shortcuts + API verification (native controls can't be clicked)
 * 
 * @module window-controls.spec
 */

import { browser, $, expect } from '@wdio/globals';
import { usesCustomControls, isMacOS } from './helpers/platform';
import { Selectors } from './helpers/selectors';
import { E2ELogger } from './helpers/logger';
import { sendKeyboardShortcut, KeyboardShortcuts } from './helpers/keyboardActions';
import {
    isWindowMaximized,
    isWindowMinimized,
    getWindowState,
    maximizeWindow,
    restoreWindow
} from './helpers/windowStateActions';

describe('Window Controls Functionality', () => {
    beforeEach(async () => {
        // Ensure we start from a consistent state
        const mainLayout = await $(Selectors.mainLayout);
        await mainLayout.waitForExist({ timeout: 15000 });
    });

    // =========================================================================
    // Windows/Linux: Custom Button Tests
    // =========================================================================

    describe('Custom Window Controls (Windows/Linux)', () => {
        it('should maximize window when maximize button is clicked', async () => {
            if (!(await usesCustomControls())) {
                E2ELogger.info('window-controls', 'Skipping - macOS uses native controls');
                return;
            }

            // 1. Verify not maximized initially (or restore if it is)
            const initialState = await isWindowMaximized();
            if (initialState) {
                await restoreWindow();
                await browser.pause(300);
            }

            // 2. Click maximize button
            const maximizeBtn = await $(Selectors.maximizeButton);
            await maximizeBtn.waitForClickable({ timeout: 5000 });
            await maximizeBtn.click();
            await browser.pause(500);

            // 3. Verify window is now maximized
            const isMaximized = await isWindowMaximized();
            expect(isMaximized).toBe(true);

            E2ELogger.info('window-controls', 'Maximize button click verified');
        });

        it('should restore window when maximize button is clicked again', async () => {
            if (!(await usesCustomControls())) {
                return;
            }

            // 1. Ensure window is maximized first
            const initialState = await isWindowMaximized();
            if (!initialState) {
                await maximizeWindow();
                await browser.pause(300);
            }

            // 2. Click maximize button again to restore
            const maximizeBtn = await $(Selectors.maximizeButton);
            await maximizeBtn.click();
            await browser.pause(500);

            // 3. Verify window is restored (not maximized)
            const isMaximized = await isWindowMaximized();
            expect(isMaximized).toBe(false);

            E2ELogger.info('window-controls', 'Restore via maximize button verified');
        });

        it('should minimize window when minimize button is clicked', async () => {
            if (!(await usesCustomControls())) {
                return;
            }

            // 1. Click minimize button
            const minimizeBtn = await $(Selectors.minimizeButton);
            await minimizeBtn.waitForClickable({ timeout: 5000 });
            await minimizeBtn.click();
            await browser.pause(500);

            // 2. Verify window is minimized
            const isMinimized = await isWindowMinimized();
            expect(isMinimized).toBe(true);

            // 3. Restore window for subsequent tests
            await restoreWindow();

            E2ELogger.info('window-controls', 'Minimize button click verified');
        });
    });

    // =========================================================================
    // macOS: Keyboard Shortcut Tests
    // =========================================================================

    describe('Native Window Controls via Keyboard (macOS)', () => {
        it('should verify window state API works on macOS', async () => {
            if (!(await isMacOS())) {
                E2ELogger.info('window-controls', 'Skipping macOS-specific test');
                return;
            }

            // Just verify we can read window state on macOS
            const state = await getWindowState();

            expect(typeof state.isMaximized).toBe('boolean');
            expect(typeof state.isMinimized).toBe('boolean');
            expect(typeof state.isFullScreen).toBe('boolean');

            E2ELogger.info('window-controls', `macOS window state: ${JSON.stringify(state)}`);
        });

        it('should minimize window via keyboard shortcut on macOS', async () => {
            if (!(await isMacOS())) {
                return;
            }

            // Cmd+M minimizes on macOS
            await sendKeyboardShortcut(KeyboardShortcuts.MINIMIZE);
            await browser.pause(500);

            const isMinimized = await isWindowMinimized();
            expect(isMinimized).toBe(true);

            // Restore for subsequent tests
            await restoreWindow();

            E2ELogger.info('window-controls', 'macOS Cmd+M minimize verified');
        });
    });

    // =========================================================================
    // Cross-Platform: API-Based Tests
    // =========================================================================

    describe('Window State via API (All Platforms)', () => {
        it('should correctly report window state', async () => {
            const state = await getWindowState();

            // State should be an object with expected properties
            expect(state).toHaveProperty('isMaximized');
            expect(state).toHaveProperty('isMinimized');
            expect(state).toHaveProperty('isFullScreen');

            E2ELogger.info('window-controls', `Cross-platform state check: ${JSON.stringify(state)}`);
        });

        it('should maximize and restore via API calls', async () => {
            // 1. Record initial state
            const initialState = await isWindowMaximized();

            // 2. Maximize via API
            await maximizeWindow();
            const afterMaximize = await isWindowMaximized();
            expect(afterMaximize).toBe(true);

            // 3. Restore via API
            await restoreWindow();
            const afterRestore = await isWindowMaximized();
            expect(afterRestore).toBe(false);

            E2ELogger.info('window-controls', 'API-based maximize/restore verified');
        });
    });
});
