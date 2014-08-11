## 0.2.0

* __BUG:__ Fixes sort-related context leak.
* Adds a helper for controlling grid selection from an external (likely filter) input field.

## 0.1.5

* __BUG:__ Avoids throwing exceptions due to missing data while the grid is initializing.
* __BUG:__ Fixes column class references.

## 0.1.4

* __BUG:__ Fixes issue with tracking current caused by attempts to fix issues with leaky context.

## 0.1.3

* __BUG:__ Fixes more (of the same?) leaky context issues by making sure that certain keypaths are local before a template is installed.

## 0.1.2

* __BUG:__ Fixes leaky context issues by swtiching to restricted references in templates.

## 0.1.1

* __BUG:__ Fixes column ordering in weirdo environments wherein sort functions are passed arguments in reverse. Here's lookin' at you IE and Safari.

## 0.1.0

* Adds support for div-based grids in addition to table-based grids.
* Adds support for keyboard movement within the grid.
* Adds tracking for the currently selected item and index.
* Adds support for providing a filter function and having it applied automatically.
* Adds support for passing some attributes (style, class, id) from the template component through to the actual dom element (table or div).

## 0.0.1

Initial version of simple table-based grid.
