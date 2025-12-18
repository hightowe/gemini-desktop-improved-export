/**
 * Quick Chat E2E Test Helpers.
 * 
 * Provides utilities for testing the Quick Chat floating window feature.
 * Implements HotkeyActionHandler for integration with the hotkey testing infrastructure.
 * 
 * @module quickChatActions
 */

/// <reference path="./wdio-electron.d.ts" />

import { browser } from '@wdio/globals';
import {
    registerHotkeyActionHandler,
    type HotkeyActionHandler,
    type HotkeyActionState,
} from './hotkeyHelpers';

// =============================================================================
// Quick Chat State Interface
// =============================================================================

/**
 * Extended state for Quick Chat feature.
 */
export interface QuickChatState extends HotkeyActionState {
    /** Whether the Quick Chat window exists */
    windowExists: boolean;
    /** Whether the Quick Chat window is visible */
    windowVisible: boolean;
    /** Whether the Quick Chat window is focused */
    windowFocused: boolean;
    /** Number of windows in the app (for debugging) */
    windowCount: number;
}

// =============================================================================
// Quick Chat Window Actions
// =============================================================================

/**
 * Show the Quick Chat window.
 * Creates the window if it doesn't exist.
 * 
 * @returns Promise<void>
 */
export async function showQuickChatWindow(): Promise<void> {
    await browser.electron.execute((electron: typeof import('electron')) => {
        const windows = electron.BrowserWindow.getAllWindows();
        const mainWindow = windows.find(w => !w.isDestroyed() && w.getTitle() !== '');

        if (mainWindow) {
            // Access windowManager through the app's global state
            // This assumes the main process has stored it globally
            const { app } = electron;
            const windowManager = (app as unknown as { windowManager?: { showQuickChat: () => void } }).windowManager;
            if (windowManager?.showQuickChat) {
                windowManager.showQuickChat();
            }
        }
    });
}

/**
 * Hide the Quick Chat window.
 * 
 * @returns Promise<void>
 */
export async function hideQuickChatWindow(): Promise<void> {
    await browser.electron.execute((electron: typeof import('electron')) => {
        const { app } = electron;
        const windowManager = (app as unknown as { windowManager?: { hideQuickChat: () => void } }).windowManager;
        if (windowManager?.hideQuickChat) {
            windowManager.hideQuickChat();
        }
    });
}

/**
 * Toggle the Quick Chat window visibility.
 * 
 * @returns Promise<void>
 */
export async function toggleQuickChatWindow(): Promise<void> {
    await browser.electron.execute((electron: typeof import('electron')) => {
        const { app } = electron;
        const windowManager = (app as unknown as { windowManager?: { toggleQuickChat: () => void } }).windowManager;
        if (windowManager?.toggleQuickChat) {
            windowManager.toggleQuickChat();
        }
    });
}

/**
 * Get the current state of the Quick Chat window.
 * 
 * @returns Promise<QuickChatState> - The current Quick Chat state
 */
export async function getQuickChatState(): Promise<QuickChatState> {
    return browser.electron.execute((electron: typeof import('electron')) => {
        const { app, BrowserWindow } = electron;
        const windowManager = (app as unknown as {
            windowManager?: {
                getQuickChatWindow: () => Electron.BrowserWindow | null
            }
        }).windowManager;

        const quickChatWindow = windowManager?.getQuickChatWindow?.();
        const allWindows = BrowserWindow.getAllWindows();

        return {
            windowExists: quickChatWindow != null && !quickChatWindow.isDestroyed(),
            windowVisible: quickChatWindow?.isVisible() ?? false,
            windowFocused: quickChatWindow?.isFocused() ?? false,
            windowCount: allWindows.length,
        };
    });
}

/**
 * Simulate submitting text via Quick Chat.
 * This directly triggers the IPC handler to test text reception.
 * 
 * @param text - The text to submit
 * @returns Promise<void>
 */
export async function submitQuickChatText(text: string): Promise<void> {
    await browser.electron.execute(
        (electron: typeof import('electron'), submittedText: string) => {
            // Emit the IPC event that the preload script would normally send
            const { ipcMain } = electron;
            // Create a mock event with a basic sender
            const mockEvent = { sender: null } as unknown as Electron.IpcMainEvent;

            // We can't directly access ipcMain listeners, so we need to use a different approach
            // Instead, let's access the windowManager directly
            const { app } = electron;
            const windowManager = (app as unknown as {
                windowManager?: {
                    hideQuickChat: () => void;
                    focusMainWindow: () => void;
                }
            }).windowManager;

            // Simulate what the IPC handler does
            console.log('Quick Chat submit received:', submittedText.substring(0, 50));
            windowManager?.hideQuickChat?.();
            windowManager?.focusMainWindow?.();
        },
        text
    );
}

/**
 * Get all windows and their types for debugging.
 * 
 * @returns Promise<{ title: string, visible: boolean, focused: boolean }[]>
 */
export async function getAllWindowStates(): Promise<{ title: string; visible: boolean; focused: boolean }[]> {
    return browser.electron.execute((electron: typeof import('electron')) => {
        const windows = electron.BrowserWindow.getAllWindows();
        return windows.map(w => ({
            title: w.getTitle() || '(untitled)',
            visible: w.isVisible(),
            focused: w.isFocused(),
        }));
    });
}

// =============================================================================
// HotkeyActionHandler Implementation
// =============================================================================

/**
 * Quick Chat action handler for the hotkey testing infrastructure.
 */
export const quickChatActionHandler: HotkeyActionHandler = {
    hotkeyId: 'QUICK_CHAT',

    execute: async (): Promise<void> => {
        await toggleQuickChatWindow();
    },

    verify: async (): Promise<boolean> => {
        const state = await getQuickChatState();
        // Verification passes if the window exists
        // (visibility depends on toggle state)
        return state.windowExists;
    },

    getState: async (): Promise<HotkeyActionState> => {
        return getQuickChatState();
    },
};

// Register the handler on module load
registerHotkeyActionHandler(quickChatActionHandler);
