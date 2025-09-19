import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StudentDataTable from '../../components/student-table';

export const metadata: Metadata = {
  title: `Test Dashboard`,
  description: '',
};

interface StudentDatum {
  email: string | null;
  name: string | null;
  branch: string | null;
  collegeName: string | null;
  contactNo: string | null;
  semester: string | null;
  score: string | null;
}

const getQuestions = async (cookie: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/get-student-data`,
      {
        headers: {
          Authorization: `Bearer ${cookie}`,
        },
        cache: 'no-store'
      },
    );
    const data = await response.json();
    const formattedData = data.students.map((student: StudentDatum, index: number) => ({
      slNo: index + 1,
      ...student,
      score: (student.score)?.toString()?? 'N/A',
      total: 25
    }))
    return { data: formattedData, status: response.status };
  } catch (err) {
    console.error('::/admin/dashboard.tsx::\n', err);
  }
};

const page = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth-token')?.value;

  if (!cookie) {
    return redirect('/');
  }
  const studentData = await getQuestions(cookie);
  
  const result:StudentDatum[] = studentData?.data

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className='flex flex-col gap-3 max-w-screen'>
          {result && <StudentDataTable data={result} />}
      </div>
    </main>
  );
};

export default page;
