/**
 * Unit tests for HotkeyManager.
 * @module HotkeyManager.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type WindowManager from './windowManager';

// Hoist mock variables to avoid hoisting issues
const mockGlobalShortcut = vi.hoisted(() => ({
    register: vi.fn(),
    unregisterAll: vi.fn()
}));

vi.mock('electron', () => ({
    globalShortcut: mockGlobalShortcut
}));

// Mock logger
vi.mock('../utils/logger', () => ({
    createLogger: () => ({
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn()
    })
}));

// Import after mocks are set up
import HotkeyManager from './hotkeyManager';

describe('HotkeyManager', () => {
    let hotkeyManager: HotkeyManager;
    let mockWindowManager: WindowManager;

    beforeEach(() => {
        vi.clearAllMocks();

        mockWindowManager = {
            minimizeMainWindow: vi.fn(),
            toggleQuickChat: vi.fn()
        } as unknown as WindowManager;

        hotkeyManager = new HotkeyManager(mockWindowManager);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create a HotkeyManager instance with the windowManager', () => {
            expect(hotkeyManager).toBeDefined();
        });

        it('should initialize shortcuts array with minimize and quick chat shortcuts', () => {
            // Access private shortcuts via any to verify initialization
            const shortcuts = (hotkeyManager as unknown as { shortcuts: { accelerator: string }[] }).shortcuts;
            expect(shortcuts).toHaveLength(2);
            expect(shortcuts[0].accelerator).toBe('CommandOrControl+Alt+E');
            expect(shortcuts[1].accelerator).toBe('CommandOrControl+Shift+Space');
        });
    });

    describe('registerShortcuts', () => {
        it('should register all shortcuts successfully', () => {
            mockGlobalShortcut.register.mockReturnValue(true);

            hotkeyManager.registerShortcuts();

            expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(2);
            expect(mockGlobalShortcut.register).toHaveBeenCalledWith(
                'CommandOrControl+Alt+E',
                expect.any(Function)
            );
            expect(mockGlobalShortcut.register).toHaveBeenCalledWith(
                'CommandOrControl+Shift+Space',
                expect.any(Function)
            );
        });

        it('should handle registration failure gracefully', () => {
            mockGlobalShortcut.register.mockReturnValue(false);

            // Should not throw
            expect(() => hotkeyManager.registerShortcuts()).not.toThrow();
            expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(2);
        });

        it('should call minimizeMainWindow when minimize hotkey is triggered', () => {
            mockGlobalShortcut.register.mockImplementation((accelerator: string, callback: () => void) => {
                if (accelerator === 'CommandOrControl+Alt+E') {
                    callback();
                }
                return true;
            });

            hotkeyManager.registerShortcuts();

            expect(mockWindowManager.minimizeMainWindow).toHaveBeenCalledTimes(1);
        });

        it('should call toggleQuickChat when quick chat hotkey is triggered', () => {
            mockGlobalShortcut.register.mockImplementation((accelerator: string, callback: () => void) => {
                if (accelerator === 'CommandOrControl+Shift+Space') {
                    callback();
                }
                return true;
            });

            hotkeyManager.registerShortcuts();

            expect(mockWindowManager.toggleQuickChat).toHaveBeenCalledTimes(1);
        });
    });

    describe('unregisterAll', () => {
        it('should unregister all shortcuts', () => {
            hotkeyManager.unregisterAll();

            expect(mockGlobalShortcut.unregisterAll).toHaveBeenCalledTimes(1);
        });
    });
});
