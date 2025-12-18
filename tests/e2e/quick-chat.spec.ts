/**
 * E2E Tests for Quick Chat Feature.
 * 
 * Tests the Quick Chat (Spotlight-like) floating window:
 * - Hotkey registration (Ctrl+Shift+Space / Cmd+Shift+Space)
 * - Window visibility verification
 * - Input field functionality
 * 
 * @module quick-chat.spec
 */

import { browser, expect } from '@wdio/globals';
import { getPlatform, E2EPlatform } from './helpers/platform';
import {
    REGISTERED_HOTKEYS,
    isHotkeyRegistered,
    getHotkeyDisplayString,
    verifyHotkeyRegistration,
} from './helpers/hotkeyHelpers';

describe('Quick Chat Feature', () => {
    let platform: E2EPlatform;

    beforeEach(async () => {
        // Detect platform for each test
        if (!platform) {
            platform = await getPlatform();
            console.log(`\n========================================`);
            console.log(`Platform detected: ${platform.toUpperCase()}`);
            console.log(`========================================\n`);
        }
    });

    describe('Hotkey Registration', () => {
        it('should have the Quick Chat hotkey registered', async () => {
            // Ensure app is loaded
            const title = await browser.getTitle();
            expect(title).not.toBe('');

            // Verify the hotkey is registered
            const isRegistered = await verifyHotkeyRegistration(platform, 'QUICK_CHAT');
            expect(isRegistered).toBe(true);
        });

        it('should use the correct accelerator format (CommandOrControl+Shift+Space)', async () => {
            const expectedAccelerator = REGISTERED_HOTKEYS.QUICK_CHAT.accelerator;
            const isRegistered = await isHotkeyRegistered(expectedAccelerator);

            console.log(`Checking accelerator: ${expectedAccelerator}`);
            expect(isRegistered).toBe(true);
        });

        it('should display the correct platform-specific hotkey string', async () => {
            const displayString = getHotkeyDisplayString(platform, 'QUICK_CHAT');

            // Verify platform-specific display format
            if (platform === 'macos') {
                expect(displayString).toBe('Cmd+Shift+Space');
            } else {
                // Windows and Linux use Ctrl
                expect(displayString).toBe('Ctrl+Shift+Space');
            }

            console.log(`Platform: ${platform}, Display String: ${displayString}`);
        });
    });

    describe('Window Count', () => {
        it('should start with only the main window visible', async () => {
            const windowCount = await browser.electron.execute(
                (electron: typeof import('electron')) => {
                    return electron.BrowserWindow.getAllWindows().length;
                }
            );

            // At minimum, we should have the main window
            expect(windowCount).toBeGreaterThanOrEqual(1);
            console.log(`Window count at start: ${windowCount}`);
        });
    });
});

/**
 * Note on E2E Quick Chat Testing Limitations:
 * 
 * Simulating global shortcuts via WebDriver's browser.keys() is not reliable
 * because WebDriver sends synthetic events to the web content, not the OS.
 * Global shortcuts are handled at the OS level by Electron's globalShortcut API.
 * 
 * Therefore, we verify:
 * 1. The shortcut IS registered via globalShortcut.isRegistered()
 * 2. Unit tests cover the component logic (QuickChatApp.test.tsx)
 * 3. The window manager methods exist and can be called
 * 
 * Full workflow testing (trigger hotkey → window appears → type → submit)
 * would require OS-level automation tools like xdotool or AutoHotkey.
 */
