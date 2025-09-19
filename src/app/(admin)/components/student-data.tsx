"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"

// Define the student data type
interface StudentDatum {
  email: string | null;
  name: string | null;
  branch: string | null;
  collegeName: string | null;
  contactNo: string | null;
  semester: string | null;
  score: number | null;
}


export function StudentData({results}: {results: StudentDatum[]}) {
  const [data] = useState<StudentDatum[]>(results)

  // Function to download table data as CSV
  const downloadCSV = () => {
    // Define CSV headers
    const headers = ["Email", "Name", "Branch", "College", "Semester", "Contact No", "Secured Mark", "Total Mark"]

    // Convert data to CSV format
    const csvData = data.map((student) => {
      return [
        student.email,
        student.name,
        student.branch,
        student.collegeName,
        student.semester,
        student.contactNo,
        student.score?.toString()??'N/A',
        25
      ]
    })

    // Combine headers and data
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "student_result.csv")
    link.style.visibility = "hidden"

    // Append to the document, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={downloadCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="group bg-amber-900 hover:text-black">
              <TableHead className="text-white font-bold group-hover:text-black">Sl No.</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Email</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Name</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Branch</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">College</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Semester</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Contact No</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Secured Mark</TableHead>
              <TableHead className="text-white font-bold group-hover:text-black">Total Mark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((student: StudentDatum, index: number) => (
              <TableRow key={index} className="even:bg-blue-300">
                <TableCell className="font-medium">{index}</TableCell>
                <TableCell className="font-medium">{student.email}</TableCell>
                <TableCell className="py-3">{student.name}</TableCell>
                <TableCell className="py-3">{student.branch}</TableCell>
                <TableCell className="py-3">{student.collegeName}</TableCell>
                <TableCell className="py-3">{student.semester}</TableCell>
                <TableCell className="py-3">{student.contactNo}</TableCell>
                <TableCell className="text-right py-3">{student.score??'N/A'}</TableCell>
                <TableCell>25</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
