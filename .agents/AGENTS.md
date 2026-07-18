# AGENTS.md

## Purpose

This file provides guidance for AI agents reviewing frontend code, implementing user interfaces, and writing tests in this repository.

## What the agent can do

The agent may:

* review existing frontend code;
* identify bugs, accessibility issues, security risks, and maintainability problems;
* implement and update components, pages, hooks, services, styles, and tests when requested;
* suggest improvements to usability, responsiveness, readability, and organization;
* verify TypeScript typings and API integrations;
* identify duplicated logic and violations of good practices;
* create and update unit and component tests;
* create end-to-end tests when requested;
* run tests, lint, type-check, and build commands to validate changes.

## What the agent must not do

The agent must not:

* change business rules without being asked;
* implement new features without being asked;
* change API contracts or assume undocumented backend behavior;
* reorganize the project architecture without authorization;
* add, remove, or update dependencies without authorization;
* replace the existing design system or styling approach without authorization;
* expose secrets, tokens, or sensitive data in client-side code;
* remove validation, authorization checks, or accessibility behavior only to simplify implementation;
* remove existing tests only to make the test suite pass;
* create commits or push changes.

## Code review

When reviewing code, consider:

* possible bugs and inconsistent UI states;
* loading, empty, success, and error states;
* input validation and error handling;
* accessibility, including semantic HTML, keyboard navigation, focus management, labels, and contrast;
* responsiveness across supported screen sizes;
* security, especially unsafe HTML, sensitive data exposure, and insecure storage;
* TypeScript typings and API response handling;
* duplicated logic and unnecessary re-renders;
* naming clarity and component responsibilities;
* consistency with the current design system and project standards.

Do not change code based only on personal preference.

## Implementation

When implementing frontend changes:

* follow the existing component, styling, state-management, routing, and data-fetching patterns;
* reuse existing components, utilities, hooks, tokens, and assets when appropriate;
* preserve the current visual language unless a redesign is explicitly requested;
* keep components focused and extract shared logic only when there is a concrete reuse or clarity benefit;
* represent loading, empty, success, disabled, and error states when relevant;
* keep user-visible text consistent with the language and terminology already used by the application;
* avoid duplicating backend business rules in the client;
* do not introduce speculative abstractions or configuration.

## Tests

When writing tests:

* follow the existing project patterns;
* test behavior from the user's perspective;
* cover the main success flow;
* cover loading, empty, validation, and expected error states when relevant;
* cover keyboard interaction and accessibility behavior when relevant;
* use mocks only at external boundaries or when necessary;
* avoid tests that depend on execution order, timing, or external services;
* avoid testing internal implementation details unnecessarily;
* do not modify the implementation only to make testing easier.

## Completion

Before finishing, run the commands available in the project, such as:

```bash
npm run lint
npm run build
```

Use only commands that exist in the project's package configuration.

When finished, report:

* the issues found or changes made;
* the tests created or updated;
* the files modified;
* the commands executed and their results;
* any visual, browser, accessibility, or integration points that could not be validated.

## Main rule

Make only the changes necessary to fulfill the request, while preserving the application's current behavior, visual consistency, accessibility, and API compatibility.
