import Link from 'next/link';

const skills = [
  'Flutter', 'Dart', 'Java', 'UX/UI Design', 'Graphic Design',
  '3D Modeling & Rendering', 'Corporate Branding', 'Print Production',
  'Web Development', 'Data Analysis', 'AI Tools', 'Figma',
  'Adobe Creative Suite', 'Next.js', 'React', 'TypeScript',
  'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Python', 'Blender',
];

const experience = [
  {
    title: 'Creative Designer',
    period: '13 Years',
    org: 'Freelance . Carib Craft and Graphics',
    desc: 'Professional graphic design, branding, and visual identity for clients across the Caribbean and internationally.',
  },
  {
    title: 'App Developer',
    period: '5+ Years',
    org: 'Flutter . Dart . Java',
    desc: 'Cross-platform mobile applications from concept to deployment — UX-focused, performant, scalable.',
  },
  {
    title: '3D Designer & Architect',
    period: 'Ongoing',
    org: '3D Modeling . Rendering . Spatial Design',
    desc: '3D visualizations, architectural renderings, and spatial designs for residential and commercial projects.',
  },
  {
    title: 'Technical Builder',
    period: '10 Years',
    org: 'Dominica . Painting & Construction',
    desc: 'Hands-on project management, materials, and structural design across residential and commercial builds.',
  },
];

export const metadata = {
  title: 'Founder — N. J. Robin | IslandHub',
  description: 'Meet N. J. Robin, Founder of IslandHub — creative technologist based in St. Kitts & Nevis.',
};

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-surface-primary text-ink-primary">
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <Link href="/about" className="text-sm text-ink-tertiary transition-colors hover:text-ink-primary">
          ← Back to About
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="shrink-0">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 text-5xl font-bold text-white shadow-xl">
              NJ
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold md:text-4xl">N. J. Robin</h1>
            <p className="mt-2 text-lg text-accent-500">Founder & Creative Technologist</p>
            <p className="mt-1 text-ink-tertiary">Graphic Designer . App Developer . 3D Designer</p>

            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href="tel:+18697639919" className="rounded-lg border border-border-primary bg-surface-elevated px-3 py-1.5 text-sm text-ink-secondary transition-colors hover:border-accent-500/30 hover:text-ink-primary">
                +1 (869) 763-9919
              </a>
              <a href="mailto:businesstrends869@gmail.com" className="rounded-lg border border-border-primary bg-surface-elevated px-3 py-1.5 text-sm text-ink-secondary transition-colors hover:border-accent-500/30 hover:text-ink-primary">
                businesstrends869@gmail.com
              </a>
              <span className="rounded-lg border border-border-primary bg-surface-elevated px-3 py-1.5 text-sm text-ink-tertiary">
                St. Kitts & Nevis
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border-primary bg-surface-elevated p-6 md:p-8">
          <h2 className="mb-4 text-xl font-semibold">About</h2>
          <p className="leading-relaxed text-ink-secondary">
            N. J. Robin is a multi-disciplinary creative technologist and founder based in St. Kitts & Nevis.
            With over 13 years of experience in graphic design, 5+ years in app development, and a decade of
            hands-on work in painting and construction, he brings a rare combination of creative vision and
            technical execution to every project.
          </p>
          <p className="mt-4 leading-relaxed text-ink-secondary">
            His work spans the full spectrum of digital creation — from corporate branding and print production
            to full-stack mobile development with Flutter and Dart, 3D modeling and architectural rendering,
            and AI-powered business tools. He founded IslandHub to build practical technology infrastructure
            for Caribbean businesses and communities.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold">Experience Highlights</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {experience.map((exp, i) => (
              <div key={i} className="rounded-2xl border border-border-primary bg-surface-elevated p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-ink-primary">{exp.title}</h3>
                  <span className="shrink-0 rounded-md bg-accent-500/10 px-2 py-0.5 text-xs font-medium text-accent-500">
                    {exp.period}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-tertiary">{exp.org}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold">Technical Skills & Platforms</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-lg border border-border-primary bg-surface-elevated px-3 py-1.5 text-sm text-ink-secondary">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-accent-600/20 to-accent-700/20 border border-accent-500/20 p-8 text-center">
          <h2 className="text-xl font-semibold text-ink-primary">Let's Build Something Together</h2>
          <p className="mt-2 text-ink-secondary">
            Whether you need a complete brand identity, a mobile app, 3D visualization, or a full digital transformation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="mailto:businesstrends869@gmail.com" className="rounded-xl bg-accent-500 px-6 py-3 font-medium text-white transition-colors hover:bg-accent-600">
              Get in Touch
            </a>
            <Link href="/portfolio" className="rounded-xl border border-border-primary bg-surface-elevated px-6 py-3 font-medium text-ink-secondary transition-colors hover:border-accent-500/30 hover:text-ink-primary">
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
