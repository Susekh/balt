'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BookOpen, Clock, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import React from 'react';

interface ExamLists {
  id: number;
  name: string;
  questions: number;
  duration: number;
}

const ExamList = ({ availableTests }: { availableTests: ExamLists[] }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const router = useRouter();

  const navigateUser = (id: number, name: string) => {
    setActiveTestId(id);
    startTransition(() => {
      router.push(`/instructions/${id}?exam=${name}`);
    });
  };

  return (
    <>
      <div className="space-y-6">
        <Tabs defaultValue="available" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Tests</h2>
            <TabsList>
              <TabsTrigger value="available">Available Tests</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="available" className="space-y-4">
            {availableTests.map((test) => {
              const levelMatch = test.name.match(/LEVEL\s+[A-Z]/);
              const level = levelMatch ? levelMatch[0] : 'N/A';

              return (
                <Card key={test.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-[1fr_auto] items-center">
                    <div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{test.name}</CardTitle>
                          <Badge className="ml-2 bg-violet-800 font-bold">
                            {level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{test.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{test.questions} questions</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                    <div className="p-6">
                      <Button
                        variant={'trident'}
                        onClick={() => navigateUser(test.id, test.name)}
                        className="gap-2"
                        disabled={activeTestId === test.id && isPending}
                      >
                        {isPending && activeTestId === test.id ? (
                          <>
                            Wait <Loader className="animate-spin" />
                          </>
                        ) : (
                          <>
                            Start Test
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ExamList;
