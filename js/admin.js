/**
 * Simar Graphic Designer Portfolio - Admin Dashboard Controller
 * Full CRUD for Projects, Images, Skills, Profile, Settings, and Supabase Auth.
 */

let currentAdminUser = null;
let currentProjectsList = [];
let currentSkillsList = [];

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Check Authentication Status
  await checkAuth();

  // 2. Setup Tab Navigation
  setupTabs();

  // 3. Load All Data into Forms
  await loadAllAdminData();

  // 4. Setup Event Listeners
  setupFormListeners();

  // 5. Check Supabase DB status
  await checkDatabaseStatus();
});

/**
 * Check if admin is authenticated
 */
async function checkAuth() {
  const overlay = document.getElementById('admin-auth-overlay');
  const user = await window.DB.getCurrentUser();

  if (user) {
    currentAdminUser = user;
    if (overlay) overlay.style.display = 'none';
    const emailBadge = document.getElementById('admin-user-email');
    if (emailBadge) emailBadge.textContent = user.email || 'Admin';
  } else {
    if (overlay) overlay.style.display = 'flex';
  }
}

/**
 * Handle Tab Switching
 */
function setupTabs() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });
}

/**
 * Load all settings, profile, skills, and projects into the admin panel
 */
async function loadAllAdminData() {
  try {
    // 1. Settings
    const settings = await window.DB.getSettings();
    if (settings) {
      setVal('setting-site-title', settings.site_title);
      setVal('setting-meta-desc', settings.meta_description);
      setVal('setting-hero-title', settings.hero_title);
      setVal('setting-hero-subtitle', settings.hero_subtitle);
      setVal('setting-hero-intro', settings.hero_intro);
      setVal('setting-accent-color', settings.accent_color || '#d4ff00');
      setVal('color-hex-input', settings.accent_color || '#d4ff00');
    }

    // 2. Profile & About
    const profile = await window.DB.getProfile();
    if (profile) {
      setVal('profile-full-name', profile.full_name);
      setVal('profile-role-title', profile.role_title);
      setVal('profile-about-text', profile.about_text);
      setVal('profile-philosophy', profile.design_philosophy);
      setVal('profile-tools', profile.tools);
      setVal('contact-email', profile.email);
      setVal('contact-instagram', profile.instagram);
      setVal('contact-linkedin', profile.linkedin);
      setVal('contact-behance', profile.behance);
      setVal('contact-dribbble', profile.dribbble);
    }

    // 3. Skills
    await loadSkillsList();

    // 4. Projects
    await loadProjectsList();
  } catch (err) {
    console.error('Error loading admin data:', err);
    showToast('Failed to load some data. Please check connection.', true);
  }
}

/**
 * Load Skills into Admin List
 */
async function loadSkillsList() {
  currentSkillsList = await window.DB.getSkills();
  const listEl = document.getElementById('admin-skills-list');
  if (!listEl) return;

  if (currentSkillsList.length === 0) {
    listEl.innerHTML = `<p style="color: var(--admin-text-muted); font-size: 0.9rem;">No skills added yet.</p>`;
    return;
  }

  listEl.innerHTML = currentSkillsList.map((skill, idx) => `
    <div class="skill-admin-row" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--admin-border); background: var(--admin-card); border-radius: 4px; margin-bottom: 8px;">
      <div>
        <strong style="color: var(--admin-text);">${escapeHtml(skill.name)}</strong>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--admin-accent); margin-left: 10px;">${escapeHtml(skill.category || 'Service')}</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn-action-small" onclick="moveSkill(${idx}, -1)">▲</button>
        <button type="button" class="btn-action-small" onclick="moveSkill(${idx}, 1)">▼</button>
        <button type="button" class="btn-action-small danger" onclick="removeSkill(${idx})">Delete</button>
      </div>
    </div>
  `).join('');
}

/**
 * Load Projects into Admin Table
 */
