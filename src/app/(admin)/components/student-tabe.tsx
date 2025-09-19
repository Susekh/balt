"use client";
import { useState } from "react";

export interface SectionScores {
  English: number;
  "Analytical Ability": number;
  "Quantitative Ability": number;
}

export interface StudentDatum {
  slNo: number;
  email: string;
  name: string;
  branch: string;
  contactNo: string;
  semester: string;
  finalScore: number;  // raw score (like old "score")
  totalScore: number;  // sum of all sections
  sectionScores: SectionScores;
  lastLogin: string | null;
}

interface Props {
  data: StudentDatum[];
}

export default function StudentDataTable({ data }: Props) {
  const [filterDate, setFilterDate] = useState<string>("");

  const filteredData = data.filter((student) => {
    if (!filterDate) return true;
    if (!student.lastLogin) return false;
    return student.lastLogin.startsWith(filterDate); // yyyy-mm-dd format
  });

      console.log("student data ::", filteredData);

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
      <div className="mb-4 flex items-center gap-3">
        {/* 🔹 Date Filter */}
        <label className="text-sm font-medium">Filter by Date:</label>
        <input
          type="date"
          className="border rounded p-1 text-sm"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Sl. No</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Branch</th>
            <th className="p-2 border">Semester</th>
            <th className="p-2 border">Contact</th>
            <th className="p-2 border">English</th>
            <th className="p-2 border">Analytical</th>
            <th className="p-2 border">Quantitative</th>
            <th className="p-2 border">Total Score</th>
            <th className="p-2 border">Final Score</th>
            <th className="p-2 border">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((student) => (
            <tr key={student.slNo} className="hover:bg-gray-50">
              <td className="p-2 border">{student.slNo}</td>
              <td className="p-2 border">{student.name}</td>
              <td className="p-2 border">{student.email}</td>
              <td className="p-2 border">{student.branch}</td>
              <td className="p-2 border">{student.semester}</td>
              <td className="p-2 border">{student.contactNo}</td>
              <td className="p-2 border">{student.sectionScores.English}</td>
              <td className="p-2 border">
                {student.sectionScores["Analytical Ability"]}
              </td>
              <td className="p-2 border">
                {student.sectionScores["Quantitative Ability"]}
              </td>
              <td className="p-2 border font-semibold">{student.totalScore}</td>
              <td className="p-2 border font-semibold">{student.finalScore}</td>
              <td className="p-2 border">
                {student.lastLogin
                  ? new Date(student.lastLogin).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
