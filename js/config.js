/**
 * Simar Portfolio - Central Configuration
 * Supabase project credentials & site initial defaults
 */
const CONFIG = {
  SUPABASE_URL: 'https://rnekifhfxmixmehiaodv.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_y1mAlPqnNUVwRHw3_o57DQ_KDMpBY0U',
  SUPABASE_LEGACY_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWtpZmhmeG1peG1laGlhb2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MDI3MDQsImV4cCI6MjEwNjA3ODcwNH0.eBuyQnoY78ps-o2gIguA-uVuwDQeeZyrheSNYpMx4zw',
  STORAGE_BUCKET: 'portfolio-images',

  CACHE_KEYS: {
    SETTINGS: 'simar_portfolio_settings',
    PROFILE: 'simar_portfolio_profile',
    SKILLS: 'simar_portfolio_skills',
    PROJECTS: 'simar_portfolio_projects',
  },

  // Retro Vintage Vibrant Defaults
  DEFAULT_SETTINGS: {
    site_title: 'Simar Karira — Graphic Designer & Visual Studio',
    meta_description: 'Simar Karira — Graphic designer focused on visual identity, posters, digital design, and creative visual experiences.',
    hero_title: 'SIMAR\nKARIRA',
    hero_subtitle: 'GRAPHIC DESIGNER',
    hero_intro: 'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences.',
    accent_color: '#ff5722', // Retro Tangerine Sunset
  },

  DEFAULT_PROFILE: {
    full_name: 'Simar Karira',
    role_title: 'Graphic Designer',
    about_text: 'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences. Merging vintage printshop nostalgia with contemporary digital precision.',
    design_philosophy: 'Typography, vibrant color, and generous space create lasting visual resonance. Every curve and grid line carries distinct artistic intent.',
    tools: 'Figma, Adobe Illustrator, Adobe Photoshop, InDesign, After Effects, Risograph Printing',
    email: '',
    instagram: '',
    linkedin: '',
    behance: '',
    dribbble: '',
    other_socials: []
  },

  DEFAULT_SKILLS: [
    { id: '1', name: 'Graphic Design', category: 'Core', display_order: 1 },
    { id: '2', name: 'Poster Design', category: 'Print & Screen', display_order: 2 },
    { id: '3', name: 'Branding & Identity', category: 'Core', display_order: 3 },
    { id: '4', name: 'Social Media Design', category: 'Digital', display_order: 4 },
    { id: '5', name: 'UI/UX Design', category: 'Digital', display_order: 5 },
    { id: '6', name: 'Vintage Typography', category: 'Discipline', display_order: 6 },
    { id: '7', name: 'Photo & Print Editing', category: 'Craft', display_order: 7 }
  ]
};

window.CONFIG = CONFIG;
