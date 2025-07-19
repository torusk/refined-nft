'use client';

import { useTexts } from '@/hooks/useTexts';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  const texts = useTexts();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
            {texts.home.title}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            {texts.home.subtitle}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Quest Card */}
            <Card hover>
              <CardHeader
                icon={
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                {texts.quest.title}
              </CardHeader>
              <CardContent className="mb-6">
                {texts.quest.description}
              </CardContent>
              <CardFooter>
                <Link href="/quest">
                  <Button variant="primary" size="lg">
                    {texts.quest.startButton}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Claim Card */}
            <Card hover>
              <CardHeader
                icon={
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              >
                {texts.claim.title}
              </CardHeader>
              <CardContent className="mb-6">
                {texts.claim.description}
              </CardContent>
              <CardFooter>
                <Link href="/claim">
                  <Button variant="success" size="lg">
                    {texts.claim.startButton}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}