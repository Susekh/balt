'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Clock,
  Loader,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Instructions = ({ testId }: { testId: string }) => {
  const router = useRouter();
  const [agreed, setAgreed] = useState(true);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  console.log(testId)
  const handleProceed = () => {
    if (agreed) {
      startTransition(() => {
        document.documentElement.requestFullscreen()
        // router.push(`/exam/${testId}?exam=${searchParams.get('exam')}`);
        router.push(`/exam/${200}?exam=ODSIC`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
            {searchParams.get('exam')}
          </h1>
          <Badge
            variant="outline"
            className="text-lg bg-purple-100 text-purple-800 px-4 py-1"
          >
            INSTRUCTIONS
          </Badge>
        </header>

        <Card className="mb-8 border-purple-200 shadow-md">
          <CardHeader className="bg-teal-600 text-white">
            <CardTitle className="flex items-center text-2xl mt-1 gap-2">
              <AlertCircle className="w-5 h-5" />
              GENERAL INSTRUCTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-bold">
                  1
                </span>
                <p>
                  Once the test starts, the auto-timer will be on and the time
                  left to complete the test will be indicated on the right top
                  corner of the screen
                  <span className="inline-flex items-center ml-2 text-orange-600 font-medium">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>00:30:00</span>
                  </span>
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-bold">
                  2
                </span>
                <div>
                  <p className="mb-3">
                    The Question Palette displayed on the right side of the
                    screen will show the status of each question using one of
                    the following symbols:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-600/80 flex items-center justify-center text-white"></div>
                      <span>Answered the question</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white"></div>
                      <span>Answered and marked for review</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/80 flex items-center justify-center text-white"></div>
                      <span>Not answered the question</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-600/90 flex items-center justify-center text-white"></div>
                      <span>Not answered and marked for review</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center text-white"></div>
                      <span>Not attended</span>
                    </div>
                  </div>

                  <p className="mt-3 text-purple-700">
                    The mark for review status for a question simply indicates
                    that you would like to look at that question again. If a
                    question is answered and marked for review, your answer for
                    the question will be considered in the evaluation.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-8 border-purple-200 shadow-md">
          <CardHeader className="bg-blue-700 text-white">
            <CardTitle className="flex items-center text-2xl mt-1 gap-2">
              NAVIGATING TO A QUESTION
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold">
                3
              </span>
              <div>
                <p className="mb-4">To answer a question, do the following:</p>

                <ul className="space-y-3 pl-4 list-disc text-blue-800">
                  <li>
                    Click on the question number in the Question Palette to go
                    to that question directly.
                  </li>
                  <li>Select an answer for a multiple choice type question.</li>
                  <li>
                    Click on{' '}
                    <Badge className="bg-green-100 text-green-800 ml-1">
                      Save & Next
                    </Badge>{' '}
                    to save your answer for the current question and then go to
                    the next question.
                  </li>
                  <li>
                    Click on{' '}
                    <Badge className="bg-blue-100 text-blue-800 ml-1">
                      Mark for Review & Next
                    </Badge>{' '}
                    to save your answer for the current question, mark it for
                    review and then go to the next question.
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-800 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Caution: Note that your answer for the current question will
                    not be saved, if you navigate to another question directly
                    by clicking on its question number.
                  </p>
                </div>

                <p className="mt-4">
                  You can view all questions by clicking on the{' '}
                  <Badge className="bg-purple-100 text-purple-800 ml-1">
                    Question Paper
                  </Badge>{' '}
                  button. Note that the options for multiple choice type
                  questions will not be shown.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-purple-200 shadow-md">
          <CardHeader className="bg-green-700 text-white">
            <CardTitle className="flex items-center text-2xl mt-1 gap-2">
              ANSWERING A QUESTION
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 font-bold">
                  4
                </span>
                <div>
                  <p className="mb-3">
                    Procedure for answering a multiple choice type question:
                  </p>

                  <ul className="space-y-3 pl-4 list-disc text-green-800">
                    <li>
                      To select your answer, click on the button of one of the
                      options.
                    </li>
                    <li>
                      To deselect your chosen answer, click on the button of the
                      chosen option again or click on the{' '}
                      <Badge className="bg-gray-100 text-gray-800 ml-1">
                        Clear Response
                      </Badge>{' '}
                      button.
                    </li>
                    <li>
                      To change your chosen answer, click on the button of
                      another option.
                    </li>
                    <li>
                      To save your answer, you MUST click on the{' '}
                      <Badge className="bg-green-100 text-green-800 ml-1">
                        Save & Next
                      </Badge>{' '}
                      button.
                    </li>
                    <li>
                      To mark the question for review, click on the{' '}
                      <Badge className="bg-blue-100 text-blue-800 ml-1">
                        Mark For Review & Next
                      </Badge>{' '}
                      button. If an answer is selected for a question that is
                      Marked for Review, that answer will be considered in the
                      evaluation.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 font-bold">
                  5
                </span>
                <p>
                  To change your answer to a question that has already been
                  answered, first select that question for answering and then
                  follow the procedure for answering that type of question.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 font-bold">
                  6
                </span>
                <p className="font-medium text-purple-800">
                  Note that ONLY Questions for which answers are saved or marked
                  for review after answering will be considered for evaluation.
                </p>
              </div>
            </div>
          </CardContent>
          {/* <CardFooter>
            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I have read and understood the instructions, and I agree to
                proceed with the test.
              </Label>
            </div>
          </CardFooter> */}
        </Card>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <Button
            variant={'trident'}
            // disabled={agreed}
            onClick={() => router.push('/dashboard')}
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 text-lg rounded-lg"
          >
            Back
          </Button>
          <Button
            variant={'trident'}
            onClick={handleProceed}
            disabled={!agreed}
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 text-lg rounded-lg"
          >
            {isPending ? (
              <>
                Wait <Loader className="animate-spin" />
              </>
            ) : (
              'Proceed to Test'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;

{
  /* <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              <u>{searchParams.get('exam')}</u>
              <br />
              Test Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Welcome to the Assessment
              </h3>
              <p>
                Please read the following instructions carefully before
                proceeding:
              </p>

              <div className="space-y-2">
                <h4 className="font-medium">Test Duration</h4>
                <p>
                  You will have 60 minutes to complete this test. A timer will
                  be displayed on the screen.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Question Format</h4>
                <p>
                  The test consists of multiple-choice questions. Each question
                  has only one correct answer.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Navigation</h4>
                <p>
                  You can navigate between questions using the Next and Previous
                  buttons. You can also review your answers before submitting.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Submission</h4>
                <p>
                  Once you have completed all questions, click the Submit button
                  to finish the test. You cannot change your answers after
                  submission.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Technical Issues</h4>
                <p>
                  If you encounter any technical issues during the test, please
                  contact the administrator immediately.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I have read and understood the instructions, and I agree to
                proceed with the test.
              </Label>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-3">
            <Button
              variant={'trident'}
              disabled={agreed}
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back
            </Button>
            <Button
              variant={'trident'}
              onClick={handleProceed}
              disabled={!agreed}
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-lg rounded-lg"
            >
              Proceed to Test
            </Button>
          </CardFooter>
        </Card> */
}
