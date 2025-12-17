import { Menu, MenuItemConstructorOptions, app, shell, MenuItem } from 'electron';
import WindowManager from './windowManager';

/**
 * Manages the application native menu.
 * Critical for macOS where the menu bar is at the top of the screen.
 * On Windows/Linux, we use a custom titlebar menu, so this is less visible,
 * but still good for accessibility if the custom menu is disabled.
 */
export default class MenuManager {
    constructor(private windowManager: WindowManager) { }

    /**
     * Builds and sets the application menu.
     */
    buildMenu(): void {
        const template: MenuItemConstructorOptions[] = [
            this.buildFileMenu(),
            this.buildViewMenu(),
            this.buildHelpMenu()
        ];

        if (process.platform === 'darwin') {
            template.unshift(this.buildAppMenu());
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    private buildAppMenu(): MenuItemConstructorOptions {
        return {
            label: 'Gemini Desktop',
            submenu: [
                {
                    label: 'About Gemini Desktop',
                    click: () => this.windowManager.createOptionsWindow('about'),
                },
                { type: 'separator' },
                {
                    label: 'Settings...',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => this.windowManager.createOptionsWindow(),
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        };
    }

    private buildFileMenu(): MenuItemConstructorOptions {
        const menu: MenuItemConstructorOptions = {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    enabled: false // Request to add later
                },
                { type: 'separator' },
                {
                    label: 'Sign in to Google',
                    click: async () => {
                        await this.windowManager.createAuthWindow('https://accounts.google.com/signin');
                        // Reload main window to capture new auth state
                        this.windowManager.getMainWindow()?.reload();
                    }
                },
                {
                    label: process.platform === 'darwin' ? 'Settings...' : 'Options',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => this.windowManager.createOptionsWindow()
                },
                { type: 'separator' },
                { role: process.platform === 'darwin' ? 'close' : 'quit' }
            ]
        };

        return menu;
    }

    private buildViewMenu(): MenuItemConstructorOptions {
        return {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        };
    }

    private buildHelpMenu(): MenuItemConstructorOptions {
        return {
            label: 'Help',
            submenu: [
                {
                    label: 'About Gemini Desktop',
                    click: () => this.windowManager.createOptionsWindow('about')
                },
                {
                    label: 'Report an Issue',
                    click: () => shell.openExternal('https://github.com/bwendell/gemini-desktop/issues')
                }
            ]
        };
    }
}
