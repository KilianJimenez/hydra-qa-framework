---
description: "Prompt for guided exploratory testing session"
---

# Exploratory Testing Session

## Input
- **Area**: `${{FEATURE_AREA}}`
- **Platform**: `${{PLATFORM}}` (web | android | ios)
- **Time Box**: `${{TIME_BOX}}` (default: 30 minutes)
- **Focus**: `${{FOCUS}}` (optional: usability | edge-cases | security | performance)

## Task
Conduct a structured exploratory testing session on the specified feature area.

## Charter
> Explore `${{FEATURE_AREA}}` on `${{PLATFORM}}`
> with focus on `${{FOCUS}}`
> to discover defects, UX issues, and risks
> within `${{TIME_BOX}}`

## Heuristics to Apply

### SFDPOT (James Bach)
- **Structure**: How is the feature organized? Menus, flows, states?
- **Function**: Does it do what it should? All buttons, links, fields working?
- **Data**: What happens with different inputs? Empty, long, special chars, unicode?
- **Platform**: Browser/device differences? Orientation? Network conditions?
- **Operations**: How does it work in real-world usage? Interruptions? Multi-tasking?
- **Time**: Timeouts? Expiration? Clock-dependent behavior?

### Boundary Testing
- Minimum / Maximum values
- Just below / Just above limits
- Empty vs null vs whitespace
- First / Last items in lists

## Session Steps

1. **Setup**: Navigate to the feature area on the target platform
2. **Observe**: Note the initial state and visible elements
3. **Interact**: Test systematically using the heuristics above
4. **Capture**: Screenshot any anomaly immediately
5. **Log**: Record each observation with: timestamp, type, description, severity
6. **Summarize**: Produce the session report

## Output Format

Produce a session report as described in the Manual Testing Agent definition.
For each bug found, offer to create a Jira ticket.

