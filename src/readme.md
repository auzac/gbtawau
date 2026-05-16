# GBT Tawau — Frontend Architecture Schema

## Overview

This document defines the architectural structure, responsibilities, and design philosophy of the GBT Tawau frontend application.

The purpose of this schema is to:

* Future-proof the project structure
* Maintain clean separation of concerns
* Make onboarding easier
* Standardize component responsibilities
* Simplify future Supabase/backend integration
* Prevent logic duplication
* Improve scalability and maintainability

---

# Core Architectural Philosophy

The application follows:

## 1. Page → Component → Service Flow

### Pages

Responsible for:

* State orchestration
* Data flow
* Modal visibility
* Navigation
* High-level business logic

Pages SHOULD NOT:

* Contain repetitive UI blocks
* Contain duplicated styling
* Handle localStorage directly
* Become excessively large

---

### Components

Responsible for:

* Reusable UI rendering
* Presentational structure
* User interactions
* Controlled inputs

Components SHOULD:

* Be isolated
* Be reusable
* Receive props cleanly
* Avoid business logic

---

### Services

Responsible for:

* Data storage
* Data retrieval
* Persistence layer abstraction

Services act as the bridge between:

Current:

* localStorage

Future:

* Supabase
* APIs
* Databases

This prevents rewriting UI later.

---

### Utils

Responsible for:

* Pure helper functions
* Date formatting
* Calendar calculations
* Shared reusable logic

Utils must NEVER:

* Access React state
* Access UI directly
* Contain side effects

---

# Folder Structure

```txt
src/
├── pages/
├── components/
├── services/
├── utils/
```

---

# Pages Layer

## `/pages`

Contains route-level containers.

Each page represents:

* A complete screen
* A route endpoint
* A top-level experience

---

## `ContentManager.jsx`

### Purpose

Main orchestration layer for content management.

### Responsibilities

* Manage active tabs
* Manage modal states
* Coordinate data loading
* Pass props to child components
* Handle save operations
* Trigger toast notifications

### Owns State For

* verse
* events
* roster
* history
* calendar preview
* modal visibility
* active tab

### Should NOT

* Render raw repetitive cards inline
* Handle localStorage directly
* Become UI-heavy

---

## `StaffHub.jsx`

### Purpose

Main administrative dashboard.

### Responsibilities

* Module navigation
* Staff landing experience
* Overview metrics
* Portal routing

### Design Direction

* Modern minimalist
* Premium church administration feel
* Soft neutral palette
* Grid-based layout
* Consistent card sizing

---

## `MemberManager.jsx`

### Purpose

Manage church members.

### Future Scope

* Search/filter
* Attendance
* Baptism records
* Membership status
* Exporting
* Supabase integration

---

## `AdminTools.jsx`

### Purpose

Administrative utilities and future internal tools.

### Planned Scope

* Letter generation
* Reports
* Analytics
* Document templates
* Internal automation

---

# Components Layer

## `/components`

Reusable UI building blocks.

Structure:

```txt
components/
├── layout/
├── ui/
├── content/
└── modals/
```

---

# Layout Components

## `/components/layout`

Structural layout components shared across pages.

---

## `PageHeader.jsx`

### Purpose

Standardized page header.

### Responsibilities

* Back navigation
* Page title
* Subtitle
* Top actions

### Benefits

* Consistent UX
* Easier future redesign
* Shared styling system

---

## `Tabs.jsx`

### Purpose

Reusable tab navigation.

### Responsibilities

* Active tab switching
* Tab styling
* Tab rendering

### Used By

* ContentManager
* Future admin sections

---

## `SectionCard.jsx`

### Purpose

Reusable content section wrapper.

### Responsibilities

* Shared card styling
* Padding
* Border consistency
* Section spacing

### Why It Exists

Prevents repeated:

```jsx
className="bg-white rounded-2xl border border-[#EAE1D4]"
```

throughout the application.

---

# UI Components

## `/components/ui`

Generic reusable UI primitives.

These components should be highly reusable.

---

## `Button.jsx`

### Purpose

Unified button system.

### Responsibilities

* Variants
* Sizes
* Loading states
* Consistent styling

### Future Expansion

* Icon support
* Disabled states
* Danger variants
* Ghost variants

---

## `ModalShell.jsx`

### Purpose

Shared modal wrapper.

### Responsibilities

* Overlay rendering
* Center alignment
* Close button layout
* Scroll handling
* Modal sizing

### Why Important

Without this:

* Every modal duplicates structure
* Styling becomes inconsistent
* Future redesign becomes difficult

---

## `SaveToast.jsx`

### Purpose

Temporary success notification.

### Responsibilities

* Save feedback
* Auto-dismiss behavior
* Shared toast appearance

### Future Scope

Can evolve into:

* Error notifications
* Warning notifications
* Global toast system

---

## `EmptyState.jsx`

### Purpose

Reusable empty-state display.

### Used When

* No events
* No history
* No roster
* No members

### Benefits

Consistent UX for empty content.

---

# Content Components

## `/components/content`

Domain-specific content management UI.

---

## `VerseEditor.jsx`

### Purpose

Weekly scripture editing UI.

### Responsibilities

* Reference input
* Verse text input
* Theme input
* Save trigger
* History trigger

### Connected Data

* `verseService`
* `historyService`

---

## `EventsPanel.jsx`

