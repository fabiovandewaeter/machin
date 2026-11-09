Agent instructions

Code
- Write simple, concise code. Avoid overengineering, unnecessary abstractions, boilerplate, and speculative features.
- Use explicit, descriptive names for variables, functions, and data structures.
- Do not add explanatory comments. Use JSDoc only for necessary type annotations.
- Follow data-oriented design: keep data and operations separate, prefer simple data layouts and functions over classes and object hierarchies, separate JSDoc types in .types.js files if needed to avoid circular dependencies
- Use JavaScript with JSDoc for types. Never introduce TypeScript.
- Match existing project conventions and keep changes narrowly scoped.
- Can't use Nodejs or other runtime in code, only to run tests if needed

Environment
- Never install anything: no packages, dependencies, tools, extensions, or system software.
- Never run install commands or modify dependencies or lockfiles. If something required is missing, say so briefly and stop that step.

Communication
- No summaries, reports, or lengthy explanations.
- Final response: ideally none; if a response is required, use at most one very short, blunt sentence.
- Avoid unnecessary progress updates and token-heavy output. Do not sacrifice correctness to save tokens.
