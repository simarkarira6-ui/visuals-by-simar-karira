/**
 * Simar Graphic Designer Portfolio - Client Logic
 * Handles real-time content hydration from Supabase, dynamic rendering,
 * category filtering, smooth navigation, and interaction states.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Load Site Settings & Apply Accent Color
  await loadAndApplySettings();

  // 3. Load Profile & About
  await loadProfile();

  // 4. Load Skills & Services
  await loadSkills();

  // 5. Load Projects & Render Grid (strictly NO dummy projects!)
  await loadProjects();

  // 6. Setup Interactive Handlers (Scroll, Copy Email, Mobile Nav)
  setupInteractions();
});

/**
 * Loads Settings and dynamically updates Hero text & Accent Color
 */
async function loadAndApplySettings() {
  try {
    const settings = await window.DB.getSettings();
    if (!settings) return;

    // Apply Accent Color dynamically
    if (settings.accent_color) {
      document.documentElement.style.setProperty('--accent-color', settings.accent_color);
      // Auto compute high contrast text color for accent button
      const hex = settings.accent_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) || 0;
      const g = parseInt(hex.substr(2, 2), 16) || 0;
      const b = parseInt(hex.substr(4, 2), 16) || 0;
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      const contrast = (yiq >= 128) ? '#000000' : '#ffffff';
      document.documentElement.style.setProperty('--accent-contrast', contrast);
    }

    // Hero Title & Subtitle
    const heroTitleEl = document.getElementById('hero-title');
    if (heroTitleEl && settings.hero_title) {
      heroTitleEl.innerHTML = escapeHtml(settings.hero_title).replace(/\n/g, '<br>');
    }

    const heroSubtitleEl = document.getElementById('hero-subtitle');
    if (heroSubtitleEl && settings.hero_subtitle) {
      heroSubtitleEl.textContent = settings.hero_subtitle;
    }

    // Hero Intro
    const heroIntroEl = document.getElementById('hero-intro');
    if (heroIntroEl && settings.hero_intro) {
      heroIntroEl.textContent = settings.hero_intro;
    }

    // Page Title & Meta
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

/**
 * Loads Profile information (About, Philosophy, Tools, Contact Info)
 * Conditionally displays sections only when content is provided!
 */
async function loadProfile() {
  try {
    const profile = await window.DB.getProfile();
    if (!profile) return;

    // About Narrative
    const aboutNarrativeEl = document.getElementById('about-narrative');
    const aboutSection = document.getElementById('about');
    if (aboutNarrativeEl) {
      if (profile.about_text && profile.about_text.trim() !== '') {
        aboutNarrativeEl.textContent = profile.about_text;
      } else {
        aboutNarrativeEl.parentElement.style.display = 'none';
      }
    }

    // Design Philosophy
    const philosophyBlock = document.getElementById('philosophy-block');
    const philosophyText = document.getElementById('philosophy-text');
    if (philosophyBlock && philosophyText) {
      if (profile.design_philosophy && profile.design_philosophy.trim() !== '') {
        philosophyText.textContent = `"${profile.design_philosophy}"`;
        philosophyBlock.style.display = 'block';
      } else {
        philosophyBlock.style.display = 'none';
      }
    }

    // Tools & Software Chips
    const toolsBlock = document.getElementById('tools-block');
    const toolsChipsContainer = document.getElementById('tools-chips');
    if (toolsBlock && toolsChipsContainer) {
      if (profile.tools && profile.tools.trim() !== '') {
        const toolsList = profile.tools.split(',').map(t => t.trim()).filter(Boolean);
        toolsChipsContainer.innerHTML = toolsList.map(t => `<span class="tool-chip">${t}</span>`).join('');
        toolsBlock.style.display = 'block';
      } else {
        toolsBlock.style.display = 'none';
      }
    }

    // Contact Email
    const emailDisplay = document.getElementById('contact-email-link');
    const emailSection = document.getElementById('contact-email-block');
    if (emailDisplay) {
      if (profile.email && profile.email.trim() !== '') {
        emailDisplay.textContent = profile.email;
        emailDisplay.href = `mailto:${profile.email}`;
        if (emailSection) emailSection.style.display = 'block';
      } else {
        // If no email configured yet, show a clean prompt or hide
        if (emailSection) emailSection.style.display = 'none';
      }
    }

    // Social Links
    const socialList = document.getElementById('social-links-list');
    if (socialList) {
      const links = [];
      if (profile.instagram) links.push({ name: 'Instagram', url: profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace('@', '')}` });
      if (profile.linkedin) links.push({ name: 'LinkedIn', url: profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}` });
      if (profile.behance) links.push({ name: 'Behance', url: profile.behance.startsWith('http') ? profile.behance : `https://behance.net/${profile.behance}` });
      if (profile.dribbble) links.push({ name: 'Dribbble', url: profile.dribbble.startsWith('http') ? profile.dribbble : `https://dribbble.com/${profile.dribbble}` });

      if (links.length > 0) {
        socialList.innerHTML = links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="social-link-item">
            <span>${l.name}</span>
            <span class="social-arrow">↗</span>
          </a>
        `).join('');
      } else {
        socialList.innerHTML = `<p class="mono" style="color: var(--text-dim); padding-top: 10px;">Social links will appear once added in Admin.</p>`;
      }
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

/**
 * Loads Skills / Services dynamically
 */
async function loadSkills() {
  try {
    const skills = await window.DB.getSkills();
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;

    if (!skills || skills.length === 0) {
      document.getElementById('skills').style.display = 'none';
      return;
    }

    skillsContainer.innerHTML = skills.map((skill, idx) => `
      <div class="skill-card">
        <div class="skill-card-top">
          <span class="skill-index">${String(idx + 1).padStart(2, '0')}</span>
          <span class="skill-cat">${escapeHtml(skill.category || 'Service')}</span>
        </div>
        <h3 class="skill-name">${escapeHtml(skill.name)}</h3>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load skills:', err);
  }
}

/**
 * Loads Real Portfolio Projects
 * Strictly enforces NO dummy projects. If empty, renders the elegant coming-soon state.
 */
async function loadProjects() {
  try {
    const projects = await window.DB.getProjects(true); // only published
    const gridContainer = document.getElementById('projects-grid');
    const filterContainer = document.getElementById('filter-group');
    if (!gridContainer) return;

    // EMPTY STATE: If no projects uploaded yet
    if (!projects || projects.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-portfolio-editorial">
          <div class="empty-graphic-icon">★</div>
          <h3 class="empty-title">Selected work coming soon.</h3>
          <p class="empty-desc">
            Fresh visual identities, screenprints, and editorial case studies are currently being curated and documented in the studio archive.
          </p>
          <span class="empty-meta-tag">[ STUDIO ARCHIVE • WORK IN PROGRESS ]</span>
        </div>
      `;
      if (filterContainer) filterContainer.style.display = 'none';
      return;
    }

    // Populate Category Filters dynamically from actual projects
    if (filterContainer) {
      const categories = ['ALL', ...new Set(projects.map(p => (p.category || 'General').toUpperCase()))];
      filterContainer.innerHTML = categories.map((cat, i) => `
        <button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>
      `).join('');

      // Filter click listeners
      filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.getAttribute('data-cat');
          renderProjectCards(cat === 'ALL' ? projects : projects.filter(p => (p.category || 'General').toUpperCase() === cat));
        });
      });
    }

    renderProjectCards(projects);
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

function renderProjectCards(list) {
  const gridContainer = document.getElementById('projects-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = list.map(project => `
    <a href="project.html?id=${project.id || project.slug}" class="project-card">
      <div class="project-thumb-wrap">
        <img src="${escapeHtml(project.cover_image_url)}" alt="${escapeHtml(project.title)}" class="project-thumb" loading="lazy">
        <div class="project-overlay">
          <span class="view-case-btn">View Case Study ↗</span>
        </div>
      </div>
      <div class="project-info">
        <div class="project-meta">
          <span class="project-cat">${escapeHtml(project.category)}</span>
          <span class="project-year">${escapeHtml(project.year || '')}</span>
        </div>
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p class="project-desc-short">${escapeHtml(project.short_description || '')}</p>
      </div>
    </a>
  `).join('');
}

/**
 * Setup interactions: Copy email, Mobile nav, Smooth scroll
 */
function setupInteractions() {
  // Copy Email button
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const emailLink = document.getElementById('contact-email-link');
      if (emailLink && emailLink.textContent) {
        try {
          await navigator.clipboard.writeText(emailLink.textContent.trim());
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'COPIED!';
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 2000);
        } catch (e) {
          console.warn('Clipboard write failed:', e);
        }
      }
    });
  }

  // Mobile Menu Toggle
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Active navigation highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
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
