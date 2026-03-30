# Dashboard Refactor TODO
Current Progress: 0/14 steps complete.

## Steps:
1. ✅ Create TODO.md (this file)
2. Create src/components/ui/ dir structure + extract Widget.jsx, ActionBtn.jsx, GradeBadge.jsx, TrendBadge.jsx, RoleBadge.jsx
3. Create src/styles/Dashboard.module.css with extracted styles
4. Extract StickyHeader to src/components/layout/StickyHeader.jsx
5. Extract HomeFeed logic to src/components/dashboard/HomeFeed.jsx
6. Create src/components/dashboard/Widgets/ dir + move 3 widgets (TodaysLessonsWidget, MessagesWidget, NeedsAttentionWidget)
7. Create src/components/dashboard/Widgets/ dir + move 4 widgets (ReportsWidget, GradingWidget, LessonPlanWidget, SketchAnnotateWidget)
8. Create src/components/dashboard/Widgets/ dir + move remaining widgets (TestingSuiteWidget, ScanGradeSheetWidget, GradebookWidget)
9. Create src/components/dashboard/SubPages/ dir + extract 3 subpages (RemindersPage, NeedsAttentionPage, ClassesPage)
10. Create src/components/dashboard/SubPages/ dir + extract remaining subpages (AlertsPage, SettingsPage)
11. Update Dashboard.jsx: Import new components, remove inline code, use CSS modules, integrate store properly
12. Add memoization, accessibility (aria-labels), useCallback/useMemo where needed across files
13. Update dependent imports in store/useDashboard if needed
14. Test navigation, remove mocks, lint/test
15. attempt_completion

**Next Step: #2 - Extract shared UI components**

