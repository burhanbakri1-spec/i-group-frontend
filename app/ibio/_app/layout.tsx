'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowLeft, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBrandSettings, BrandSettingsProvider } from '@igroup/shared';

// ─── Nav Items ────────────────────────────────────────────────────────────────

const navItems = [
  {
    label: 'Features',
    href: '/ibio',
    dropdown: [
      { label: 'Recovery', href: '/ibio/recovery', desc: 'HRV, resting HR & readiness' },
      { label: 'Sleep', href: '/ibio/sleep', desc: 'Stages, coaching & debt' },
      { label: 'Strain', href: '/ibio/strain', desc: 'Cardiovascular load tracking' },
      { label: 'Heart Health', href: '/ibio/heart-health', desc: 'ECG & irregular rhythm alerts' },
      { label: 'Stress', href: '/ibio/stress', desc: '24/7 physiological stress score' },
      { label: 'Healthspan', href: '/ibio/healthspan', desc: 'Biological age & longevity' },
    ],
  },
  { label: 'Device', href: '/ibio/device' },
  { label: 'Membership', href: '/ibio/membership' },
  { label: 'Advanced Labs', href: '/ibio/advanced-labs' },
  { label: 'Dashboard', href: '/ibio/dashboard' },
];

// ─── Header ───────────────────────────────────────────────────────────────────

function IBioHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors group">
            <ArrowLeft size={14} />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase group-hover:tracking-[0.25em] transition-all">i Group</span>
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <Link href="/ibio" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center border border-white/10">
              <Activity size={13} className="text-white" />
            </div>
            <span className="font-black tracking-tight text-sm">i <span className="text-white">bio</span></span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map(item => (
            <div key={item.label} className="relative"
              onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}>
              <Link href={item.href}
                className={`flex items-center gap-1 text-[11px] font-black tracking-[0.12em] uppercase transition-colors ${pathname === item.href ? 'text-white' : 'text-white/40 hover:text-white'}`}>
                {item.label}
                {item.dropdown && <ChevronDown size={11} className={`transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
              </Link>
              {item.dropdown && activeDropdown === item.label && (
                <motion.div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {item.dropdown.map(d => (
                    <Link key={d.label} href={d.href}
                      className="flex flex-col px-5 py-3.5 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0">
                      <span className="text-xs font-black text-white">{d.label}</span>
                      <span className="text-[10px] text-white/30 mt-0.5">{d.desc}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/ibio/dashboard" className="hidden md:block text-[11px] font-black tracking-wider text-white/40 hover:text-white transition-colors uppercase">
            My Dashboard
          </Link>
          <motion.a href="/ibio/membership"
            className="hidden md:flex items-center gap-1.5 bg-white text-black px-4 py-2 rounded-full text-[11px] font-black tracking-wider uppercase"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Join Free <ArrowRight size={12} />
          </motion.a>
          <button onClick={() => setMenuOpen(true)} className="lg:hidden text-white/60 hover:text-white">
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-black z-50 p-7 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <span className="font-black text-xl">i bio</span>
              <button onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </div>
            {navItems.map(item => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setMenuOpen(false)}
                  className="text-2xl font-black py-4 border-b border-white/[0.06] block hover:text-white/60 transition-colors">
                  {item.label}
                </Link>
                {item.dropdown?.map(d => (
                  <Link key={d.label} href={d.href} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 pl-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:text-white/60 transition-colors">
                    <span className="text-xs text-white/30">—</span>
                    <span className="text-sm font-bold text-white/60">{d.label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <div className="mt-8 space-y-3">
              <Link href="/ibio/membership" onClick={() => setMenuOpen(false)}
                className="block py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl text-center text-sm">
                Join Free
              </Link>
              <Link href="/ibio/dashboard" onClick={() => setMenuOpen(false)}
                className="block py-4 border border-white/15 font-black uppercase tracking-widest rounded-2xl text-center text-sm text-white/60">
                My Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function IBioFooter() {
  const { socialLinks } = useBrandSettings();
  const footerLinks = [
    {
      heading: 'Features', links: [
        { l: 'Recovery', h: '/ibio/recovery' }, { l: 'Sleep', h: '/ibio/sleep' },
        { l: 'Strain', h: '/ibio/strain' }, { l: 'Heart Health', h: '/ibio/heart-health' },
        { l: 'Stress', h: '/ibio/stress' }, { l: 'Healthspan', h: '/ibio/healthspan' },
      ],
    },
    {
      heading: 'Membership', links: [
        { l: 'i bio Core', h: '/ibio/membership' }, { l: 'i bio Pro', h: '/ibio/membership' },
        { l: 'i bio Elite', h: '/ibio/membership' }, { l: 'Free Trial', h: '/ibio/membership' },
        { l: 'Advanced Labs', h: '/ibio/advanced-labs' },
      ],
    },
    {
      heading: 'Device', links: [
        { l: 'i bio Band', h: '/ibio/device' }, { l: 'Sensors & Tech', h: '/ibio/device' },
        { l: 'Accessories', h: '/ibio/device' }, { l: 'Compatibility', h: '/ibio/device' },
      ],
    },
    {
      heading: 'Company', links: [
        { l: 'i Group', h: '/' }, { l: 'i fit', h: '/ifit' },
        { l: 'Science', h: '/ibio/healthspan' }, { l: 'Privacy', h: '#' }, { l: 'Terms', h: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-black/[0.08] bg-[#F5F5F5] pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-black/[0.07] border border-black/[0.1] flex items-center justify-center">
                <Activity size={14} className="text-black" />
              </div>
              <span className="font-black text-base text-black">i bio</span>
            </div>
            <p className="text-xs text-black/40 leading-relaxed max-w-[160px]">
              The biometric engine for the i Group ecosystem. Science-backed. Clinician-reviewed.
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map(link => (
                <a key={link.key} href={link.url} target="_blank" rel="noreferrer" className="text-black/30 hover:text-black transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{link.label}</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-black/25 mt-4">
              Part of <Link href="/" className="text-black/50 hover:text-black">i Group</Link>
            </p>
          </div>
          {footerLinks.map(col => (
            <div key={col.heading}>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-black/30 mb-4">{col.heading}</p>
              <div className="space-y-2.5">
                {col.links.map(l => (
                  <Link key={l.l} href={l.h} className="block text-sm text-black/45 hover:text-black transition-colors">{l.l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-black/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-black/30">© 2026 i Group. All rights reserved.</p>
          <p className="text-[10px] text-black/20 text-center md:text-right max-w-sm">
            i bio is for wellness purposes only and is not a medical device. Not intended to diagnose, treat, cure, or prevent any condition.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function IBioLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandSettingsProvider>
      <div className="min-h-screen">
        <IBioHeader />
        <main className="pt-16">{children}</main>
        <IBioFooter />
      </div>
    </BrandSettingsProvider>
  );
}
