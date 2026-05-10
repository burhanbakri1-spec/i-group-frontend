import { BrandSettingsProvider } from '@igroup/shared';

export default function IDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandSettingsProvider>
      {children}
    </BrandSettingsProvider>
  );
}
