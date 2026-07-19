const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Help Center', href: '#' },
  { label: 'Career Blog', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-12 px-4 md:px-container-padding flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
      <div className="text-center md:text-left">
        <span className="font-headline-md text-headline-md text-primary">CareerPilot AI</span>
        <p className="font-metadata text-metadata text-on-surface-variant mt-2">
          © 2024 CareerPilot AI. All rights reserved.
        </p>
      </div>
      <nav className="flex flex-wrap justify-center gap-6">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
