import GoldDivider from './GoldDivider'

const services = [
  {
    id: '01',
    title: 'Students & Career',
    slug: 'students-career',
    bullets: ['Career path clarity', 'Education timing', 'Skill alignment'],
  },
  {
    id: '02',
    title: 'Business Owners',
    slug: 'business-owners',
    bullets: ['Launch timing', 'Partnership compatibility', 'Growth cycles'],
  },
  {
    id: '03',
    title: 'Corporate Professionals',
    slug: 'corporate',
    bullets: ['Promotion windows', 'Leadership strengths', 'Work-life balance'],
  },
  {
    id: '04',
    title: 'Relationships & Family',
    slug: 'relationships',
    bullets: ['Compatibility analysis', 'Marriage timing', 'Family harmony'],
  },
  {
    id: '05',
    title: 'Mental Health',
    slug: 'mental-health',
    bullets: ['Emotional cycles', 'Mind-planet connections', 'Inner peace remedies'],
  },
  {
    id: '06',
    title: 'Health Problems',
    slug: 'health',
    bullets: ['Planetary health indicators', 'Remedy timing', 'Preventive insights'],
  },
  {
    id: '07',
    title: 'Investing',
    slug: 'investing',
    bullets: ['Financial Dasha cycles', 'Risk periods', 'Wealth yogas'],
  },
  {
    id: '08',
    title: 'Civil Servants',
    slug: 'civil-servants',
    bullets: ['Government service yogas', 'Exam timing', 'Transfer predictions'],
  },
]

export default function ServicesSection() {
  return (
    <section className="bg-void py-20 px-8" aria-label="Services">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs tracking-[3px] uppercase text-amber mb-3">
          Services · सेवाएं
        </p>
        <h2 className="font-serif text-3xl text-amber mb-2">
          What We Cherish For You —
        </h2>
        <p className="text-cosmic text-sm mb-12">(Services)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s) => (
            <article
              key={s.id}
              className="flex flex-col gap-4 p-6 bg-surface border border-gold/30 hover:border-gold/60 hover:bg-raised hover:shadow-[0_0_20px_rgba(200,146,10,0.15)] transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-base text-starlight leading-snug">
                  {s.title}
                </h3>
                <span className="text-amber text-xs opacity-60">{s.id}</span>
              </div>
              <ul className="flex flex-col gap-1 flex-1">
                {s.bullets.map((b) => (
                  <li key={b} className="text-cosmic text-xs flex gap-2">
                    <span className="text-gold mt-0.5">·</span>
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href={`/auth/signup?service=${s.slug}`}
                className="block w-full text-center py-2 bg-saffron text-white text-xs tracking-widest hover:bg-saffron/80 transition-colors mt-auto"
              >
                LET&apos;S SIT
              </a>
            </article>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16">
        <GoldDivider />
      </div>
    </section>
  )
}
