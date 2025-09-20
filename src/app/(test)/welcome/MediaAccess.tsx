'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Webcam from 'react-webcam';

type UserData = {
  name: string | null;
  email: string;
  branch: string | null;
};

type Props = {
  userData: UserData;
};

export default function MediaAccess({ userData }: Props) {
  // const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Webcam constraints
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user' as const,
  };

  const handleUserMedia = () => {
    // setCameraActive(true);
    setError('');
  };

  const handleOnSubmit = () => {
    if (!mounted) return; // Ensure router is ready
    router.replace('/test?test=baseline');
  };

  const handleUserMediaError = (err: unknown) => {
    console.error('Media access error:', err);

    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          setError('Permissions denied. Please allow camera access.');
          break;
        case 'NotFoundError':
          setError('No camera found.');
          break;
        default:
          setError('Failed to access media devices.');
          break;
      }
    } else {
      setError('Failed to access media devices.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg max-w-5xl w-full p-6 flex flex-col md:flex-row gap-8">
        {/* Video Section */}
        <div className="flex-shrink-0">
          <div className="w-72 h-96 bg-black rounded overflow-hidden border-4 border-blue-600">
            <Webcam
              audio={false}
              mirrored={true}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-between space-y-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-center md:text-left">
              Proctored Exam Access
            </h1>

            <div className="mt-4 space-y-2 text-center md:text-left">
              <p>
                Welcome,{' '}
                <span className="font-semibold">
                  {userData.name || 'Student'}
                </span>
              </p>
              <p>Email: {userData.email}</p>
              <p>Branch: {userData.branch || 'N/A'}</p>
            </div>

            <div className="mt-6 space-y-4 text-center md:text-left">
              <p className="text-gray-700">
                This exam requires continuous monitoring through your camera.
              </p>
              <p className="text-sm text-gray-500">
                Please ensure that you are seated in a well-lit environment and
                remain focused throughout the test.
              </p>
              {error && (
                <div className="text-red-600 text-sm font-medium">
                  ⚠ {error}
                </div>
              )}
            </div>
          </div>

          <div className="text-center md:text-left">
            <button
              disabled={!mounted} // ✅ Only check if router is mounted
              onClick={handleOnSubmit}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
                mounted
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
