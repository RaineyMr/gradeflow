import React, { useMemo } from 'react';
import { useStore } from '../lib/store';

/**
 * SchoolThemeProvider
 * 
 * Dynamically applies school branding colors to the dashboard based on the
 * currently logged-in teacher's school. Reads primary_color, secondary_color,
 * and accent_color from schools table and applies as CSS variables.
 * 
 * Usage: Wrap entire app or specific dashboard sections with this component.
 */
export function SchoolThemeProvider({ children }) {
  const currentUser = useStore((state) => state.currentUser);
  const schools = useStore((state) => state.schools);

  // Find the teacher's school record
  const teacherSchool = useMemo(() => {
    if (!currentUser?.school_id || !schools) return null;
    return schools.find((s) => s.id === currentUser.school_id);
  }, [currentUser?.school_id, schools]);

  // Build CSS variables object from school branding
  const themeVars = useMemo(() => {
    if (!teacherSchool) {
      // Fallback to neutral theme if no school found
      return {
        '--school-primary': '#1F4788',
        '--school-secondary': '#FFFFFF',
        '--school-accent': '#E31937',
        '--school-surface': '#F5F5F5',
        '--school-text': '#333333',
      };
    }

    const { primary_color, secondary_color, accent_color } = teacherSchool;

    return {
      '--school-primary': primary_color || '#1F4788',
      '--school-secondary': secondary_color || '#FFFFFF',
      '--school-accent': accent_color || '#E31937',
      '--school-surface': `${primary_color}15`, // 15% opacity for surface
      '--school-text': '#333333',
    };
  }, [teacherSchool]);

  return (
    <div style={themeVars} className="school-theme-wrapper">
      {children}
    </div>
  );
}

/**
 * useSchoolTheme
 * 
 * Hook to access current school's theme colors in any component.
 * Returns { primaryColor, secondaryColor, accentColor, schoolName }
 */
export function useSchoolTheme() {
  const currentUser = useStore((state) => state.currentUser);
  const schools = useStore((state) => state.schools);

  const theme = useMemo(() => {
    if (!currentUser?.school_id || !schools) {
      return {
        primaryColor: '#1F4788',
        secondaryColor: '#FFFFFF',
        accentColor: '#E31937',
        schoolName: 'GradeFlow',
      };
    }

    const school = schools.find((s) => s.id === currentUser.school_id);
    return {
      primaryColor: school?.primary_color || '#1F4788',
      secondaryColor: school?.secondary_color || '#FFFFFF',
      accentColor: school?.accent_color || '#E31937',
      schoolName: school?.name || 'GradeFlow',
    };
  }, [currentUser?.school_id, schools]);

  return theme;
}

/**
 * Example CSS that uses school theme variables:
 * 
 * .dashboard-header {
 *   background-color: var(--school-primary);
 *   color: var(--school-secondary);
 * }
 * 
 * .button-primary {
 *   background-color: var(--school-accent);
 * }
 * 
 * .card-surface {
 *   background-color: var(--school-surface);
 *   border-left: 4px solid var(--school-primary);
 * }
 */
