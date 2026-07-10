# Dashboard Init

<div class="callout callout-alert">
This package is still experimental. “Experimental” means this is an early implementation subject to drastic and breaking changes.
</div>

Initialization module for the dashboard page. Before the page renders it
registers the widget-modules discovery entity, so the dashboard can resolve
the registered widget types, and the page's field types (currently
`core/location`), so widget attributes can reference them by name.

## Installation

Install the module:

```bash
npm install @wordpress/dashboard-init --save
```
