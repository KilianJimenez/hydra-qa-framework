# When to create a Skill

Create a skill when:

- A pattern is used repeatedly and AI needs guidance
- Project-specific conventions differ from generic best practices
- Complex workflows need step-by-step instructions
- Decision trees help AI choose the right approach

**Don't create a skill when:**

- Documentation already exists (create a reference instead)
- Pattern is trivial or self-explanatory
- It's a one-off task

---

# Skills Architecture

Skills are Markdown files stored in `.github/skills/` that provide domain-specific
instructions to AI agents. Each skill encapsulates reusable patterns and
conventions that the AI reads on demand when working on a specific task.

```
.github/skills/
├── skill-name/
│   ├── SKILL.md       ← main skill file (required)
│   ├── references/    ← local documentation (optional)
│   └── assets/        ← templates and examples (optional)
```

The AI loads a skill's content into its context window when the user's request
matches the trigger keywords defined in the skill's `description` frontmatter.

## Skills vs MCP

| Dimension | Skills | MCP |
|---|---|---|
| **Nature** | Static Markdown instructions | External tool/server called at runtime |
| **Availability** | Always available (local files) | Requires a running server or API |
| **Latency** | Zero (file read) | Network round-trip per call |
| **Capability** | Guidance and patterns only | Can execute actions and return live data |
| **Versioning** | Version-controlled with the codebase | External dependency, versioned separately |
| **Offline support** | Works offline | Requires connectivity |

Use **Skills** for static conventions and repeatable guidance.
Use **MCP** for live data, external actions, or system integrations.

## Cost and Performance Implications

Each skill loaded into context consumes tokens from the model's context window,
increasing both latency and cost per request.

| Practice | Impact |
|---|---|
| Load only the relevant skill | Lower token usage and cost |
| Large skills with verbose content | More tokens consumed per invocation |
| Small, focused skills | Minimal token overhead |
| Load multiple skills at once | Higher context usage, higher cost |

Principles to minimise cost:
- **One concern per skill** — keep each skill tightly scoped
- **Avoid duplication** — reference existing docs instead of copying them
- **Prefer tables and bullets** over prose to reduce token count
- **Minimal code examples** — only include what is strictly necessary
- **Do not load skills eagerly** — invoke only when the task clearly matches

---

# Skill structure

## File structure
```
.github/skills/skill-name/
├── SKILL.md                 # Required - main skill file
├── scripts/                 # Optional - executable code
│   ├── process_data.py      # Example
│   └── validate.sh          # Example
├── references/              # Optional - documentation
│   ├── api-guide.md         # Example
│   └── examples/            # Example
└── assets/                  # Optional - templates, etc.
    └── report-template.md   # Example
```

## Minimal required frontmatter and skill format in SKILL.md
```
---
name: skill-name
description: What it does. Use when user asks to [specific
phrases].
license: MIT
---

## When to Use

{Bullet points of when to use this skill}

## Critical Patterns

{The most important rules - what AI MUST know}

## Code Examples

{Minimal, focused examples}

## Commands

{If applicable, list of commands to execute the skill}
```

**Critical**: All code examples in SKILL.md, assets/ and references/ MUST:

- ✅ Be syntactically correct
- ✅ Have no TypeScript errors
- ✅ Follow project conventions
- ✅ Be tested before committing

---

# When to use the skill

Create sub-skills in `.github/skills/skill-name/SKILL.md` directory when:

- **Skill is too generic**: Base skill covers common case, sub-skills handle
  variants
- **User requests it**: Explicitly asked to split logic into sub-skills
- **Multiple approaches exist**: Different solutions for different contexts
- **Complexity is high**: Breaking down makes it more manageable

# Resources

- **Templates**: See `assets/` for templates and examples
- **Documentation**: See `references/` for local docs

---

# Content Guidelines

### DO
- Start with the most critical patterns
- Use tables for decision trees
- Keep code examples minimal and focused
- **Test all code examples** - no TypeScript/syntax errors
- Include Commands section with copy-paste commands

### DON'T
- Add Keywords section (agent searches frontmatter, not body)
- Duplicate content from existing docs (reference instead)
- Include lengthy explanations (link to docs)
- Add troubleshooting sections (keep focused)
- Use web URLs in references (use local paths)
- **Include code with errors** - always validate syntax and types

---

# Checklist Before Creating

- [ ] Skill doesn't already exist (check `skills/`)
- [ ] Pattern is reusable (not one-off)
- [ ] Name follows conventions
- [ ] Frontmatter is complete (description includes trigger keywords)
- [ ] Critical patterns are clear
- [ ] **All code examples are error-free** (no TypeScript/syntax errors)
- [ ] Code examples tested in actual project
- [ ] Commands section exists (if applicable)
- [ ] Registered in appropriate custom agent file