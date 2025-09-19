'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MailIcon, Phone } from 'lucide-react';
import React from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

function ExamUserProfile({data}: {data: UserData}) {
  

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24 bg-blue-700 p-1">
                <AvatarImage alt={data?.name} />
                <AvatarFallback className="text-2xl">
                  {data?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">{data?.name}</h2>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
                <span>{data?.email}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{data?.phone}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {/* <Button variant="outline" className="w-full">
                  Edit Profile
                </Button> */}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default ExamUserProfile;