async function loadProjectsList() {
  currentProjectsList = await window.DB.getProjects(false); // get all including drafts
  const tbody = document.getElementById('admin-projects-tbody');
  const countBadge = document.getElementById('projects-count');
  if (countBadge) countBadge.textContent = `${currentProjectsList.length} total`;
  if (!tbody) return;

  if (currentProjectsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
          No projects added yet. Click "+ Add Project" to upload Simar's first real project!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = currentProjectsList.map((proj, idx) => `
    <tr>
      <td>
        <img src="${escapeHtml(proj.cover_image_url)}" alt="${escapeHtml(proj.title)}" class="project-row-thumb" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'50\\' height=\\'50\\' viewBox=\\'0 0 50 50\\'><rect fill=\\'%23333\\' width=\\'50\\' height=\\'50\\'/></svg>'">
      </td>
      <td>
        <strong style="display: block; color: var(--admin-text);">${escapeHtml(proj.title)}</strong>
        <span style="font-size: 0.8rem; color: var(--admin-text-dim);">${escapeHtml(proj.slug)}</span>
      </td>
      <td><span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--admin-accent);">${escapeHtml(proj.category)}</span></td>
      <td>${escapeHtml(proj.year || '-')}</td>
      <td>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; padding: 4px 8px; border-radius: 3px; ${proj.is_published !== false ? 'background: rgba(46, 213, 115, 0.2); color: #2ed573;' : 'background: rgba(255, 71, 87, 0.2); color: #ff4757;'}">
          ${proj.is_published !== false ? 'Published' : 'Hidden'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-action-small" onclick="editProject('${proj.id}')">Edit</button>
          <button class="btn-action-small" onclick="togglePublishProject('${proj.id}')">${proj.is_published !== false ? 'Hide' : 'Show'}</button>
          <button class="btn-action-small danger" onclick="deleteProjectPrompt('${proj.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Setup All Form Listeners
 */
function setupFormListeners() {
  // 1. Auth Form (Login / Sign Up)
  const authForm = document.getElementById('admin-auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value.trim();
      const isSignUp = authForm.getAttribute('data-mode') === 'signup';

      if (!email || !password) {
        showToast('Please enter both email and password.', true);
        return;
      }

      const submitBtn = authForm.querySelector('.btn-admin-submit');
      submitBtn.textContent = 'Authenticating...';
      submitBtn.disabled = true;

      try {
        let result;
        if (isSignUp) {
          result = await window.DB.signUp(email, password);
        } else {
          result = await window.DB.signIn(email, password);
        }

        if (result.success) {
          showToast(isSignUp ? 'Account created! Logging in...' : 'Welcome back, Simar!');
          await checkAuth();
          await loadAllAdminData();
        } else {
          showToast(result.error || 'Authentication error', true);
        }
      } catch (err) {
        showToast(err.message || 'Login failed', true);
      } finally {
        submitBtn.textContent = isSignUp ? 'Sign Up' : 'Log In';
        submitBtn.disabled = false;
      }
    });
  }

  // Toggle auth mode
  const authSwitch = document.getElementById('auth-switch-link');
  if (authSwitch) {
    authSwitch.addEventListener('click', () => {
      const form = document.getElementById('admin-auth-form');
      const title = document.getElementById('auth-card-title');
      const submit = form.querySelector('.btn-admin-submit');
      const currentMode = form.getAttribute('data-mode') || 'login';

      if (currentMode === 'login') {
        form.setAttribute('data-mode', 'signup');
        title.textContent = 'CREATE ADMIN ACCOUNT';
        submit.textContent = 'Sign Up';
        authSwitch.textContent = 'Already have an account? Log in';
      } else {
        form.setAttribute('data-mode', 'login');
        title.textContent = 'ADMIN PORTAL LOGIN';
        submit.textContent = 'Log In';
        authSwitch.textContent = 'Need to create an account? Sign up';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await window.DB.signOut();
      window.location.reload();
    });
  }

  // 2. Hero & Settings Form
  const heroForm = document.getElementById('admin-hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await window.DB.updateSettings({
        hero_title: getVal('setting-hero-title'),
        hero_subtitle: getVal('setting-hero-subtitle'),
        hero_intro: getVal('setting-hero-intro')
      });
      showToast('Hero section updated successfully!');
    });
  }

  // 3. Profile & About Form
  const profileForm = document.getElementById('admin-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await window.DB.updateProfile({
        full_name: getVal('profile-full-name'),
        role_title: getVal('profile-role-title'),
        about_text: getVal('profile-about-text'),
        design_philosophy: getVal('profile-philosophy'),
        tools: getVal('profile-tools')
      });
      showToast('Profile & About section updated!');
    });
  }

  // 4. Contact & Socials Form
  const contactForm = document.getElementById('admin-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await window.DB.updateProfile({
        email: getVal('contact-email'),
        instagram: getVal('contact-instagram'),
        linkedin: getVal('contact-linkedin'),
        behance: getVal('contact-behance'),
        dribbble: getVal('contact-dribbble')
      });
      showToast('Contact info & Socials saved!');
    });
  }

  // 5. Site Settings & Accent Color Form
  const settingsForm = document.getElementById('admin-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const accent = getVal('setting-accent-color');
      await window.DB.updateSettings({
        site_title: getVal('setting-site-title'),
        meta_description: getVal('setting-meta-desc'),
        accent_color: accent
      });
      // Update admin UI theme variable live
      document.documentElement.style.setProperty('--admin-accent', accent);
      showToast('Site settings & accent color saved!');
    });
  }

  // Accent Color Picker & Presets
  const colorInput = document.getElementById('setting-accent-color');
  const hexInput = document.getElementById('color-hex-input');
  if (colorInput && hexInput) {
    colorInput.addEventListener('input', (e) => {
      hexInput.value = e.target.value;
      document.documentElement.style.setProperty('--admin-accent', e.target.value);
    });
    hexInput.addEventListener('input', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorInput.value = e.target.value;
        document.documentElement.style.setProperty('--admin-accent', e.target.value);
      }
    });
  }

  document.querySelectorAll('.color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      if (colorInput) colorInput.value = color;
      if (hexInput) hexInput.value = color;
      document.documentElement.style.setProperty('--admin-accent', color);
    });
  });

  // 6. Add Skill Form
  const addSkillForm = document.getElementById('admin-add-skill-form');
  if (addSkillForm) {
    addSkillForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = getVal('new-skill-name').trim();
      const category = getVal('new-skill-category').trim() || 'Service';
      if (!name) return;

      currentSkillsList.push({ name, category, display_order: currentSkillsList.length + 1 });
      await window.DB.saveSkills(currentSkillsList);
      document.getElementById('new-skill-name').value = '';
      await loadSkillsList();
      showToast(`Added skill: "${name}"`);
    });
  }

  // 7. Project Modal Form (Add / Edit)
  const projectForm = document.getElementById('project-edit-form');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSaveProject();
    });
  }

  // Image Upload Listeners (Cover & Gallery)
  const coverFileInput = document.getElementById('project-cover-file');
  if (coverFileInput) {
    coverFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        showToast('Uploading cover image to Supabase...');
        const url = await window.DB.uploadImageFile(file);
        if (url) {
          setVal('project-cover-url', url);
          const preview = document.getElementById('cover-preview-img');
          if (preview) {
            preview.src = url;
            preview.style.display = 'block';
          }
          showToast('Cover image uploaded!');
        }
      }
    });
  }

  // Additional Gallery Images Upload
  const galleryFileInput = document.getElementById('project-gallery-file');
  if (galleryFileInput) {
    galleryFileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        showToast(`Uploading ${files.length} gallery image(s)...`);
        const galleryInput = document.getElementById('project-gallery-urls');
        const existing = galleryInput.value.split('\n').filter(Boolean);

        for (const file of files) {
          const url = await window.DB.uploadImageFile(file);
          if (url) existing.push(url);
        }

        galleryInput.value = existing.join('\n');
        showToast('Gallery images uploaded!');
      }
    });
  }
}

