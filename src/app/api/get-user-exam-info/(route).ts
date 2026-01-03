// import { NextRequest, NextResponse } from 'next/server';
// import { tokenValidation } from '../../../../services/token-validation-service';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient()

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     const token = authHeader?.split(' ')[1];

//     if (!token) {
//       return NextResponse.json({ message: 'Token available' }, { status: 403 });
//     }

//     const tokenData = await tokenValidation(token);

//     if (!tokenData?.success) {
//       return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
//     }
//     //@ts-expect-error: id exists in payload
//     const id: number = tokenData.payload.id;

//     const pendingExams = await prisma.examUsers.findMany({
//       where: {
//         id_user: id,
//         pending_status: 1
//       },
//       select: {
//         exams: {
//           select: {
//             id: true,
//             name: true,
//             qns_no: true,
//             sec_time: true
//           }
//         }
//       }
//     }) 
//     // console.log(pendingExams)
//     if(pendingExams === null)
//       return NextResponse.json({message: 'No result found'}, {status: 400})
//     // @ts-expect-error legacy code not needeed
//     const formattedResult = pendingExams.map(({ exams }) => {
//       const { sec_time, qns_no, ...rest } = exams;
    
//       return {
//         ...rest,
//         questions: qns_no,
//         duration: sec_time
//       };
//     });

//     return NextResponse.json(formattedResult, {status: 200})
//   } catch (err) {
//     console.log(err)
//     return NextResponse.json({message: 'Error'}, {status: 500})
//   }
// }
