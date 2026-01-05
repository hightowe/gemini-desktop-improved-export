# test-reliability Specification

## Purpose

This specification defines the reliability and coverage requirements for the E2E test suite. All E2E test groups must pass consistently without flakiness, and the test suite must comprehensively exercise all interactive elements in the application.

## Requirements

### Requirement: E2E Test Reliability

The system SHALL reliably verify core features through end-to-end tests without flakiness.

#### Scenario: Startup tests pass without timeout or error

- **Given** the app is built and launched
- **When** the startup test group runs
- **Then** all tests in the group pass

#### Scenario: Options tests pass reliably

- **Given** the app is running
- **When** the options test group runs
- **Then** it correctly interacts with settings and persists changes

#### Scenario: Menu tests pass reliably

- **Given** the app is running
- **When** the menu test group runs
- **Then** menu items trigger expected actions

#### Scenario: Hotkeys tests pass reliably

- **Given** the app is running
- **When** the hotkeys test group runs
- **Then** global shortcuts trigger expected actions

#### Scenario: Window tests pass reliably

- **Given** the app is running
- **When** the window test group runs
- **Then** window management (bounds, resizing) works as expected

#### Scenario: Tray tests pass reliably

- **Given** the app is running
- **When** the tray test group runs
- **Then** tray icon interactions work as expected

#### Scenario: Update tests pass reliably

- **Given** the app is packaged
- **When** the update test group runs
- **Then** it correctly checks for updates (simulated or real)

#### Scenario: Stability tests pass reliably

- **Given** the app is running under stress
- **When** the stability test group runs
- **Then** the app does not crash or hang

---

### Requirement: Comprehensive E2E Coverage

The E2E test suite SHALL exercise every interactive element in each application component.

#### Scenario: All buttons are clicked

- **Given** a test group targets a component
- **When** the tests run
- **Then** every button in the component is clicked and its action is verified

#### Scenario: All menus are opened

- **Given** a test group targets a component with menus
- **When** the tests run
- **Then** every menu is opened and each menu item is clicked

#### Scenario: All links are navigated

- **Given** a test group targets a component with links
- **When** the tests run
- **Then** every link is clicked and navigation is verified

#### Scenario: All inputs are tested

- **Given** a test group targets a component with form inputs
- **When** the tests run
- **Then** every input field is filled, validated, and submitted

#### Scenario: All toggles and switches are tested

- **Given** a test group targets a component with toggles
- **When** the tests run
- **Then** every toggle is switched on and off, and state changes are verified

### Requirement: Shared Test Mock Infrastructure

The test suite SHALL provide shared mock factories to reduce code duplication and improve maintainability.

#### Scenario: Logger mock is available globally for all coordinated tests

- **WHEN** a coordinated test runs
- **THEN** a mock logger is automatically available without inline `vi.mock()` calls

#### Scenario: Manager mocks are created via factory functions

- **WHEN** a test needs a mock WindowManager, Store, or other manager
- **THEN** it can use `createMockWindowManager()`, `createMockStore()`, or similar factory
- **AND** the factory returns a fully-typed mock with all methods

#### Scenario: Mock factories support customization via overrides

- **WHEN** a test needs specific mock behavior
- **THEN** it can pass an overrides object to the factory
- **AND** only the specified methods are overridden

#### Scenario: WebContents mock supports multiple configurations

- **WHEN** a test needs a mock webContents
- **THEN** it can use `createMockWebContents(options)` with configurable capabilities
- **AND** options include scroll capture, custom dimensions, and custom isDestroyed behavior

#### Scenario: ElectronAPI mock is available for renderer component tests

- **WHEN** a renderer component test needs `window.electronAPI`
- **THEN** it can use `setupMockElectronAPI()` to configure the mock
- **AND** the mock includes all methods from the ElectronAPI interface

---

### Requirement: Test Harness Utilities

The test suite SHALL provide shared utilities for common test setup patterns.

#### Scenario: Fake timers utility handles setup and cleanup

- **WHEN** a test needs fake timers
- **THEN** it can use `useFakeTimers()` from the harness
- **AND** cleanup is automatic in afterEach

#### Scenario: Platform stubbing utility handles cross-platform scenarios

- **WHEN** a test needs to run on multiple platforms
- **THEN** it can use `stubPlatform()` or `stubPlatformAll()` utilities
- **AND** cleanup is automatic in afterEach
