import React, { useMemo } from 'react';
import { useStore } from '../lib/store';

/**
 * SchoolThemeProvider (Enhanced)
 * 
 * Integrates school branding colors into the existing dark theme system.
 * Falls back to default palette if no school is assigned.
 * 
 * CSS Variables Applied:
 * --school-primary    (header, badges, accents)
 * --school-secondary  (text on primary backgrounds)
 * --school-accent     (buttons, highlights, borders)
 * --school-surface    (widget backgrounds with school tint)
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
      // Fallback to neutral palette (KIPP default)
      return {
        '--school-primary': '#1F4788',      // Navy blue
        '--school-secondary': '#FFFFFF',    // White
        '--school-accent': '#E31937',       // Red
        '--school-surface': 'rgba(31, 71, 136, 0.08)', // 8% opacity navy
      };
    }

    const { primary_color, secondary_color, accent_color } = teacherSchool;

    return {
      '--school-primary': primary_color || '#1F4788',
      '--school-secondary': secondary_color || '#FFFFFF',
      '--school-accent': accent_color || '#E31937',
      // Convert hex to RGB with 8% opacity for surface backgrounds
      '--school-surface': `${primary_color}14`, // 14 hex = ~8% opacity
    };
  }, [teacherSchool]);

  return (
    <div style={themeVars} className="school-theme-wrapper">
      {children}
    </div>
  );
}

/**
 * useSchoolTheme Hook
 * 
 * Access current school's theme colors in any component.
 * Returns: { primaryColor, secondaryColor, accentColor, schoolName }
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
