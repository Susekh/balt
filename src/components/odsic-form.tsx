'use client';

import type React from 'react';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { diploma_colleges } from '@/misc/list-of-colleges';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Must enter username' }),
  branch: z.string().min(2, { message: 'Must enter branch' }),
  collegeName: z.string().min(2, { message: 'Must enter college name' }),
  contactNo: z.string().min(2, { message: 'Must enter contact number' }),
  semester: z.string().min(1, { message: 'Must enter semester' }),
});

interface PersonalInfo {
  name: string | null,
  branch: string | null,
  collegeName: string | null,
  contactNo: string | null,
  semester: string | null
  loginCount: number
}

const OdsicForm = ({data}: {data: PersonalInfo}) => {
  console.log(data)
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name??'',
      branch: data.branch??'',
      collegeName: data.collegeName??'',
      contactNo: data.contactNo??'',
      semester: data.semester??''
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError('');
    try {
      // const response = await fetch('/api/signin', {
      //   method: 'POST',
      //   body: JSON.stringify(values),
      // });
      const response = await fetch('/api/odsic-personal-info', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (response.status === 400) {
        setError('Invalid credentials');
        return;
      }

      if (response.status === 404) {
        setError('User does not exists');
        return;
      }

      if (!response.ok) {
        setError('Something went wrong');
        return;
      }

      if (response.status === 200) {
        router.replace(`/instructions/${200}?exam=ODSIC`);
      }
    } catch {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>

      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='CSE/CSAIML'
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="collegeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Name</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {diploma_colleges?.map((item, idx) => (
                            <SelectItem key={idx} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="contactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact No.</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              variant={'trident'}
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (<Loader className='animate-spin'/>) : `${data.loginCount > 0 ? 'Resume' : 'Start'} Exam`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OdsicForm;
