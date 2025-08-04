import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../components/Cart/CartProvider';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Navbar7 from '../components/Navbar/Navbar7';
import Footer3 from '../components/Footer/Footer3';
import FloatingCartBox from '../components/Cart/FloatingCartBox';
import { ApiConfigProvider } from '../context/ApiConfigContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ss',
  description: 'Generated e-commerce website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <CartProvider>
                <ApiConfigProvider apiId={1}>
                  <Navbar7 />
                  {children}
                  <Footer3 />
                  <FloatingCartBox />
                </ApiConfigProvider>
              </CartProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}