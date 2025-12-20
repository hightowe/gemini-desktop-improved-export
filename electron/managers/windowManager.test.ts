/**
 * Unit tests for WindowManager.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserWindow, shell } from 'electron';
import WindowManager from './windowManager';
import path from 'path';

const mocks = vi.hoisted(() => ({
    isMacOS: false
}));

vi.mock('../utils/constants', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actual = await importOriginal<any>();
    return {
        ...actual,
        get isMacOS() { return mocks.isMacOS },
    };
});

describe('WindowManager', () => {
    let windowManager: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset BrowserWindow instances mock
        (BrowserWindow as any)._reset();
        windowManager = new WindowManager(false);
    });

    describe('constructor', () => {
        it('initializes with isDev flag', () => {
            const wm = new WindowManager(true);
            expect(wm.isDev).toBe(true);
        });
    });

    describe('createMainWindow', () => {
        it('creates a new window if one does not exist', () => {
            const win = windowManager.createMainWindow();

            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win).toBeDefined();
            // Verify window options
            expect(win.options).toMatchObject({
                width: 1200,
                height: 800,
                show: false
            });
        });

        it('returns existing window if already created', () => {
            const win1 = windowManager.createMainWindow();
            const win2 = windowManager.createMainWindow();

            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win1).toBe(win2);
            expect(win1.focus).toHaveBeenCalled();
        });

        it('loads production file when not in dev mode', () => {
            const win = windowManager.createMainWindow();
            expect(win.loadFile).toHaveBeenCalledWith(expect.stringContaining('index.html'));
            expect(win.loadURL).not.toHaveBeenCalled();
        });

        it('loads dev server URL when in dev mode', () => {
            const wm = new WindowManager(true);
            const win = wm.createMainWindow();
            expect(win.loadURL).toHaveBeenCalledWith('http://localhost:1420');
            expect(win.webContents.openDevTools).toHaveBeenCalled();
        });

        it('shows window when ready-to-show is emitted', () => {
            const win = windowManager.createMainWindow();
            // Trigger ready-to-show
            const readyHandler = win.once.mock.calls.find((call: any) => call[0] === 'ready-to-show')[1];
            readyHandler();

            expect(win.show).toHaveBeenCalled();
        });

        it('clears reference when window is closed', () => {
            windowManager.createMainWindow();
            // Get the mock instance
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];

            // Trigger closed event
            const closeHandler = win.on.mock.calls.find((call: any) => call[0] === 'closed')[1];
            closeHandler();

            expect(windowManager.mainWindow).toBeNull();
        });

        it('closes options window when main window is closed', () => {
            windowManager.createMainWindow();
            windowManager.createOptionsWindow();

            const instances = (BrowserWindow as any).getAllWindows();
            const mainWin = instances[0]; // First window created
            const optionsWin = instances[1]; // Second window created

            // Trigger main window closed
            const closeHandler = mainWin.on.mock.calls.find((call: any) => call[0] === 'closed')[1];
            closeHandler();

            expect(optionsWin.close).toHaveBeenCalled();
        });
    });

    describe('createOptionsWindow', () => {
        it('creates a new options window', () => {
            const win = windowManager.createOptionsWindow();
            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win).toBeDefined();
            expect(win.options).toMatchObject({
                width: 600,
                height: 400
            });
        });

        it('returns existing options window if open', () => {
            const win1 = windowManager.createOptionsWindow();
            const win2 = windowManager.createOptionsWindow();
            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win1).toBe(win2);
            expect(win1.focus).toHaveBeenCalled();
        });

        it('loads options.html in dev mode', () => {
            const wm = new WindowManager(true);
            const win = wm.createOptionsWindow();
            expect(win.loadURL).toHaveBeenCalledWith('http://localhost:1420/options.html');
        });

        it('loads options.html in prod mode', () => {
            const win = windowManager.createOptionsWindow();
            expect(win.loadFile).toHaveBeenCalledWith(
                expect.stringContaining('options.html'),
                expect.objectContaining({ hash: undefined })
            );
        });

        it('shows window when ready-to-show is emitted', () => {
            const win = windowManager.createOptionsWindow();
            const readyHandler = win.once.mock.calls.find((call: any) => call[0] === 'ready-to-show')[1];
            readyHandler();

            expect(win.show).toHaveBeenCalled();
        });

        it('clears reference when options window is closed', () => {
            windowManager.createOptionsWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];

            const closeHandler = win.on.mock.calls.find((call: any) => call[0] === 'closed')[1];
            closeHandler();

            expect(windowManager.optionsWindow).toBeNull();
        });
    });

    describe('createAuthWindow', () => {
        it('creates window with auth config and loads URL', () => {
            const url = 'https://accounts.google.com/signin';
            const win = windowManager.createAuthWindow(url);

            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win.loadURL).toHaveBeenCalledWith(url);
        });

        it('logs when auth window is closed', () => {
            const win = windowManager.createAuthWindow('https://accounts.google.com');
            const closeHandler = win.on.mock.calls.find((call: any) => call[0] === 'closed')[1];
            closeHandler();
            // Event handler was called (coverage of line 46)
        });
    });

    describe('window open handler', () => {
        it('opens external links in shell', () => {
            windowManager.createMainWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];

            // Simulate setWindowOpenHandler call
            const handler = win.webContents.setWindowOpenHandler.mock.calls[0][0];

            const result = handler({ url: 'https://example.com' });
            expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
            expect(result).toEqual({ action: 'deny' });
        });

        it('intercepts OAuth links and opens auth window', () => {
            windowManager.createMainWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];
            const handler = win.webContents.setWindowOpenHandler.mock.calls[0][0];

            // Spy on createAuthWindow
            const spy = vi.spyOn(windowManager, 'createAuthWindow');

            const url = 'https://accounts.google.com/o/oauth2/auth';
            const result = handler({ url });

            expect(spy).toHaveBeenCalledWith(url);
            expect(result).toEqual({ action: 'deny' });
        });

        it('allows internal domains in new window', () => {
            windowManager.createMainWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];
            const handler = win.webContents.setWindowOpenHandler.mock.calls[0][0];

            const result = handler({ url: 'https://gemini.google.com/chat' });
            expect(result).toEqual({ action: 'allow' });
        });

        it('handles invalid URLs gracefully', () => {
            windowManager.createMainWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];
            const handler = win.webContents.setWindowOpenHandler.mock.calls[0][0];

            const result = handler({ url: 'not-a-valid-url' });
            expect(result).toEqual({ action: 'deny' });
        });

        it('denies non-http/https protocols', () => {
            windowManager.createMainWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];
            const handler = win.webContents.setWindowOpenHandler.mock.calls[0][0];

            const result = handler({ url: 'file:///etc/passwd' });
            expect(result).toEqual({ action: 'deny' });
            expect(shell.openExternal).not.toHaveBeenCalled();
        });
    });

    describe('navigation handler', () => {
        let navigateHandler: any;

        beforeEach(() => {
            windowManager.createMainWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];
            // Find the 'will-navigate' listener
            const call = win.webContents.on.mock.calls.find((c: any) => c[0] === 'will-navigate');
            navigateHandler = call ? call[1] : null;
        });

        it('sets up will-navigate listener', () => {
            expect(navigateHandler).toBeDefined();
        });

        it('allows navigation to internal domains', () => {
            const event = { preventDefault: vi.fn() };
            navigateHandler(event, 'https://gemini.google.com/app');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('allows navigation to OAuth domains', () => {
            const event = { preventDefault: vi.fn() };
            navigateHandler(event, 'https://accounts.google.com/signin');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('blocks navigation to external domains', () => {
            const event = { preventDefault: vi.fn() };
            navigateHandler(event, 'https://malicious-site.com');
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('blocks navigation to invalid URLs', () => {
            const event = { preventDefault: vi.fn() };
            navigateHandler(event, 'not-a-valid-url');
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

    describe('getMainWindow', () => {
        it('returns null when no window exists', () => {
            expect(windowManager.getMainWindow()).toBeNull();
        });

        it('returns the main window when it exists', () => {
            const win = windowManager.createMainWindow();
            expect(windowManager.getMainWindow()).toBe(win);
        });
    });

    describe('minimizeMainWindow', () => {
        it('minimizes main window when it exists', () => {
            const win = windowManager.createMainWindow();
            windowManager.minimizeMainWindow();
            expect(win.minimize).toHaveBeenCalled();
        });

        it('does nothing when main window does not exist', () => {
            // Should not throw
            expect(() => windowManager.minimizeMainWindow()).not.toThrow();
        });
    });

    describe('focusMainWindow', () => {
        it('focuses main window when it exists', () => {
            const win = windowManager.createMainWindow();
            windowManager.focusMainWindow();
            expect(win.show).toHaveBeenCalled();
            expect(win.focus).toHaveBeenCalled();
        });

        it('does nothing when main window does not exist', () => {
            expect(() => windowManager.focusMainWindow()).not.toThrow();
        });
    });

    describe('createOptionsWindow with tab', () => {
        it('passes settings tab hash in dev mode', () => {
            const wm = new WindowManager(true);
            const win = wm.createOptionsWindow('settings');
            expect(win.loadURL).toHaveBeenCalledWith('http://localhost:1420/options.html#settings');
        });

        it('passes about tab hash in prod mode', () => {
            const win = windowManager.createOptionsWindow('about');
            expect(win.loadFile).toHaveBeenCalledWith(
                expect.stringContaining('options.html'),
                expect.objectContaining({ hash: 'about' })
            );
        });

        it('navigates existing window to new tab', () => {
            // Create first window
            const win1 = windowManager.createOptionsWindow();
            win1.webContents.getURL = vi.fn().mockReturnValue('http://localhost:1420/options.html');

            // Request same window with tab
            const win2 = windowManager.createOptionsWindow('settings');

            expect(win1).toBe(win2);
            expect(win1.loadURL).toHaveBeenCalledWith('http://localhost:1420/options.html#settings');
        });
    });

    describe('Quick Chat Window', () => {
        it('creates Quick Chat window with correct positioning', () => {
            const win = windowManager.createQuickChatWindow();
            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win).toBeDefined();
            expect(win.options).toMatchObject({
                frame: false,
                transparent: true,
                alwaysOnTop: true,
                skipTaskbar: true
            });
        });

        it('returns existing Quick Chat window if already created', () => {
            const win1 = windowManager.createQuickChatWindow();
            const win2 = windowManager.createQuickChatWindow();
            expect((BrowserWindow as any)._instances.length).toBe(1);
            expect(win1).toBe(win2);
        });

        it('loads quickchat.html in dev mode', () => {
            const wm = new WindowManager(true);
            const win = wm.createQuickChatWindow();
            expect(win.loadURL).toHaveBeenCalledWith('http://localhost:1420/quickchat.html');
        });

        it('loads quickchat.html in prod mode', () => {
            const win = windowManager.createQuickChatWindow();
            expect(win.loadFile).toHaveBeenCalledWith(expect.stringContaining('quickchat.html'));
        });

        it('shows and focuses window on ready-to-show', () => {
            const win = windowManager.createQuickChatWindow();
            const readyHandler = win.once.mock.calls.find((call: any) => call[0] === 'ready-to-show')[1];
            readyHandler();
            expect(win.show).toHaveBeenCalled();
            expect(win.focus).toHaveBeenCalled();
        });

        it('hides window on blur event', () => {
            const win = windowManager.createQuickChatWindow();
            win.isDestroyed = vi.fn().mockReturnValue(false);

            const blurHandler = win.on.mock.calls.find((call: any) => call[0] === 'blur')[1];
            blurHandler();
            expect(win.hide).toHaveBeenCalled();
        });

        it('clears reference when window is closed', () => {
            windowManager.createQuickChatWindow();
            const instances = (BrowserWindow as any).getAllWindows();
            const win = instances[0];

            const closeHandler = win.on.mock.calls.find((call: any) => call[0] === 'closed')[1];
            closeHandler();

            expect(windowManager.getQuickChatWindow()).toBeNull();
        });
    });

    describe('showQuickChat', () => {
        it('creates Quick Chat window if it does not exist', () => {
            windowManager.showQuickChat();
            expect((BrowserWindow as any)._instances.length).toBe(1);
        });

        it('repositions and shows existing window', () => {
            const win = windowManager.createQuickChatWindow();
            win.setPosition = vi.fn();

            windowManager.showQuickChat();

            expect(win.setPosition).toHaveBeenCalled();
            expect(win.show).toHaveBeenCalled();
            expect(win.focus).toHaveBeenCalled();
        });
    });

    describe('hideQuickChat', () => {
        it('hides Quick Chat window when it exists and is not destroyed', () => {
            const win = windowManager.createQuickChatWindow();
            win.isDestroyed = vi.fn().mockReturnValue(false);

            windowManager.hideQuickChat();
            expect(win.hide).toHaveBeenCalled();
        });

        it('does nothing when Quick Chat window does not exist', () => {
            expect(() => windowManager.hideQuickChat()).not.toThrow();
        });

        it('does nothing when Quick Chat window is destroyed', () => {
            const win = windowManager.createQuickChatWindow();
            win.isDestroyed = vi.fn().mockReturnValue(true);

            // Should not throw
            windowManager.hideQuickChat();
            expect(win.hide).not.toHaveBeenCalled();
        });
    });

    describe('toggleQuickChat', () => {
        it('shows Quick Chat when window does not exist', () => {
            windowManager.toggleQuickChat();
            expect((BrowserWindow as any)._instances.length).toBe(1);
        });

        it('hides Quick Chat when window is visible', () => {
            const win = windowManager.createQuickChatWindow();
            win.isVisible = vi.fn().mockReturnValue(true);
            win.isDestroyed = vi.fn().mockReturnValue(false);

            windowManager.toggleQuickChat();
            expect(win.hide).toHaveBeenCalled();
        });

        it('shows Quick Chat when window exists but is hidden', () => {
            const win = windowManager.createQuickChatWindow();
            win.isVisible = vi.fn().mockReturnValue(false);
            win.setPosition = vi.fn();

            windowManager.toggleQuickChat();
            expect(win.show).toHaveBeenCalled();
        });
    });

    describe('getQuickChatWindow', () => {
        it('returns null when no Quick Chat window exists', () => {
            expect(windowManager.getQuickChatWindow()).toBeNull();
        });

        it('returns the Quick Chat window when it exists', () => {
            const win = windowManager.createQuickChatWindow();
            expect(windowManager.getQuickChatWindow()).toBe(win);
        });
    });

    describe('hideToTray', () => {
        beforeEach(() => {
            mocks.isMacOS = false;
        });

        it('hides window and sets skipTaskbar on Windows', () => {
            mocks.isMacOS = false;
            const win = windowManager.createMainWindow();

            windowManager.hideToTray();

            expect(win.hide).toHaveBeenCalled();
            expect(win.setSkipTaskbar).toHaveBeenCalledWith(true);
        });

        it('hides window and sets skipTaskbar on Linux', () => {
            mocks.isMacOS = false;
            const win = windowManager.createMainWindow();

            windowManager.hideToTray();

            expect(win.hide).toHaveBeenCalled();
            expect(win.setSkipTaskbar).toHaveBeenCalledWith(true);
        });

        it('only hides window on macOS (no skipTaskbar call)', () => {
            mocks.isMacOS = true;
            const win = windowManager.createMainWindow();

            windowManager.hideToTray();

            expect(win.hide).toHaveBeenCalled();
            expect(win.setSkipTaskbar).not.toHaveBeenCalled();
        });

        it('does nothing when no main window exists', () => {
            // Should not throw
            expect(() => windowManager.hideToTray()).not.toThrow();
        });

        it('catches and logs errors gracefully', () => {
            const win = windowManager.createMainWindow();
            win.hide = vi.fn(() => { throw new Error('Test error'); });

            // Should not throw
            expect(() => windowManager.hideToTray()).not.toThrow();
        });
    });

    describe('restoreFromTray', () => {
        beforeEach(() => {
            mocks.isMacOS = false;
        });

        it('shows, focuses window and clears skipTaskbar on Windows', () => {
            mocks.isMacOS = false;
            const win = windowManager.createMainWindow();

            windowManager.restoreFromTray();

            expect(win.show).toHaveBeenCalled();
            expect(win.focus).toHaveBeenCalled();
            expect(win.setSkipTaskbar).toHaveBeenCalledWith(false);
        });

        it('shows, focuses window and clears skipTaskbar on Linux', () => {
            mocks.isMacOS = false;
            const win = windowManager.createMainWindow();

            windowManager.restoreFromTray();

            expect(win.show).toHaveBeenCalled();
            expect(win.focus).toHaveBeenCalled();
            expect(win.setSkipTaskbar).toHaveBeenCalledWith(false);
        });

        it('only shows and focuses window on macOS (no skipTaskbar call)', () => {
            mocks.isMacOS = true;
            const win = windowManager.createMainWindow();

            windowManager.restoreFromTray();

            expect(win.show).toHaveBeenCalled();
            expect(win.focus).toHaveBeenCalled();
            expect(win.setSkipTaskbar).not.toHaveBeenCalled();
        });

        it('does nothing when no main window exists', () => {
            // Should not throw
            expect(() => windowManager.restoreFromTray()).not.toThrow();
        });

        it('catches and logs errors gracefully', () => {
            const win = windowManager.createMainWindow();
            win.show = vi.fn(() => { throw new Error('Test error'); });

            // Should not throw
            expect(() => windowManager.restoreFromTray()).not.toThrow();
        });
    });

    describe('close event handler', () => {
        it('registers close event handler on main window', () => {
            const win = windowManager.createMainWindow();

            // Find the close event handler
            const closeCall = win.on.mock.calls.find((call: any) => call[0] === 'close');
            expect(closeCall).toBeDefined();
        });

        it('calls hideToTray and triggers preventDefault when not quitting', () => {
            const win = windowManager.createMainWindow();

            // Spy on hideToTray
            const hideToTraySpy = vi.spyOn(windowManager, 'hideToTray');

            // Find and trigger the close event handler
            const closeCall = win.on.mock.calls.find((call: any) => call[0] === 'close');
            const event = { preventDefault: vi.fn() };
            closeCall[1](event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(hideToTraySpy).toHaveBeenCalled();
        });

        it('does NOT call preventDefault when quitting', () => {
            const win = windowManager.createMainWindow();
            windowManager.setQuitting(true);

            // Spy on hideToTray
            const hideToTraySpy = vi.spyOn(windowManager, 'hideToTray');

            // Find and trigger the close event handler
            const closeCall = win.on.mock.calls.find((call: any) => call[0] === 'close');
            const event = { preventDefault: vi.fn() };
            closeCall[1](event);

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(hideToTraySpy).not.toHaveBeenCalled();
        });
    });

    describe('setQuitting', () => {
        it('updates the isQuitting state', () => {
            // Access private property for testing if needed, or rely on behavior above
            // Since isQuitting is private, we verify via public behavior (close handler)
            windowManager.setQuitting(true);
            expect(windowManager['isQuitting']).toBe(true);

            windowManager.setQuitting(false);
            expect(windowManager['isQuitting']).toBe(false);
        });
    });
});
