import ExamUserProfile from '../components/exam-user-profile';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../components/dashboard-navbar';
import ExamList from '../components/exam-lists';


interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface ExamLists {
  id: number,
  name: string,
  questions: number,
  duration: number
}

const getProfileInfo = async (cookie: string) => {
  const response = await fetch(
    `${process.env.NEXT_BACKEND_URL}/api/get-user-profile`,
    {
      headers: {
        Authorization: `Bearer ${cookie}`
      }
    }
  );
  if (response.status === 500) {
    return;
  }
  if (response.status === 403) {
    redirect('/')
  }
  if (!response.ok) return;
  if (response.status === 200) {
    const data: UserData = await response.json();
    return data;
  }
};

const getExamInfo = async (cookie: string) => {
  const response = await fetch(
    `${process.env.NEXT_BACKEND_URL}/api/get-user-exam-info`,
    {
      headers: {
        Authorization: `Bearer ${cookie}`
      },
      cache: 'no-cache'
    }
  );
  if (response.status === 500) {
    return;
  }
  if (response.status === 403) {
    redirect('/')
  }
  if (!response.ok) return;
  if (response.status === 200) {
    const data: ExamLists[] = await response.json();
    const sortedData: ExamLists[] = data.sort((a:ExamLists, b:ExamLists) => {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()
      return nameA.localeCompare(nameB)
    })
    return sortedData;
  }
};

const dashboard = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('auth-token')?.value;

  if (!cookie) {
    return redirect('/');
  }

  const basicUserData = await getProfileInfo(cookie);
  const pendingExamDetails = await getExamInfo(cookie);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {basicUserData && <Navbar data={basicUserData} />}

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Profile Sidebar */}
          {basicUserData && <ExamUserProfile data={basicUserData} />}

          {/* Main Content */}
          {pendingExamDetails && <ExamList availableTests={pendingExamDetails}/>}
        </div>
      </div>
    </div>
  );
};

export default dashboard;
