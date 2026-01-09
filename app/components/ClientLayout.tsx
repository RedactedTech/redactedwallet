'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Determine if we should show the navbar at all
  const showNavbar = !pathname.startsWith('/dashboard');

  // Determine navbar variant based on path
  const isLandingPage = pathname === '/';
  const variant = isLandingPage ? 'landing' : 'default';

  return (
    <>
      {showNavbar && <Navbar variant={variant} />}
      {children}
    </>
  );
}
