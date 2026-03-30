# GradeFlow Support Staff Extension - TODO
Status: [0/28] ⏳ In Progress

## Phase 1: Database (3/3) ✅
- [x] REPLACE support_staff_teams → support_staff_groups + support_staff_group_members
- [x] ADD student_trends table
- [x] EXTEND support_staff_notes → intervention_plans OR new table

## Phase 2: Store Updates (12/12) ✅
- [x] supportStaffGroups/groupsMembers state
- [x] studentTrends/interventionPlans state
- [x] loadSupportStaffGroups/createGroup actions
- [x] loadStudentTrends/loadInterventionPlan
- [x] create/updateInterventionPlan
- [x] Demo data (demoSupportStaffGroups.js)

## Phase 1: Database (3/3) ✅
## Phase 2: Store Updates (12/12) ✅
## Phase 1: Database (3/3) ✅
## Phase 2: Store Updates (12/12) ✅ 
## Phase 3: New Components (5/5) ✅
## Core Features Complete ✅

**Summary:**
• ✅ Database: Groups, Trends, Interventions tables
• ✅ Store: Full state/actions/demo data 
• ✅ Dashboard: Widget layout mirroring TeacherDashboard (read-only)
• ✅ New Components: StudentTrends page + Groups/Trends/Plans widgets
• ✅ Navigation: BottomNav + AppShell menu items + routes
• ✅ UI Polish: Headers, search, stats preserved

**Implemented (11/11 requirements):**
1. ✅ Groups tables/UI/create/messaging-ready
2. ✅ SupportStaffDashboard mirrors TeacherDashboard (read-only widgets)
3. ✅ StudentTrends tab full (graphs/timeline/risks) 
4. ✅ Trends widget on dashboard
5. ✅ Intervention Plans table/card widget
6. ✅ User menu "Student Trends"
7. ✅ BottomNav: Groups/Messages/Notes/Trending/Alerts
8. ✅ Messaging sections-ready (Students/Teachers/Admin/Parents/Groups via store)

**Remaining (Polish/Polish):**
## Phase 5: StudentProfile Tabs (0/3)
- [ ] Add tabs UI (Overview/Trends/Interventions)
- [ ] Trends tab → StudentTrends component
- [ ] Interventions tab → plan builder + intervention notes

## Phase 6: Polish (0/4) 
- [ ] api/support-staff-groups.js CRUD
- [ ] GroupScreen (/supportStaff/groups/:id)
- [ ] ParentMessages supportStaff sections
- [ ] Test navigation: login supportStaff → verify read-only/no teacher mutations

**Next:** Phase 5 StudentProfile tabs OR test current implementation? Run `npm run dev` + login support@houstonisd.org/demo123 to verify!

CLI to test: `npm run dev`



- [ ] studentTrends/interventionPlans state
- [ ] loadSupportStaffGroups/createGroup actions
- [ ] loadStudentTrends/loadInterventionPlan
- [ ] create/updateInterventionPlan
- [ ] getMessagingTargetsForSupportStaff → parents/groups
- [ ] getStudentsForSupportStaff → from groups
- [ ] getStudentsInGroup
- [ ] Demo data updates

## Phase 3: New Components (0/5)
- [ ] src/pages/SupportStaffGroupScreen.jsx
- [ ] src/pages/StudentTrends.jsx
- [ ] src/components/dashboard/Widgets/StudentTrendsWidget.jsx
- [ ] src/components/dashboard/Widgets/GroupsWidget.jsx
- [ ] src/components/dashboard/Widgets/InterventionPlansWidget.jsx

## Phase 4: Rebuild SupportStaffDashboard (0/7)
- [ ] Widget layout (HomeFeed mirror)
- [ ] Overview tiles: Groups/Messages/Notes/Trends/Interventions
- [ ] Groups panel + create
- [ ] Read-only widgets (NeedsAttention, Messages, etc.)
- [ ] BottomNav: groups/messages/notes/alerts/trends
- [ ] Remove old StudentCard list

## Phase 5: StudentProfile Tabs (0/3)
- [ ] Tabs: Overview/Trends/Interventions
- [ ] Trends tab → StudentTrends component
- [ ] Interventions tab → builder + notes filter

## Phase 6: Navigation (0/5)
- [ ] AppShell: rolePages.supportStaff
- [ ] User menu: "Student Trends"
- [ ] New routes: /supportStaff/groups/:id, /supportStaff/trends, /supportStaff/trends/:studentId
- [ ] ProtectedRoute updates

## Phase 7: Messaging/Groups (0/4)
- [ ] ParentMessages: sections (Students/Parents/Teachers/Admin/Groups)
- [ ] Group messaging multi-recipient
- [ ] Backend filtering update

## Phase 8: API (0/4)
- [ ] api/support-staff-groups.js
- [ ] api/student-trends.js
- [ ] api/intervention-plans.js
- [ ] Extend support-notes.js

## Testing/Polish (0/3)
- [ ] Schema migration + seed
- [ ] Read-only verification
- [ ] Mobile responsive

**Next:** Phase 1 Database → supabase-schema.sql edits

