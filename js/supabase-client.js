/**
 * Simar Portfolio - Supabase Data Layer & Storage Manager
 * Seamlessly talks to Supabase Database, Auth, and Storage.
 * Includes graceful fallback and local synchronization if tables are pending migration.
 */

class SupabaseService {
  constructor() {
    this.client = null;
    this.supabaseAvailable = false;
    this.tablesAvailable = false;
    this.init();
  }

  init() {
    try {
      if (window.supabase && window.CONFIG) {
        // Try initialize with publishable key or legacy key
        this.client = window.supabase.createClient(
          window.CONFIG.SUPABASE_URL,
          window.CONFIG.SUPABASE_ANON_KEY || window.CONFIG.SUPABASE_LEGACY_KEY,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
            }
          }
        );
        this.supabaseAvailable = true;
      }
    } catch (err) {
      console.warn('Supabase client initialization warning:', err);
    }
  }

  // Check if tables are ready in Supabase
  async checkTablesStatus() {
    if (!this.client) return { connected: false, tablesReady: false };
    try {
      const { data, error } = await this.client
        .from('site_settings')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
          this.tablesAvailable = false;
          return { connected: true, tablesReady: false, message: 'Supabase connected, but SQL tables not yet created.' };
        }
        return { connected: true, tablesReady: false, error: error.message };
      }

      this.tablesAvailable = true;
      return { connected: true, tablesReady: true };
    } catch (err) {
      return { connected: false, tablesReady: false, error: err.message };
    }
  }

  // --- SITE SETTINGS ---
  async getSettings() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          localStorage.setItem(window.CONFIG.CACHE_KEYS.SETTINGS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Error fetching settings from Supabase, using local cache:', e);
      }
    }

    const cached = localStorage.getItem(window.CONFIG.CACHE_KEYS.SETTINGS);
    return cached ? JSON.parse(cached) : window.CONFIG.DEFAULT_SETTINGS;
  }

  async updateSettings(settingsData) {
    // Apply locally immediately
    const updated = {
      ...window.CONFIG.DEFAULT_SETTINGS,
      ...settingsData,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(window.CONFIG.CACHE_KEYS.SETTINGS, JSON.stringify(updated));

    if (this.client) {
      try {
        // Check if row exists
        const { data: existing } = await this.client.from('site_settings').select('id').limit(1).maybeSingle();
        if (existing) {
          const { error } = await this.client
            .from('site_settings')
            .update(settingsData)
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await this.client
            .from('site_settings')
            .insert([settingsData]);
          if (error) throw error;
        }
      } catch (err) {
        console.warn('Supabase updateSettings notice:', err.message);
      }
    }
    return updated;
  }

  // --- PROFILE & ABOUT ---
  async getProfile() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('profile')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          localStorage.setItem(window.CONFIG.CACHE_KEYS.PROFILE, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Error fetching profile from Supabase, using cache:', e);
      }
    }

    const cached = localStorage.getItem(window.CONFIG.CACHE_KEYS.PROFILE);
    return cached ? JSON.parse(cached) : window.CONFIG.DEFAULT_PROFILE;
  }

  async updateProfile(profileData) {
    const updated = {
      ...window.CONFIG.DEFAULT_PROFILE,
      ...profileData,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(window.CONFIG.CACHE_KEYS.PROFILE, JSON.stringify(updated));

    if (this.client) {
      try {
        const { data: existing } = await this.client.from('profile').select('id').limit(1).maybeSingle();
        if (existing) {
          const { error } = await this.client
            .from('profile')
            .update(profileData)
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await this.client
            .from('profile')
            .insert([profileData]);
          if (error) throw error;
        }
      } catch (err) {
        console.warn('Supabase updateProfile notice:', err.message);
      }
    }
    return updated;
  }

  // --- SKILLS & SERVICES ---
  async getSkills() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('skills')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          localStorage.setItem(window.CONFIG.CACHE_KEYS.SKILLS, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Error fetching skills from Supabase:', e);
      }
    }

    const cached = localStorage.getItem(window.CONFIG.CACHE_KEYS.SKILLS);
    return cached ? JSON.parse(cached) : window.CONFIG.DEFAULT_SKILLS;
  }

  async saveSkills(skillsArray) {
    localStorage.setItem(window.CONFIG.CACHE_KEYS.SKILLS, JSON.stringify(skillsArray));

    if (this.client) {
      try {
        // Replace skills in Supabase
        await this.client.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const formatted = skillsArray.map((s, idx) => ({
          name: s.name,
          category: s.category || 'Core',
          display_order: idx + 1
        }));
        if (formatted.length > 0) {
          await this.client.from('skills').insert(formatted);
        }
      } catch (err) {
        console.warn('Supabase saveSkills notice:', err.message);
      }
    }
    return skillsArray;
  }

  // --- PROJECTS ---
  async getProjects(publishedOnly = true) {
    if (this.client) {
      try {
        let query = this.client
          .from('projects')
          .select('*, project_images(*)')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (publishedOnly) {
          query = query.eq('is_published', true);
        }

        const { data, error } = await query;
        if (!error && data) {
          if (!publishedOnly) {
            localStorage.setItem(window.CONFIG.CACHE_KEYS.PROJECTS, JSON.stringify(data));
          }
          return data;
        }
      } catch (e) {
        console.warn('Error fetching projects from Supabase:', e);
      }
    }

    const cached = localStorage.getItem(window.CONFIG.CACHE_KEYS.PROJECTS);
    const list = cached ? JSON.parse(cached) : [];
    return publishedOnly ? list.filter(p => p.is_published !== false) : list;
  }

  async getProjectByIdOrSlug(idOrSlug) {
    if (!idOrSlug) return null;
    const all = await this.getProjects(false);
    return all.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  async saveProject(project) {
    const all = await this.getProjects(false);
    let updatedList;
    let savedItem;

    if (project.id) {
      // Edit
      savedItem = {
        ...project,
        updated_at: new Date().toISOString()
      };
      updatedList = all.map(p => p.id === project.id ? savedItem : p);
    } else {
      // Create new
      savedItem = {
        ...project,
        id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: all.length + 1
      };
      updatedList = [savedItem, ...all];
    }

    localStorage.setItem(window.CONFIG.CACHE_KEYS.PROJECTS, JSON.stringify(updatedList));

    if (this.client) {
      try {
        const payload = {
          title: savedItem.title,
          slug: savedItem.slug,
          category: savedItem.category,
          year: savedItem.year,
          client: savedItem.client || '',
          short_description: savedItem.short_description,
          full_description: savedItem.full_description || '',
          design_process: savedItem.design_process || '',
          cover_image_url: savedItem.cover_image_url,
          tools_used: savedItem.tools_used || '',
          external_link: savedItem.external_link || '',
          is_published: savedItem.is_published !== false,
          display_order: savedItem.display_order || 0
        };

        if (project.id && !project.id.startsWith('proj_')) {
          await this.client.from('projects').update(payload).eq('id', project.id);
        } else {
          const { data, error } = await this.client.from('projects').insert([payload]).select().single();
          if (!error && data) {
            savedItem.id = data.id;
            // Also save gallery images if any
            if (project.gallery && project.gallery.length > 0) {
              const galleryRows = project.gallery.map((g, idx) => ({
                project_id: data.id,
                image_url: typeof g === 'string' ? g : g.url,
                caption: g.caption || '',
                display_order: idx + 1
              }));
              await this.client.from('project_images').insert(galleryRows);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase saveProject notice:', err.message);
      }
    }

    return savedItem;
  }

  async deleteProject(id) {
    const all = await this.getProjects(false);
    const updatedList = all.filter(p => p.id !== id);
    localStorage.setItem(window.CONFIG.CACHE_KEYS.PROJECTS, JSON.stringify(updatedList));

    if (this.client) {
      try {
        if (!id.startsWith('proj_')) {
          await this.client.from('projects').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase deleteProject notice:', err.message);
      }
    }
    return true;
  }

  // --- IMAGE UPLOAD HELPER ---
  async uploadImageFile(file) {
    if (!file) return null;

    // 1. Try Supabase Storage
    if (this.client) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await this.client.storage
          .from(window.CONFIG.STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!error && data) {
          const { data: publicData } = this.client.storage
            .from(window.CONFIG.STORAGE_BUCKET)
            .getPublicUrl(filePath);

          if (publicData?.publicUrl) {
            return publicData.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload notice:', error?.message);
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback triggered:', err.message);
      }
    }

    // 2. High-speed local Base64/DataURL converter fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // --- AUTHENTICATION ---
  async getCurrentUser() {
    if (!this.client) {
      // Local session check
      const localAuth = localStorage.getItem('simar_admin_session');
      return localAuth ? JSON.parse(localAuth) : null;
    }

    try {
      const { data: { session } } = await this.client.auth.getSession();
      if (session?.user) {
        return session.user;
      }
    } catch (e) {
      console.warn('Auth getSession notice:', e);
    }

    const localAuth = localStorage.getItem('simar_admin_session');
    return localAuth ? JSON.parse(localAuth) : null;
  }

  async signIn(email, password) {
    if (this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data?.user) {
        localStorage.setItem('simar_admin_session', JSON.stringify({ email: data.user.email, id: data.user.id }));
        return { success: true, user: data.user };
      }
      if (error) {
        // Return clear error message
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'Supabase client not initialized' };
  }

  async signUp(email, password) {
    if (this.client) {
      const { data, error } = await this.client.auth.signUp({
        email,
        password
      });

      if (!error && data?.user) {
        return { success: true, user: data.user, session: data.session };
      }
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Supabase client not initialized' };
  }

  async signOut() {
    if (this.client) {
      try {
        await this.client.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('simar_admin_session');
    return true;
  }
}

// Global instance
window.DB = new SupabaseService();
