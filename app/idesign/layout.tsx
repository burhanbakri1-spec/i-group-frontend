import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import IDesignLayout from './_app/layout';

export default function RootIDesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <IDesignLayout>
      <Link
        href="/"
        className="fixed left-5 top-5 z-60 flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-black/60 shadow-lg backdrop-blur-xl transition-colors hover:text-black"
      >
        <ArrowLeft size={14} />
        i Group
      </Link>
      {children}
    </IDesignLayout>
  );
}
