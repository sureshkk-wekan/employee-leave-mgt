# Implementation Workflow: Push after each phase

When running **`/speckit.implement`** (or implementing from `tasks.md` manually):

1. **Complete one phase** (all tasks in that phase).
2. **Mark tasks complete** in `tasks.md`: change `- [ ]` to `- [x]` for each done task.
3. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Phase N: <phase name> complete"
   git push origin main
   ```
4. **Continue to the next phase**; repeat until all phases are done.

This keeps history clean, allows rollback by phase, and shares progress with the team after each milestone.

**Phases:** 1 Setup & Foundation → 2 Auth → 3 Leave Types → 4 Leave Requests → 5 Balances → 6 Users → 7 UI & Integration → 8 Documentation.
