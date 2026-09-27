# Simar — Modern Graphic Designer Portfolio & Admin System

A bold, high-end, typography-driven portfolio website designed specifically for **Simar**, featuring:
- **Editorial Graphic Design Aesthetic**: Oversized display typography, asymmetric layouts, kinetic marquee ticker, fine gridlines, and minimalist palette with dynamic customizable accent color.
- **Strictly Real Content Only**: Absolutely NO dummy projects, fake client testimonials, stock portraits, or placeholder awards. The portfolio displays an elegant editorial empty state until Simar uploads real case studies through the admin panel.
- **Supabase Backend Integration**: Ready out-of-the-box with your Supabase project (`rnekifhfxmixmehiaodv`), supporting Auth, PostgreSQL Database, and Storage Bucket for cover and gallery image uploads.
- **Full Secure Admin Dashboard**: Manage projects, hero text, about story, design philosophy, skills/services, contact details, accent color, and site settings.

---

## 🚀 Quick Start (View & Run Locally)

You can run the portfolio right away using Python's built-in web server:

1. Open PowerShell in this folder (`c:\Users\omc\Desktop\New folder`):
   ```powershell
   python -m http.server 8000
   ```
2. Open your browser to:
   - **Portfolio Website**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
   - **Admin Dashboard**: [http://localhost:8000/admin.html](http://localhost:8000/admin.html)

*(You can also double-click `index.html` to open directly in any browser!)*

---

## 🗄️ Supabase Setup (1 Minute)

Your Supabase project URL and API key are already pre-configured in `js/config.js`.

To create the PostgreSQL tables, Row Level Security (RLS) policies, and the `portfolio-images` storage bucket:

1. Open your Supabase SQL Editor:
   👉 **[https://supabase.com/dashboard/project/rnekifhfxmixmehiaodv/sql](https://supabase.com/dashboard/project/rnekifhfxmixmehiaodv/sql)**
2. Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) (or click **"Copy SQL Schema"** inside the Admin panel).
3. Paste into the SQL editor and click **Run**.
4. Done! All tables (`projects`, `project_images`, `skills`, `profile`, `site_settings`) and storage policies are now active.

> *Note: Even before running the SQL migration, the Admin Panel features an intelligent local fallback system, allowing you to test, customize, and add projects immediately without any crash or data loss!*

---

## ⚙️ Admin Dashboard Features

Navigate to [http://localhost:8000/admin.html](http://localhost:8000/admin.html) to:
- **Projects Manager**:
  - Add, edit, or delete graphic design projects.
  - Upload project cover images and multiple gallery images (with instant preview).
  - Add short summary, full case study overview, design process notes, tools used, and live project links.
  - Hide/publish projects or reorder them.
- **Hero & Headline**:
  - Change "SIMAR", "GRAPHIC DESIGNER", and the introduction statement.
- **About & Profile**:
  - Update narrative, design philosophy, and software list. (Sections are automatically hidden on the public site until content is filled in!)
- **Services & Skills**:
  - Add or remove design disciplines (e.g., Graphic Design, Poster Design, Branding, Typography).
- **Contact & Socials**:
  - Set direct inquiry email, Instagram, LinkedIn, Behance, and Dribbble.
- **Theme & Settings**:
  - Pick any dynamic accent color (Acid Lime, Cobalt Blue, Tangerine, Neon Magenta, or custom HEX picker). This instantly updates buttons, tags, and highlights across the entire site!

---

## 📁 Project Structure

```
.
├── index.html                 # Main portfolio page (Hero, About, Skills, Work, Contact, Footer)
├── project.html               # Individual project case study detail page & image lightbox
├── admin.html                 # Full secure admin dashboard
├── css/
│   ├── style.css              # Main editorial typography & responsive styles
│   └── admin.css              # Admin dashboard dark-mode styling
├── js/
│   ├── config.js              # Supabase keys and initial default config
│   ├── supabase-client.js     # Supabase client, REST API, Auth, Storage & offline fallback
│   ├── app.js                 # Main site dynamic hydration & UI interactions
│   ├── project-detail.js      # Case study loader and gallery viewer
│   └── admin.js               # Admin authentication, CRUD, and image uploads
├── supabase_schema.sql        # Supabase PostgreSQL tables, RLS policies, and storage setup
└── README.md                  # This documentation guide
```
