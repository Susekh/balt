import OdsicForm from '@/components/odsic-form';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react';

const getPersonalInfo = async (cookie: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/odsic-personal-info`,
      {
        headers: {
          Authorization: `Bearer ${cookie}`,
        },
      },
    );
    const data = await response.json();
    console.log('::odsic/page.tsx::', response.status);
    return data;
  } catch (err) {
    console.error('::odsic/page.tsx::\n', err);
    return;
  }
};

const page = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth-token')?.value;
  if (!cookie) {
    return redirect('/');
  }
  const data = await getPersonalInfo(cookie);
  return (
    <>
      {data.isFinalSubmit && (
        <main className="flex min-h-screen flex-row items-center justify-around p-4 bg-zinc-200">
        <div className="hidden md:flex justify-center items-center">
          <Image alt={''} src={'/odsic.jpeg'} height={300} width={300} />
        </div>
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">
                You Already Have Submitted The Exam
              </h1>
            </div>
          </div>
        <div className="hidden md:flex justify-center items-center">
          <Image alt={''} src={'/odsic.jpeg'} height={300} width={300} />
        </div>
        </main>
      )}
      {!data.isFinalSubmit && (
        <main className="flex min-h-screen flex-row items-center justify-around p-4 bg-zinc-200">
        <div className="hidden md:flex justify-center items-center">
          <Image alt={''} src={'/odsic.jpeg'} height={300} width={300} />
        </div>
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">ODSIC Exam Portal</h1>
              <p className="text-muted-foreground mt-2">Enter your details</p>
            </div>
            <OdsicForm data={data} />
          </div>
        <div className="hidden md:flex justify-center items-center">
          <Image alt={''} src={'/odsic.jpeg'} height={300} width={300} />
        </div>
        </main>
      )}
    </>
  );
};

export default page;
