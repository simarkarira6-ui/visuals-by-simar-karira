/**
 * Simar Graphic Designer Portfolio - Client Logic
 * Highly Functional, Responsive, Fast & Visually Premium
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Dynamic Year in Footer
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

  // 5. Load Projects & Render Grid (Strictly zero dummy projects)
  await loadProjects();

  // 6. Setup Interactive Handlers (Mobile Nav, Smooth Scroll, Copy Email, Scrollspy)
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
      const hex = settings.accent_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) || 0;
      const g = parseInt(hex.substr(2, 2), 16) || 0;
      const b = parseInt(hex.substr(4, 2), 16) || 0;
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      const contrast = (yiq >= 128) ? '#000000' : '#ffffff';
      document.documentElement.style.setProperty('--accent-contrast', contrast);
    }

    // Hero Title
    const heroTitleEl = document.getElementById('hero-title');
    if (heroTitleEl && settings.hero_title) {
      heroTitleEl.innerHTML = escapeHtml(settings.hero_title).replace(/\n/g, '<br>');
    }

    // Hero Subtitle
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
    if (aboutNarrativeEl) {
      if (profile.about_text && profile.about_text.trim() !== '') {
        aboutNarrativeEl.textContent = profile.about_text;
      } else {
        const parentCard = aboutNarrativeEl.closest('.about-narrative-card');
        if (parentCard) parentCard.style.display = 'none';
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
        toolsChipsContainer.innerHTML = toolsList.map(t => `<span class="tool-chip">${escapeHtml(t)}</span>`).join('');
        toolsBlock.style.display = 'block';
      } else {
        toolsBlock.style.display = 'none';
      }
    }

    // Contact Email
    const emailDisplay = document.getElementById('contact-email-link');
    const emailSection = document.getElementById('contact-email-block');
    if (emailDisplay) {
      const activeEmail = profile.email && profile.email.trim() !== '' ? profile.email.trim() : 'hello@simardesign.com';
      emailDisplay.textContent = activeEmail;
      emailDisplay.href = `mailto:${activeEmail}`;
      if (emailSection) emailSection.style.display = 'block';
    }

    // Social Links
    const socialList = document.getElementById('social-links-list');
    if (socialList) {
      const links = [];
      if (profile.instagram) {
        const url = profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace('@', '')}`;
        links.push({ name: 'Instagram', url });
      }
      if (profile.linkedin) {
        const url = profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`;
        links.push({ name: 'LinkedIn', url });
      }
      if (profile.behance) {
        const url = profile.behance.startsWith('http') ? profile.behance : `https://behance.net/${profile.behance}`;
        links.push({ name: 'Behance', url });
      }
      if (profile.dribbble) {
        const url = profile.dribbble.startsWith('http') ? profile.dribbble : `https://dribbble.com/${profile.dribbble}`;
        links.push({ name: 'Dribbble', url });
      }

      if (links.length > 0) {
        socialList.innerHTML = links.map(l => `
          <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="social-link-item" aria-label="Visit Simar on ${escapeHtml(l.name)}">
            <span>${escapeHtml(l.name)}</span>
            <span class="social-arrow" aria-hidden="true">↗</span>
          </a>
        `).join('');
      } else {
        socialList.innerHTML = `
          <div class="social-link-item" style="pointer-events: none; opacity: 0.85;">
            <span>Instagram / Studio Archive</span>
            <span class="social-arrow">↗</span>
          </div>
          <div class="social-link-item" style="pointer-events: none; opacity: 0.85;">
            <span>Behance / Case Studies</span>
            <span class="social-arrow">↗</span>
          </div>
        `;
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
      const skillsSection = document.getElementById('skills');
      if (skillsSection) skillsSection.style.display = 'none';
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
          <div class="empty-graphic-icon" aria-hidden="true">★</div>
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
      filterContainer.style.display = 'flex';
      const categories = ['ALL', ...new Set(projects.map(p => (p.category || 'General').toUpperCase()))];
      filterContainer.innerHTML = categories.map((cat, i) => `
        <button type="button" class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${escapeHtml(cat)}" aria-label="Filter by ${escapeHtml(cat)}">${escapeHtml(cat)}</button>
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
    <a href="project.html?id=${encodeURIComponent(project.id || project.slug)}" class="project-card" aria-label="View case study: ${escapeHtml(project.title)}">
      <div class="project-thumb-wrap">
        <img src="${escapeHtml(project.cover_image_url)}" alt="${escapeHtml(project.title)}" class="project-thumb" loading="lazy">
        <div class="project-overlay" aria-hidden="true">
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
        <div class="project-card-footer">
          <span>Explore Case Study</span>
          <span class="project-card-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </a>
  `).join('');
}

/**
 * Setup interactions: Mobile menu, Smooth scrolling, Copy email, Scrollspy
 */
function setupInteractions() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  // Mobile menu open / close controller
  function closeMobileMenu() {
    if (navLinks && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      if (toggleBtn) {
        toggleBtn.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  }

  function openMobileMenu() {
    if (navLinks) {
      navLinks.classList.add('open');
      if (toggleBtn) {
        toggleBtn.classList.add('is-active');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('menu-open');
    }
  }

  function toggleMobileMenu() {
    if (navLinks && navLinks.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMobileMenu();
    });
  }

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Close mobile menu when clicking any nav link
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  // Copy Email button with feedback
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const emailLink = document.getElementById('contact-email-link');
      const emailText = emailLink && emailLink.textContent ? emailLink.textContent.trim() : 'hello@simardesign.com';

      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(emailText);
          copied = true;
        } catch (e) {
          copied = fallbackCopyText(emailText);
        }
      } else {
        copied = fallbackCopyText(emailText);
      }

      if (copied) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = 'COPIED! ✓';
        copyBtn.style.backgroundColor = 'var(--color-lime)';
        showRetroToast('Email address copied to clipboard!');
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.backgroundColor = '';
        }, 2200);
      }
    });
  }

  // Smooth Back to Top
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active navigation highlight on scroll (High performance Scrollspy)
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links .nav-link[href^="#"]');

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      const scrollPos = window.pageYOffset + 140;

      let currentId = '';
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = section.getAttribute('id');
        }
      });

      navItems.forEach(item => {
        item.classList.remove('active');
        if (currentId && item.getAttribute('href') === `#${currentId}`) {
          item.classList.add('active');
        }
      });
    }, 50);
  }, { passive: true });
}

/**
 * Fallback copy function for browsers without clipboard API
 */
function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {}
  document.body.removeChild(textArea);
  return successful;
}

/**
 * Floating Retro Toast Notification
 */
function showRetroToast(message, isSuccess = true) {
  let toast = document.querySelector('.retro-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'retro-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>★</span> <span>${escapeHtml(message)}</span>`;
  toast.classList.toggle('success', isSuccess);
  toast.classList.add('show');

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
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