/**
 * Save Project from Modal
 */
async function handleSaveProject() {
  const title = getVal('project-title').trim();
  const category = getVal('project-category').trim();
  const coverUrl = getVal('project-cover-url').trim();
  const shortDesc = getVal('project-short-desc').trim();

  if (!title || !category || !coverUrl || !shortDesc) {
    showToast('Please fill in Title, Category, Short Description, and Cover Image.', true);
    return;
  }

  let slug = getVal('project-slug').trim();
  if (!slug) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const galleryUrls = getVal('project-gallery-urls')
    .split('\n')
    .map(u => u.trim())
    .filter(Boolean)
    .map(url => ({ url, caption: '' }));

  const id = getVal('project-edit-id');

  const projectData = {
    title,
    slug,
    category,
    year: getVal('project-year').trim() || String(new Date().getFullYear()),
    client: getVal('project-client').trim(),
    short_description: shortDesc,
    full_description: getVal('project-full-desc').trim(),
    design_process: getVal('project-design-process').trim(),
    cover_image_url: coverUrl,
    tools_used: getVal('project-tools').trim(),
    external_link: getVal('project-external-link').trim(),
    is_published: document.getElementById('project-is-published').checked,
    gallery: galleryUrls
  };

  if (id) projectData.id = id;

  showToast('Saving project to Supabase...');
  await window.DB.saveProject(projectData);
  closeProjectModal();
  await loadProjectsList();
  showToast(`Project "${title}" saved successfully!`);
}

/**
 * Project Modal Open/Close
 */
window.openAddProjectModal = function() {
  document.getElementById('project-modal-title').textContent = 'ADD NEW PROJECT';
  document.getElementById('project-edit-form').reset();
  setVal('project-edit-id', '');
  setVal('project-year', new Date().getFullYear());
  document.getElementById('project-is-published').checked = true;
  const preview = document.getElementById('cover-preview-img');
  if (preview) preview.style.display = 'none';
  document.getElementById('project-modal').style.display = 'flex';
};

