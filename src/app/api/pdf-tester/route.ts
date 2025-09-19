import { NextResponse } from "next/server";
import { pdfGenerator } from "../../../../services/pdf-generator-service";

export async function GET() {
  try {
    const pdfBytes = await pdfGenerator('Chirag Arpit Sahoo', 'Kalinga Institute of Industrial Training', 'CSAIML')
    const buffer = Buffer.from(pdfBytes)
    return new NextResponse(buffer, { status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=certificate.pdf',
        'Content-Length': buffer.length.toString()
      }
     })
  }catch (err) {
    console.log('error::\n', err)
    return NextResponse.json({message: 'Something went wrong'}, {status: 500})
  }
}