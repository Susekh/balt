import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StudentDataTable, { SectionScores } from '@/app/(admin)/components/student-tabe';

export const metadata: Metadata = {
  title: `Test Dashboard`,
  description: '',
};

export interface StudentDatum {
  slNo: number;
  email: string;
  name: string;
  branch: string;
  contactNo: string;
  semester: string;
  score: number;       // finalScore
  finalScore: number;  // sum of section scores
  totalScore : number;
  sectionScores: SectionScores;
  lastLogin: string | null;
}

const getStudents = async (cookie: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_BACKEND_URL}/api/get-student-data`,
      {
        headers: {
          Authorization: `Bearer ${cookie}`,
        },
        cache: 'no-store',
      },
    );

    const data = await response.json();

    const formattedData = data.students.map((student: StudentDatum, index: number) => ({
      slNo: index + 1,
      email: student.email ?? 'N/A',
      name: student.name ?? 'N/A',
      branch: student.branch ?? 'N/A',
      contactNo: student.contactNo ?? 'N/A',
      semester: student.semester ?? 'N/A',
      finalScore: student.finalScore ?? 0,
      totalScore: student.totalScore ?? 0,
      sectionScores: student.sectionScores ?? {
        English: 0,
        "Analytical Ability": 0,
        "Quantitative Ability": 0,
      },
      lastLogin: student.lastLogin ?? null,
    }));

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

  const studentData = await getStudents(cookie);
  const result: StudentDatum[] = studentData?.data;

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="flex flex-col gap-3 max-w-screen">
        {result && <StudentDataTable data={result} />}
      </div>
    </main>
  );
};

export default page;