### Purpose

Container for all event management.

### Responsibilities

* Render event list
* Add event trigger
* Save events trigger
* Empty states

### Child Components

* `EventCard`

---

## `EventCard.jsx`

### Purpose

Single event display card.

### Responsibilities

* Event rendering
* Edit button
* Delete button
* Date display

### Must Remain

Purely presentational.

---

## `RosterPanel.jsx`

### Purpose

Container for worship roster management.

### Responsibilities

* Render weekly roster list
* Save roster trigger
* History trigger

### Child Components

* `RosterCard`

---

## `RosterCard.jsx`

### Purpose

Display single worship week.

### Responsibilities

* Leader display
* Pianist display
* Reader display
* Edit trigger
* Save trigger

---

# Modal Components

## `/components/modals`

Dedicated modal implementations.

All should use:

```jsx
<ModalShell />
```

for consistency.

---

## `HistoryModal.jsx`

### Purpose

Display restore history.

### Supports

* Verse history
* Roster history

### Features

* Restore functionality
* Chronological records
* Save timestamps

---

## `EventModal.jsx`

### Purpose

Create/edit event modal.

### Responsibilities

* Event form inputs
* Validation
* Submission

---

## `RosterModal.jsx`

### Purpose

Edit worship week assignments.

### Responsibilities

* Leader editing
* Pianist editing
* Reader editing

---

## `CalendarModal.jsx`

### Purpose

Preview content schedule by week.

### Displays

* Weekly verse
* Worship roster
* Events for selected week

### Uses

* `calendar.js`
* `dates.js`

---

# Services Layer

## `/services`

Data persistence abstraction.

Current implementation:

* localStorage

Future implementation:

* Supabase
* REST APIs
* Server functions

IMPORTANT:

Pages/components should NEVER directly use localStorage.

Only services should.

---

## `verseService.js`

### Responsibilities

* Save verse
* Load verse
* Update verse

### Current Storage

```js
localStorage
```

### Future Migration

```js
supabase.from('verses')
```

---

## `eventService.js`

### Responsibilities

* Save events
* Load events
* Delete events
* Update events

---

## `rosterService.js`

### Responsibilities

* Save roster
* Load roster
* Update roster

---

## `historyService.js`

### Responsibilities

* Save history snapshots
* Retrieve history
* Restore historical state

### Stores

* Verse history
* Roster history

---

# Utils Layer

## `/utils`

Pure helper utilities.

---

## `calendar.js`

### Responsibilities

* Week calculations
* Date range generation
* Monthly calendar logic

### Example

```js
getWeekDateRange()
```

---

## `dates.js`

### Responsibilities

* Date formatting
* Day extraction
* Human-readable conversions

### Example

```js
formatDateRange()
```

---

# Current Data Flow

```txt
User Action
    ↓
Page State
    ↓
Component UI
    ↓
Service Layer
    ↓
localStorage
```

---

# Future Supabase Flow

```txt
User Action
    ↓
Page State
    ↓
Component UI
    ↓
Service Layer
    ↓
Supabase API
    ↓
Database
```

Because services are abstracted already:

NO UI rewrite will be needed.

Only service internals change.

---

# Design System Direction

## Visual Style

Target aesthetic:

* Modern minimalist
* Soft editorial feel
* Elegant church administration UI
* Premium but calm
* Clean spacing
* Subtle borders
* Light shadows only when needed

---

## Color Direction

### Primary Background

```txt
#FAF8F5
```

### Card Background

```txt
#FFFFFF
```

### Borders

```txt
#EAE1D4
```

### Primary Text

```txt
#2D2926
```

### Secondary Text

```txt
#8A7A6E
```

---

# UI Principles

## Avoid

* Heavy gradients
* Emoji-heavy interfaces
* Oversaturated colors
* Dense layouts
* Large shadows
* Inconsistent border radius

---

## Prefer

* Lucide icons
* Rounded-xl / rounded-2xl
* Soft neutral palette
* Consistent spacing
* Typography hierarchy
* Clean card layouts

---

# Naming Conventions

## Components

Use:

```txt
PascalCase.jsx
```

Examples:

* `PageHeader.jsx`
* `EventCard.jsx`

---

## Services

Use:

```txt
camelCase.js
```

Examples:

* `verseService.js`
* `historyService.js`

---

## Utils

Use:

```txt
camelCase.js
```

Examples:

* `calendar.js`
* `dates.js`

---

# Future Recommended Expansions

## Authentication

Planned:

* Supabase Auth
* Role-based access
* Session persistence

---

## Database Tables

Planned structure:

### verses

* id
* reference
* text
* theme
* updated_at

### events

* id
* title_en
* title_bm
* date
* description
* created_at

### roster

* id
* week_start
* leader
* pianist
* reader

### members

* id
* name
* phone
* ministry
* baptism_status

---

# Long-Term Scalability Goal

The architecture should support:

* Multi-admin usage
* Cloud database sync
* Mobile responsiveness
* Analytics
* Attendance systems
* Document generation
* Internal church tools
* Ministry scheduling
* Sermon archives
* Notification systems

without needing major rewrites.

---

# Final Guiding Principle

Every file should have:

## One Clear Responsibility

If a file starts doing too many things:

* Split it
* Isolate logic
* Extract components
* Extract services

The goal is maintainability over speed.
