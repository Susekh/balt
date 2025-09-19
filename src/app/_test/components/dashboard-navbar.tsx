import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import React from 'react'

interface UserData {
  name: string;
  email: string;
  phone: string;
}

const Navbar = ({data}: {data: UserData}) => {
  return (
    <>
    <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary md:ml-20">
            TMQ Test Portal
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <div className="font-medium">{data.name}</div>
            </div>

            <Avatar className="h-9 w-9 bg-blue-700 p-0.5">
              <AvatarImage alt={data.name} />
              <AvatarFallback>
                {data.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="destructive"
              size="default"
              // onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar