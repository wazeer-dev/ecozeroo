'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const PageFooter = () => {
  const pathname = usePathname();
  
  // Define routes where the footer should be hidden
  const hideFooterRoutes = ['/menu', '/products'];
  
  if (hideFooterRoutes.includes(pathname)) {
    return null;
  }

  return <Footer />;
};

export default PageFooter;
