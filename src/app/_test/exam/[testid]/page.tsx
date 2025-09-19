import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Exam from '../../components/exam';

export const metadata: Metadata = {
  title: `Test Dashboard`,
  description: '',
};

const getQuestions = async (cookie: string, testId: number) => {
  try {
    const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/get-osdic-questions?examId=${testId}`, {
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      cache: 'no-cache'
    });
    const data = await response.json()
    console.log('::exam/page.tsx::', response.status)
    return {data:data, status: response.status};
  } catch (err) {
    console.error('::exam/page.tsx::\n', err);
  }
};

const page = async ({ params }: { params: Promise<{ testid: string }> }) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth-token')?.value;

  const { testid } = await params;
  if (!cookie || !testid) {
    return redirect('/');
  }
  const questionData = await getQuestions(cookie, parseInt(testid))
  if (questionData?.status === 408) {
    return redirect('/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {/* <MainExam testId={testid}
       questions={questionData?.questions}
      /> */}
      <Exam examData={questionData?.data} testId={testid} />
    </main>
  );
};

export default page;
