/**
 * Simar Graphic Designer Portfolio - Project Detail & Case Study Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Load Settings for Accent Color
  try {
    const settings = await window.DB.getSettings();
    if (settings?.accent_color) {
      document.documentElement.style.setProperty('--accent-color', settings.accent_color);
      const hex = settings.accent_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) || 0;
      const g = parseInt(hex.substr(2, 2), 16) || 0;
      const b = parseInt(hex.substr(4, 2), 16) || 0;
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      document.documentElement.style.setProperty('--accent-contrast', yiq >= 128 ? '#000000' : '#ffffff');
    }
  } catch (e) {}

  // 3. Extract Project ID from URL
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id') || params.get('slug');

  if (!projectId) {
    showErrorState('No project identifier provided in the URL.');
    return;
  }

  // 4. Fetch Project from DB
  try {
    const project = await window.DB.getProjectByIdOrSlug(projectId);
    if (!project) {
      showErrorState('The requested project could not be found or has not been published yet.');
      return;
    }

    renderProjectDetail(project);
  } catch (err) {
    console.error('Failed to load project details:', err);
    showErrorState('An error occurred while loading project details.');
  }
});

function renderProjectDetail(project) {
  document.title = `${project.title} — Simar Graphic Designer`;

  const container = document.getElementById('project-detail-content');
  if (!container) return;

  const toolsList = (project.tools_used || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  // Gallery images if available
  let galleryHtml = '';
  const gallery = project.gallery || project.project_images || [];
  if (gallery && gallery.length > 0) {
    galleryHtml = `
      <div class="project-gallery-section">
        <h3 class="gallery-title">PROJECT VISUALS & ARTIFACTS</h3>
        <div class="gallery-grid">
          ${gallery.map(img => {
            const url = typeof img === 'string' ? img : img.image_url || img.url;
            const caption = typeof img === 'object' ? img.caption : '';
            return `
              <div class="gallery-item-wrap" onclick="openLightbox('${escapeHtml(url)}')">
                <img src="${escapeHtml(url)}" alt="${escapeHtml(project.title)}" class="gallery-img" loading="lazy">
                ${caption ? `<span class="gallery-caption">${escapeHtml(caption)}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Top Meta & Title -->
    <header class="project-header">
      <div class="project-meta-top">
        <span class="project-cat-badge">${escapeHtml(project.category)}</span>
        <span class="project-year-badge">${escapeHtml(project.year || '')}</span>
      </div>
      <h1 class="project-headline">${escapeHtml(project.title)}</h1>
      <p class="project-lead">${escapeHtml(project.short_description || '')}</p>
    </header>

    <!-- Main Cover Hero -->
    <div class="project-hero-media">
      <img src="${escapeHtml(project.cover_image_url)}" alt="${escapeHtml(project.title)}" class="project-cover-full" onclick="openLightbox('${escapeHtml(project.cover_image_url)}')">
    </div>

    <!-- Case Study Body & Details -->
    <div class="project-details-grid">
      <!-- Left: Specifications -->
      <aside class="project-specs">
        <div class="spec-block">
          <span class="spec-label">CATEGORY</span>
          <p class="spec-val">${escapeHtml(project.category)}</p>
        </div>

        ${project.client ? `
          <div class="spec-block">
            <span class="spec-label">CLIENT / INITIATIVE</span>
            <p class="spec-val">${escapeHtml(project.client)}</p>
          </div>
        ` : ''}

        ${toolsList.length > 0 ? `
          <div class="spec-block">
            <span class="spec-label">TOOLS & DISCIPLINE</span>
            <div class="tools-chips">
              ${toolsList.map(t => `<span class="tool-chip">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${project.external_link ? `
          <div class="spec-block" style="margin-top: 20px;">
            <a href="${escapeHtml(project.external_link)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%;">
              Live Project ↗
            </a>
          </div>
        ` : ''}
      </aside>

      <!-- Right: Narrative & Design Process -->
      <article class="project-story">
        ${project.full_description ? `
          <div class="story-section">
            <h3 class="story-heading">OVERVIEW & CONCEPT</h3>
            <div class="story-body">${formatParagraphs(project.full_description)}</div>
          </div>
        ` : ''}

        ${project.design_process ? `
          <div class="story-section" style="margin-top: 40px;">
            <h3 class="story-heading">DESIGN PROCESS & EXECUTION</h3>
            <div class="story-body">${formatParagraphs(project.design_process)}</div>
          </div>
        ` : ''}
      </article>
    </div>

    <!-- Gallery Section -->
    ${galleryHtml}

    <!-- Bottom Navigation -->
    <div class="project-bottom-nav">
      <a href="index.html#work" class="btn-secondary">← Back to All Works</a>
      <a href="index.html#contact" class="btn-primary">Commission a Project ↗</a>
    </div>
  `;
}

function showErrorState(message) {
  const container = document.getElementById('project-detail-content');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-portfolio-editorial" style="margin: 80px 0;">
      <div class="empty-graphic-icon">✕</div>
      <h3 class="empty-title">Project Not Found</h3>
      <p class="empty-desc">${escapeHtml(message)}</p>
      <a href="index.html#work" class="btn-primary" style="margin-top: 20px;">Return to Portfolio</a>
    </div>
  `;
}

function formatParagraphs(text) {
  if (!text) return '';
  return text.split('\n\n')
    .map(p => `<p style="margin-bottom: 1.5em; line-height: 1.7; font-size: 1.15rem;">${escapeHtml(p.trim())}</p>`)
    .join('');
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

// Lightbox modal functionality
window.openLightbox = function(imageUrl) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-image');
  if (modal && img) {
    img.src = imageUrl;
    modal.style.display = 'flex';
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.style.display = 'none';
};
