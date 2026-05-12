## ADDED Requirements

### Requirement: Markdown rendering for advisor report

The system SHALL render the AI-generated advisor report as formatted Markdown in all places where the report text is displayed, using GitHub Flavored Markdown (GFM) semantics (headings, bold/italic, ordered/unordered lists, blockquotes, tables, inline and fenced code, task lists, autolinks, strikethrough).

The system SHALL NOT render raw HTML embedded in the report content, so that the UI remains protected from script injection regardless of AI output.

The rendered Markdown SHALL visually conform to the existing editorial design system (serif italic headings, light-weight body text, zinc palette, dark-mode variants).

#### Scenario: Report contains Markdown syntax

- **WHEN** the AI advisor report returns text containing Markdown syntax (e.g. `## Heading`, `**bold**`, `- item`)
- **THEN** the advisor perspective card, the full synthesis report section, and the report reading modal each display the content as formatted headings, bold text, and bullet lists respectively — not as raw Markdown characters

#### Scenario: Report contains GFM table

- **WHEN** the advisor report contains a GFM-style pipe table
- **THEN** the rendered output displays an HTML table with aligned columns rather than literal pipe characters

#### Scenario: Report contains raw HTML

- **WHEN** the advisor report includes a raw HTML tag such as `<script>` or `<iframe>`
- **THEN** the renderer does NOT inject that HTML into the DOM and the tag is either stripped or rendered as inert text

#### Scenario: Dark mode

- **WHEN** the application is in dark mode
- **THEN** rendered Markdown text, headings, links, and code blocks use the dark-mode color tokens consistent with the rest of the page

### Requirement: Advisor perspective card Markdown preview

The advisor perspective card on the results page SHALL show a truncated Markdown preview of the report (instead of raw truncated text), and the truncation SHALL NOT leave Markdown syntax partially open (e.g. must not cut inside `**bold**` so that leftover asterisks render as literal text).

The truncated preview SHALL indicate that more content is available (for example, by appending an ellipsis).

#### Scenario: Report longer than preview budget

- **WHEN** the advisor report is longer than the preview character budget
- **THEN** the card displays a rendered Markdown excerpt ending at a paragraph boundary with a trailing ellipsis, and Markdown syntax in the excerpt renders as formatted content, not as raw characters

#### Scenario: Report shorter than preview budget

- **WHEN** the advisor report is shorter than the preview budget
- **THEN** the card displays the full report rendered as Markdown with no ellipsis

### Requirement: Report reading modal

The system SHALL provide a dedicated report reading modal that users can open from the advisor perspective card to read the full advisor report in a focused view.

The reading modal SHALL:
- Render the full advisor report using the same Markdown renderer and design system.
- Be openable via a clearly labeled action button on the advisor perspective card.
- Be closable via an explicit close control, pressing the Escape key, and clicking the modal backdrop.
- Prevent background page scrolling while open.
- Render above other page content via a portal to `document.body`.
- Expose dialog semantics to assistive technology (`role="dialog"`, `aria-modal="true"`, accessible name).
- Be hidden from print output; printing SHALL use the in-page report body instead.

#### Scenario: Opening the reader

- **WHEN** the user clicks the "Read full report" action on the advisor perspective card
- **THEN** the reading modal appears above the page, displays the full advisor report rendered as Markdown, and the page behind it does not scroll

#### Scenario: Closing via Escape

- **WHEN** the reading modal is open and the user presses the Escape key
- **THEN** the modal closes and body scrolling is restored

#### Scenario: Closing via backdrop click

- **WHEN** the reading modal is open and the user clicks the backdrop area outside the modal content
- **THEN** the modal closes

#### Scenario: Closing via close button

- **WHEN** the reading modal is open and the user clicks the close control
- **THEN** the modal closes

#### Scenario: Reader opened before report is ready

- **WHEN** the advisor report has not yet finished loading, failed, or requires configuration
- **THEN** the "Read full report" action is either hidden or disabled so that the modal cannot be opened without content

#### Scenario: Printing with modal open

- **WHEN** the user triggers browser print while the reading modal is open
- **THEN** the printed output does not include the modal chrome and instead contains the in-page full synthesis report
