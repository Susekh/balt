'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Attempt {
  qid: string;
  answer: string | null;
  section: string;
  questionNo: number;
  correct: boolean;
  correctAnswer: string;
  timeRemaining: number;
  attemptedAt: string;
  regNo: string;
}

interface SectionReport {
  section: string;
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  marks: number;
}

interface Report {
  email: string;
  name: string;
  branch: string;
  date: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  marks: number;
  sectionReports: SectionReport[];
  attempts: Attempt[];
  regNo: string;
  lastSubmittedAt: string | null;
}

export default function ReportsPage() {
  const [date, setDate] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'marks' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState< string | null>(null);

  const fetchReports = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/report?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.data || []);

    } catch (err) {
      console.error('Error fetching reports:', err);

      setError('Error fetching reports, Please login again.')
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const allSections: string[] = Array.from(
    new Set(reports.flatMap((r) => r.sectionReports.map((s) => s.section)))
  );

  console.log("All sections  + Reports", allSections, reports);
  

  const formatDate = (isoDate: string | null) =>
    isoDate
      ? new Date(isoDate).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      : 'N/A';

  // ---------------- Filter & Sort ----------------
  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.regNo.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s)
      );
    }
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        if (sortField === 'marks') {
          return sortAsc ? a.marks - b.marks : b.marks - a.marks;
        } else {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
      });
    }
    return filtered;
  }, [reports, search, sortField, sortAsc]);

  // ---------------- CSV Download ----------------
  const downloadCSV = () => {
    if (!filteredReports.length) return;

    const headers = [
      'RegNo', 'Name', 'Branch', 'Email', 'Date',
      'Total Questions', 'Attempted', 'Correct', 'Wrong', 'Marks', 'Last Submitted At'
    ];

    allSections.forEach((s) => {
      headers.push(`${s} - Attempted`);
      headers.push(`${s} - Correct`);
      headers.push(`${s} - Wrong`);
      headers.push(`${s} - Marks`);
    });

    const csvData: string[][] = [headers];

    filteredReports.forEach((r) => {
      const row: string[] = [
        r.regNo,
        r.name,
        r.branch,
        r.email,
        r.date,
        r.totalQuestions.toString(),
        r.attemptedQuestions.toString(),
        r.correctQuestions.toString(),
        r.wrongQuestions.toString(),
        r.marks.toString(),
        formatDate(r.lastSubmittedAt),
      ];

      allSections.forEach((sectionName) => {
        const sec = r.sectionReports.find((s) => s.section === sectionName);
        row.push(sec?.attemptedQuestions?.toString() ?? '0');
        row.push(sec?.correctQuestions?.toString() ?? '0');
        row.push(sec?.wrongQuestions?.toString() ?? '0');
        row.push(sec?.marks?.toString() ?? '0');
      });

      csvData.push(row);
    });

    const csvContent = csvData.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `reports_${date}.csv`);
  };

  // ---------------- Excel Download ----------------
  const downloadExcel = () => {
    if (!filteredReports.length) return;

    type ExcelRow = Record<string, string | number>;
    const excelData: ExcelRow[] = filteredReports.map((r) => {
      const row: ExcelRow = {
        RegNo: r.regNo,
        Name: r.name,
        Branch: r.branch,
        Email: r.email,
        Date: r.date,
        'Total Questions': r.totalQuestions,
        Attempted: r.attemptedQuestions,
        Correct: r.correctQuestions,
        Wrong: r.wrongQuestions,
        Marks: r.marks,
        'Last Submitted At': formatDate(r.lastSubmittedAt),
      };

      allSections.forEach((s) => {
        const sec = r.sectionReports.find((sec) => sec.section === s);
        row[`${s} - Attempted`] = sec?.attemptedQuestions ?? 0;
        row[`${s} - Correct`] = sec?.correctQuestions ?? 0;
        row[`${s} - Wrong`] = sec?.wrongQuestions ?? 0;
        row[`${s} - Marks`] = sec?.marks ?? 0;
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reports_${date}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Exam Reports Summary</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Get Reports
        </button>
        <input
          type="text"
          placeholder="Search by Name, RegNo or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={() => {
            setSortField('marks');
            setSortAsc(sortField === 'marks' ? !sortAsc : true);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Sort by Marks {sortField === 'marks' ? (sortAsc ? '↑' : '↓') : ''}
        </button>
        <button
          onClick={() => {
            setSortField('name');
            setSortAsc(sortField === 'name' ? !sortAsc : true);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Sort by Name {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && filteredReports.length > 0 && (
        <>
          <div className="overflow-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">RegNo</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Branch</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Total Qs</th>
                  <th className="border p-2">Attempted</th>
                  <th className="border p-2">Correct</th>
                  <th className="border p-2">Wrong</th>
                  <th className="border p-2">Marks</th>
                  <th className="border p-2">Last Submitted</th>
                  {allSections.map((s, i) => (
                    <React.Fragment key={i}>
                      <th className="border p-2">{s} - Attempted</th>
                      <th className="border p-2">{s} - Correct</th>
                      <th className="border p-2">{s} - Wrong</th>
                      <th className="border p-2">{s} - Marks</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{r.regNo}</td>
                    <td className="border p-2">{r.name}</td>
                    <td className="border p-2">{r.branch}</td>
                    <td className="border p-2">{r.email}</td>
                    <td className="border p-2">{r.date}</td>
                    <td className="border p-2">{r.totalQuestions}</td>
                    <td className="border p-2">{r.attemptedQuestions}</td>
                    <td className="border p-2">{r.correctQuestions}</td>
                    <td className="border p-2">{r.wrongQuestions}</td>
                    <td className="border p-2">{r.marks}</td>
                    <td className="border p-2">{formatDate(r.lastSubmittedAt)}</td>

                    {allSections.map((s, i) => {
                      const sec = r.sectionReports.find((sec) => sec.section === s);
                      return (
                        <React.Fragment key={i}>
                          <td className="border p-2">{sec?.attemptedQuestions ?? 0}</td>
                          <td className="border p-2">{sec?.correctQuestions ?? 0}</td>
                          <td className="border p-2">{sec?.wrongQuestions ?? 0}</td>
                          <td className="border p-2">{sec?.marks ?? 0}</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download CSV
            </button>
            <button
              onClick={downloadExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Excel
            </button>
          </div>
        </>
      )}

      {!loading && !filteredReports.length && date && (
        <>
              <p className="text-gray-600">No reports found for {date}</p>  
              <p>{error}</p>
        </>

      )}
    </div>
  );
}
