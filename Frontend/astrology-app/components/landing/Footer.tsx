const exploreLinks = [
  { label: 'Kundali Generator', href: '/auth/signup' },
  { label: '9 Grahas', href: '/grahas' },
  { label: 'Dosha Report', href: '/auth/signup' },
  { label: 'समाधान', href: '/solutions' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
]

const socialLinks = [
  { label: 'YouTube', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'WhatsApp', href: '#' },
  { label: 'Telegram', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-abyss pt-16 pb-8 px-8" aria-label="Footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gold/10">
          <div className="flex flex-col gap-4">
            <a href="/" className="flex items-center gap-2 text-lg">
              <span className="text-amber">★</span>
              <span className="text-amber font-serif">Deepa&apos;s Vision</span>
            </a>
            <p className="text-cosmic text-sm leading-relaxed">
              Ancient wisdom for the modern journey. Vedic astrology rooted in
              authenticity, delivered with clarity.
            </p>
          </div>

          <div>
            <p className="text-xs tracking-[2px] uppercase text-amber mb-4">Explore</p>
            <ul className="flex flex-col gap-2">
              {exploreLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-cosmic text-sm hover:text-gold transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[2px] uppercase text-amber mb-4">Company</p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-cosmic text-sm hover:text-gold transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[2px] uppercase text-amber mb-4">Connect</p>
            <ul className="flex flex-col gap-2">
              {socialLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-cosmic text-sm hover:text-gold transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-cosmic text-xs">
            © {new Date().getFullYear()} Deepa&apos;s Vision. All rights reserved.
          </p>
          <p className="text-cosmic text-xs">🪐 ज्योतिष विद्या</p>
        </div>
      </div>
    </footer>
  )
}
