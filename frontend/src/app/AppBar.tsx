'use client';

import Link from 'next/link';

export function AppBar() {
  return (
    <nav className="bg-gray-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link className="text-white text-2xl font-bold" href="/">
              KW Everytime Helper
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" href="/labeling">
              레이블링
            </Link>
            <Link className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium" href="/statistics">
              통계
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
