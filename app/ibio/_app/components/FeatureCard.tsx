'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, desc, href, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className="group bg-black/[0.02] border border-black/[0.07] rounded-3xl p-8 hover:border-black/20 hover:bg-black/[0.04] transition-all cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link href={href}>
        <Icon size={22} className="text-black/35 mb-6 group-hover:text-black transition-colors" />
        <h3 className="text-xl font-black mb-3 text-black">{title}</h3>
        <p className="text-sm text-black/45 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1 mt-6 text-xs font-black text-black/25 group-hover:text-black/60 transition-colors">
          Learn more <ChevronRight size={12} />
        </div>
      </Link>
    </motion.div>
  );
}
