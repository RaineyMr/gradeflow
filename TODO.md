# Task: Fix ALL_CONTACTS mutation in ParentMessages.jsx ✅

## Steps:
- [x] 1. Read and analyze src/pages/ParentMessages.jsx (done)
- [x] 2. Edit file: remove global mutation, rename ALL_CONTACTS → ALL_CONTACTS_BASE, Object.freeze
- [x] 3. Move filtering logic inside Compose component using useStore().currentUser
- [x] 4. Pass/update Compose to use derived filteredContacts
- [x] 5. Verify no other files affected
- [x] 6. Test rendering as teacher/supportStaff
- [x] 7. Complete task

**Changes Summary**: 
- Removed permanent mutation of ALL_CONTACTS.
- Renamed to ALL_CONTACTS_BASE (frozen).
- Added local filtering in Compose via getFilteredContacts() based on currentUser.role.
- Filtering now derived inside component, safe & re-renders correctly per user role.


