## Commit co-author
Every commit message must end with this exact trailer line:
Co-authored-by: Yanqing Cheng <39169896+yanqingcheng@users.noreply.github.com>
Never add a Co-authored-by line with any other address for Yanqing, and never use her personal Gmail anywhere in commits or files.

## Workshop rules

- PR review: reviews default to Sol; use Astra only for big-blast-radius changes.
- Cloud agents hand PRs back to the Workshop seat for review (the seat runs the Sol/Astra review). Cloud agents never merge.
- If this project has a Cursor Project coordinator, all repo work goes to that Project, not a standalone cloud agent.
- Validation and testing are separate. A non-builder validates with a recorded real-screen check quoting on-screen text; that is the UI merge gate. QA testing comes after and feeds backlog/release. A test pass never replaces validation.
