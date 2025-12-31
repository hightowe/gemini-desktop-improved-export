# Tasks

## 1. Core Infrastructure

- [x] 1.1 Add `printToPdf` to `HotkeyId` type and related types
  - Modify `src/shared/types/hotkeys.ts`
  - Add to `HOTKEY_IDS` array
  - Add to `IndividualHotkeySettings` interface
  - Add to `HotkeySettings` interface
  - Add default accelerator `CommandOrControl+Shift+P`

- [x] 1.2 Add IPC channels for print-to-pdf
  - Modify `src/shared/constants/ipc-channels.ts`
  - Add `PRINT_TO_PDF_TRIGGER` channel
  - Add `PRINT_TO_PDF_SUCCESS` channel (for success feedback)
  - Add `PRINT_TO_PDF_ERROR` channel (for error handling)

- [x] 1.3 Update ElectronAPI interface and preload
  - Modify `src/shared/types/ipc.ts` to add `printToPdf()` method
  - Modify `src/preload/preload.ts` to expose the method

## 2. Main Process Implementation

- [x] 2.1 Create PrintManager
  - Create `src/main/managers/printManager.ts`
  - Implement `printToPdf()` method that:
    1. Scrolls webContents to capture entire conversation
    2. Generates PDF buffer using `webContents.printToPDF()`
    3. Shows save dialog with default filename `gemini-chat-YYYY-MM-DD.pdf`
    4. Checks if file exists; if so, appends numeric suffix (`-1`, `-2`, etc.)
    5. Writes PDF to chosen location
    6. Handles errors gracefully with user feedback
  - Ensure cross-platform compatibility (Windows, macOS, Linux)

- [ ] 2.2 Register IPC handler
  - Register `PRINT_TO_PDF_TRIGGER` handler in `ipcManager.ts`
  - Delegate to `PrintManager.printToPdf()`

- [ ] 2.3 Register hotkey in HotkeyManager
  - Modify `src/main/managers/hotkeyManager.ts`
  - Add `printToPdf` shortcut action in constructor
  - Action should invoke the print-to-pdf flow

- [ ] 2.4 Add "Print to PDF" to File menu
  - Modify `src/main/managers/menuManager.ts`
  - Add menu item in `buildFileMenu()`
  - Include accelerator hint matching the hotkey

## 3. Settings Persistence

- [ ] 3.1 Update settings store schema
  - Modify `src/main/store.ts` to include `printToPdf` in:
    - `individualHotkeys` defaults
    - `hotkeyAccelerators` defaults

- [ ] 3.2 Test settings persistence
  - Verify enabled state persists across restarts
  - Verify custom accelerator persists across restarts

## 4. Options Window UI

- [ ] 4.1 Add Print to PDF toggle to IndividualHotkeyToggles
  - Modify `src/renderer/components/options/IndividualHotkeyToggles.tsx`
  - Add new entry to `HOTKEY_CONFIGS` array:

    ```typescript
    {
      id: 'printToPdf',
      label: 'Print to PDF',
      description: 'Export current chat to PDF',
    }
    ```

  - Verify toggle and accelerator input render correctly

## 5. Testing

- [ ] 5.1 Add unit tests for new hotkey type
  - Test default accelerator is `CommandOrControl+Shift+P`
  - Test `HotkeyId` type includes `printToPdf`
  - Test `HOTKEY_IDS` array includes `printToPdf`

- [ ] 5.2 Add unit tests for PrintManager
  - Test filename generation with date format
  - Test filename suffix logic when file exists
  - Test cross-platform path handling

- [ ] 5.3 Add integration tests for print-to-pdf flow
  - Test IPC handler receives and processes request
  - Test PDF buffer is generated from webContents
  - Test save dialog is shown
  - Test file is written to disk
  - Test error handling when write fails

- [ ] 5.4 Add E2E tests
  - Test File menu contains "Print to PDF" item
  - Test clicking menu item opens save dialog
  - Test toggle in Options enables/disables the hotkey
  - Test accelerator customization works
  - Test hotkey triggers print flow when enabled
  - Test hotkey does not trigger when disabled

- [ ] 5.5 Cross-platform E2E verification
  - Verify tests pass on Windows CI
  - Verify tests pass on macOS CI
  - Verify tests pass on Linux CI

## 6. Verification

- [ ] 6.1 Run all existing tests to ensure no regressions
  - `npm run test` (unit)
  - `npm run test:electron` (electron unit)
  - `npm run test:coordinated` (coordinated)
  - `npm run test:integration` (integration)
  - `npm run test:e2e` (e2e)

- [ ] 6.2 Manual testing on each platform
  - [ ] Windows: Test menu, hotkey, toggle, PDF content
  - [ ] macOS: Test menu, hotkey, toggle, PDF content
  - [ ] Linux: Test menu, hotkey, toggle, PDF content

- [ ] 6.3 Verify PDF quality
  - PDF contains entire conversation (not truncated)
  - Text is readable and properly formatted
  - Images (if any) are included