window.editProject = function(id) {
  const p = currentProjectsList.find(item => item.id === id);
  if (!p) return;

  document.getElementById('project-modal-title').textContent = 'EDIT PROJECT';
  setVal('project-edit-id', p.id);
  setVal('project-title', p.title);
  setVal('project-slug', p.slug);
  setVal('project-category', p.category);
  setVal('project-year', p.year || '');
  setVal('project-client', p.client || '');
  setVal('project-short-desc', p.short_description || '');
  setVal('project-full-desc', p.full_description || '');
  setVal('project-design-process', p.design_process || '');
  setVal('project-cover-url', p.cover_image_url || '');
  setVal('project-tools', p.tools_used || '');
  setVal('project-external-link', p.external_link || '');
  document.getElementById('project-is-published').checked = p.is_published !== false;

  const gallery = p.gallery || p.project_images || [];
  const galleryUrls = gallery.map(g => typeof g === 'string' ? g : g.image_url || g.url).filter(Boolean);
  setVal('project-gallery-urls', galleryUrls.join('\n'));

  const preview = document.getElementById('cover-preview-img');
  if (preview && p.cover_image_url) {
    preview.src = p.cover_image_url;
    preview.style.display = 'block';
  }

  document.getElementById('project-modal').style.display = 'flex';
};

window.closeProjectModal = function() {
  document.getElementById('project-modal').style.display = 'none';
};

window.deleteProjectPrompt = async function(id) {
  const p = currentProjectsList.find(item => item.id === id);
  const name = p ? `"${p.title}"` : 'this project';
  if (confirm(`Are you sure you want to permanently delete ${name}?`)) {
    await window.DB.deleteProject(id);
    await loadProjectsList();
    showToast(`Deleted ${name}`);
  }
};

window.togglePublishProject = async function(id) {
  const p = currentProjectsList.find(item => item.id === id);
  if (p) {
    p.is_published = !p.is_published;
    await window.DB.saveProject(p);
    await loadProjectsList();
    showToast(`Project is now ${p.is_published ? 'Visible' : 'Hidden'}`);
  }
};

/**
 * Skills Reordering & Deleting
 */
window.moveSkill = async function(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= currentSkillsList.length) return;
  const item = currentSkillsList.splice(index, 1)[0];
  currentSkillsList.splice(target, 0, item);
  await window.DB.saveSkills(currentSkillsList);
  await loadSkillsList();
};

window.removeSkill = async function(index) {
  const skill = currentSkillsList[index];
  if (confirm(`Remove skill "${skill.name}"?`)) {
    currentSkillsList.splice(index, 1);
    await window.DB.saveSkills(currentSkillsList);
    await loadSkillsList();
    showToast(`Removed "${skill.name}"`);
  }
};

/**
 * Check Supabase Database Status & Setup Assistant
 */
async function checkDatabaseStatus() {
  const statusEl = document.getElementById('db-connection-status');
  if (!statusEl) return;

  const status = await window.DB.checkTablesStatus();

  if (status.connected && status.tablesReady) {
    statusEl.className = 'status-banner success';
    statusEl.innerHTML = `
      <div>
        <strong>✓ SUPABASE CONNECTED & READY</strong>
        <p style="margin: 4px 0 0; font-size: 0.85rem;">All database tables and storage policies are active in your project.</p>
      </div>
    `;
  } else if (status.connected && !status.tablesReady) {
    statusEl.className = 'status-banner warning';
    statusEl.innerHTML = `
      <div>
        <strong>⚠️ SUPABASE CONNECTED — SQL TABLES SETUP REQUIRED</strong>
        <p style="margin: 4px 0 0; font-size: 0.85rem;">
          Your Supabase keys are working! Run the SQL migration script in your Supabase SQL Editor to activate PostgreSQL tables.
          (The admin panel is currently saving to local cache so you can test right away without loss!)
        </p>
      </div>
      <button type="button" class="btn-primary" onclick="copySqlSchema()" style="font-size: 0.75rem; padding: 10px 16px;">
        Copy SQL Schema
      </button>
    `;
  } else {
    statusEl.className = 'status-banner warning';
    statusEl.innerHTML = `
      <div>
        <strong>⚠️ OFFLINE / LOCAL MODE</strong>
        <p style="margin: 4px 0 0; font-size: 0.85rem;">Supabase is connecting. Local persistence is active.</p>
      </div>
    `;
  }
}

/**
 * Copy SQL Schema to clipboard
 */
window.copySqlSchema = async function() {
  try {
    const resp = await fetch('supabase_schema.sql');
    const sql = await resp.text();
    await navigator.clipboard.writeText(sql);
    showToast('SQL Schema copied to clipboard! Paste it into Supabase SQL Editor.');
  } catch (e) {
    showToast('Open supabase_schema.sql from the project folder and paste into Supabase.', true);
  }
};

/**
 * Helpers
 */
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}

function showToast(msg, isError = false) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  if (isError) {
    toast.style.backgroundColor = 'var(--admin-danger)';
    toast.style.color = '#fff';
  }
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
