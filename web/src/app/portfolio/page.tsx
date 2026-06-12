import Link from 'next/link';

const aims = [
  { title: 'Empower Caribbean Businesses', description: 'Provide affordable, professional-grade technology solutions that help Caribbean businesses compete globally.', icon: '💼' },
  { title: 'Build Cooperative Infrastructure', description: 'Establish democratic, member-owned cooperatives that provide sustainable income and community resilience.', icon: '🤝' },
  { title: 'Open Data & APIs', description: 'Develop proprietary geospatial and business APIs for the Caribbean, creating data infrastructure that benefits the entire region.', icon: '📊' },
  { title: 'Community-Led Growth', description: 'Ensure technology serves people — every product designed with community benefit at its core.', icon: '🌱' },
];

const projects = [
  { title: 'IslandHub Marketplace', description: 'Complete Caribbean marketplace — vendor stores, food delivery, rides, auctions, secure payments.', tags: ['Next.js', 'PostgreSQL', 'Stripe'], status: 'Live', statusColor: 'bg-emerald-500/10 text-emerald-500' },
  { title: 'IBT Co-operative Federation', description: 'Multi-cooperative platform — Trades & Services, Micro-Farms, Micro-Manufacturing under democratic governance.', tags: ['Next.js', 'Neon DB', 'WhatsApp'], status: 'Building', statusColor: 'bg-amber-500/10 text-amber-500' },
  { title: 'Business API Suite', description: 'APIs for currency exchange, geospatial mapping, accounting integrations, inventory management.', tags: ['REST API', 'Node.js', 'OpenAI'], status: 'Live', statusColor: 'bg-emerald-500/10 text-emerald-500' },
  { title: 'Graphic Trends Co-op', description: 'Custom apparel, print-on-demand merchandise, sustainable promotional materials.', tags: ['E-commerce', 'Design'], status: 'Launching', statusColor: 'bg-blue-500/10 text-blue-500' },
  { title: 'AI Digital Influencer', description: 'AI-powered influencers with authentic Caribbean accents for marketing and social media.', tags: ['AI', 'Voice Cloning'], status: 'Beta', statusColor: 'bg-purple-500/10 text-purple-500' },
  { title: 'Regional Intel', description: 'Caribbean-focused mapping, POI data, events, weather integration, marine conditions.', tags: ['Maps', 'GIS'], status: 'Building', statusColor: 'bg-amber-500/10 text-amber-500' },
];

export const metadata = {
  title: 'Portfolio | IslandHub',
  description: 'Building the future of Caribbean commerce through technology, community, and innovation.',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-surface-primary text-ink-primary">
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <Link href="/about" className="text-sm text-ink-tertiary transition-colors hover:text-ink-primary">
          ← Back to About
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Portfolio</h1>
        <p className="mt-3 text-lg text-ink-tertiary">
          Building the future of Caribbean commerce through technology, community, and innovation.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-semibold">Aims & Objectives</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {aims.map((aim, i) => (
            <div key={i} className="rounded-2xl border border-border-primary bg-surface-elevated p-5">
              <div className="mb-3 text-3xl">{aim.icon}</div>
              <h3 className="font-semibold text-ink-primary">{aim.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{aim.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-semibold">Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <div key={i} className="group overflow-hidden rounded-2xl border border-border-primary bg-surface-elevated transition-colors hover:border-accent-500/30">
              <div className="h-2 bg-gradient-to-r from-accent-500 to-accent-600" />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-ink-primary">{project.title}</h3>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${project.statusColor}`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-border-primary bg-surface-tertiary px-2 py-0.5 text-xs text-ink-tertiary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-accent-600/20 to-accent-700/20 border border-accent-500/20 p-8 text-center">
          <h2 className="text-xl font-semibold text-ink-primary">Interested in Working Together?</h2>
          <p className="mt-2 text-ink-secondary">Have a project in mind or want to contribute to these initiatives?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/founder" className="rounded-xl bg-accent-500 px-6 py-3 font-medium text-white transition-colors hover:bg-accent-600">
              Meet the Founder
            </Link>
            <a href="mailto:businesstrends869@gmail.com" className="rounded-xl border border-border-primary bg-surface-elevated px-6 py-3 font-medium text-ink-secondary transition-colors hover:border-accent-500/30 hover:text-ink-primary">
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
