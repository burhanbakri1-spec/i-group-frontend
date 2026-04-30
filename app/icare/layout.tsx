import React from 'react';
import { IcareShell } from './components/IcareShell';
import './icare.css';

export default function IcareLayout({ children }: { children: React.ReactNode }) {
  return <IcareShell>{children}</IcareShell>;
}
