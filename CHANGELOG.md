# Changelog - NixBoard

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Code generation button** - Button to generate new card code now works
  - Added `regenerateCode()` function inside Vue `createApp()` scope
  - Previously broken due to function being defined outside Vue reactive context
- **New card displays empty** - Card created via modal now shows complete data
  - Added `loadBoard()` reload after POST to get full card data from backend
  - Previously only returned minimal data (id, code, lane_id, position)

### Added
- **Accessibility improvements**
  - aria-labels on all icon buttons (edit, delete, theme, tools)
  - Focus indicators on buttons and inputs
  - Card delete button now has focus style
  - "Add Card" button more visible with text instead of just "+"
- **Optimistic UI updates**
  - Save, delete, archive operations update local state immediately
  - No full board reload on every action - smoother experience

### Fixed
- **Code duplication** - Removed duplicate themes/colors definitions
  - Now uses `src/constants.js` instead of inline definitions
  - Single source of truth for theme and color configurations
- **Documentation** - Updated CONTRIBUTING.md and MAKINGOF.md
  - Corrected project structure paths
  - Updated architecture diagrams

---

## [0.9.0] - 2026-03-10

### Added
- Archive Feature - New overlay for archived cards
- Modal Overlay Styling - Card edit modal now styled as overlay
- Header Button Redesign - Improved header actions
- ESC Key Support
- Click Outside to Close
- YouTube tag filtering

### Fixed
- Archive Toggle Bug (`showArchive is not defined`)
- Modal Theme Not Updating

### Changed
- Theme System - Extended with modal-specific gradients

---

## [0.8.3] - 2026-03-06

### Added
- Subtask CRUD Endpoints - Complete REST API for subtask management

### Fixed
- Manual Card Move Persistence - Fixed sql.js stmt.run parameter format
- Missing Subtask Endpoints - Added full subtask CRUD to backend
- CODE_WORDS unified in cards.js

---

## [0.8.2] - 2026-02-25

### Changed
- UX Improvements

### Fixed
- Various bugfixes

---

## [0.8.1] - 2026-02-25

### Fixed
- Bugfix release

---

## [0.8.0] - 2026-02-25

### Added
- Clean code release improvements

### Changed
- Code refactoring and cleanup

### Fixed
- Various issues

---

## [0.7.0] - 2026-02-19

### Added
- Galaxy theme release

### Changed
- Theme system improvements

---

## [0.6.0] - 2026-02-18

### Added
- Darth Mode release

### Security
- Security hardening

---

## [0.5.0] - 2026-02-18

### Added
- Beta release features

### Fixed
- Various fixes

### Security
- Security improvements

---

## [0.1.0] - 2026-02-16

### Added
- Initial release
- Basic Kanban board functionality
- Vue.js frontend
- Express backend with SQLite

---

*For older releases, see the git history.*
