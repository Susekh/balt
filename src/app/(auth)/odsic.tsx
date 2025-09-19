import Login from '@/components/Login';
import { Metadata } from 'next';
import Image from 'next/image';
import React from 'react';

export const metadata: Metadata = {
  title: 'Login',
};

export default function page() {
  return (
    <>
      <main className="flex min-h-screen flex-row items-center justify-around p-4 bg-zinc-200">
        <div className="hidden md:flex justify-center items-center">
          <Image alt={''} src={'/odsic.jpeg'} height={300} width={300} />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">ODSIC Exam Portal</h1>
            <p className="text-muted-foreground mt-2">
              Login to start your assessment
            </p>
          </div>
          <Login />
        </div>
        <div className="hidden md:flex justify-center items-center">
          <Image alt={''} src={'/odsic.jpeg'} height={300} width={300} />
        </div>
      </main>
    </>
  );
}
