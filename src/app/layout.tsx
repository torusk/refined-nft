import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Marathon Challenge Protocol',
  description: 'マラソンチャレンジを宣言し、記録をNFTとして永続化するプロトコル',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <a href="/" className="text-xl font-bold text-gray-900">
                      Marathon Challenge Protocol
                    </a>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a href="/challenges" className="text-gray-700 hover:text-gray-900">
                      チャレンジ
                    </a>
                    <a href="/profile" className="text-gray-700 hover:text-gray-900">
                      プロフィール
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}