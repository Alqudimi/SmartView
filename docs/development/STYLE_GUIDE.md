# Code Style & Standards

## TypeScript Standards
- **Strict Typing:** No implicit `any`. Use interfaces for all object shapes.
- **Imports:** Absolute imports are preferred. All imports must be at the top of the file. No object destructuring in import paths unless it's from a named export.
- **Enums:** Use standard `enum`, do not use `const enum`.

## React Standards
- **Functional Components:** All components must be functional. Use hooks (`useState`, `useEffect`, `useCallback`).
- **Props:** Use destructured props with explicit interface typing.

## Styling (Tailwind CSS)
- **Utility-First:** Use Tailwind classes exclusively. No inline styles or external `.css` files (except the core `index.css` Tailwind injection).
- **Responsive:** Always use `sm:`, `md:`, `lg:` prefixes. Design desktop-first with fluidity.
- **Colors:** Use precise hex codes for branding (e.g., `#0B0F19`, `#00E5FF`) and Tailwind semantic colors for utilities.

## Commenting
- Use JSDoc for complex functions.
- Avoid obvious comments; write self-documenting code.
