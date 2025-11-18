'use client';

import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Check, Minus, Plus, X } from 'lucide-react';

interface QuestionContent {
  type: string;
  value: string;
}

interface Attempt {
  qid: string;
  answer: string;
  correct: boolean;
  correctAnswer: string;
  question?: QuestionContent[];
  subQuestion?: QuestionContent[];
  timeRemaining: number;
  attemptedAt: string;
}

interface SectionData {
  [key: string]: string[];
}

interface Report {
  email: string;
  name: string;
  testId: string;
  testTitle: string;
  totalQuestions: number;
  attemptedQuestions: number;
  regNo: string;
  branch: string;
  correctQuestions: number;
  wrongQuestions: number;
  marks: number;
  attempts: Attempt[];
  sections: SectionData;
}

interface QuestionType {
  id: string;
  title: string;
  duration: string;
}

export default function ReportsPage() {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'marks' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchQuestionTypes();
  }, []);

  const fetchQuestionTypes = async () => {
    setLoadingTypes(true);
    try {
      const res = await fetch('/api/v1/me');
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error('Failed to fetch question types');
      }
      const data = await res.json();
      if (data.success && data.questionList) {
        setQuestionTypes(data.questionList);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching question types:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error fetching question types. Please login again.',
      );
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchReports = async () => {
    if (!selectedTestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/report?testId=${selectedTestId}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      console.log('Reports ::', data);
      setReports(data.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Error fetching reports. Please login again.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate section-wise stats
  const calculateSectionStats = (report: Report) => {
    const stats: {
      [key: string]: { attempted: number; correct: number; wrong: number };
    } = {};

    Object.keys(report.sections).forEach((sectionName) => {
      const questionIds = report.sections[sectionName];
      const sectionAttempts = report.attempts.filter((att) =>
        questionIds.includes(att.qid),
      );

      stats[sectionName] = {
        attempted: sectionAttempts.length,
        correct: sectionAttempts.filter((att) => att.correct === true).length,
        wrong: sectionAttempts.filter((att) => att.correct === false).length,
      };
    });

    return stats;
  };

  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s),
      );
    }
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        if (sortField === 'marks') {
          return sortAsc ? a.marks - b.marks : b.marks - a.marks;
        } else {
          return sortAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
      });
    }
    return filtered;
  }, [reports, search, sortField, sortAsc]);

  const downloadCSV = () => {
  if (!filteredReports.length) return;

  const headers = [
    'Name',
    'Email',
    'RegNo',
    'Branch',
    'Test ID',
    'Test Title',
    'Total Questions',
    'Attempted',
    'Correct',
    'Wrong',
    'Marks',
    'Verbal Attempted',
    'Verbal Correct',
    'Verbal Wrong',
    'Analytical Attempted',
    'Analytical Correct',
    'Analytical Wrong',
    'Numerical Attempted',
    'Numerical Correct',
    'Numerical Wrong',
  ];

  const csvData: string[][] = [headers];

  filteredReports.forEach((r) => {
    const sectionStats = calculateSectionStats(r);

    const row: string[] = [
      r.name,
      r.email,
      r.regNo,
      r.branch,
      r.testId,
      r.testTitle,
      r.totalQuestions.toString(),
      r.attemptedQuestions.toString(),
      r.correctQuestions.toString(),
      r.wrongQuestions.toString(),
      r.marks.toString(),

      // Verbal
      (sectionStats.verbal?.attempted || 0).toString(),
      (sectionStats.verbal?.correct || 0).toString(),
      (sectionStats.verbal?.wrong || 0).toString(),

      // Analytical
      (sectionStats.analytical?.attempted || 0).toString(),
      (sectionStats.analytical?.correct || 0).toString(),
      (sectionStats.analytical?.wrong || 0).toString(),

      // Numerical
      (sectionStats.numerical?.attempted || 0).toString(),
      (sectionStats.numerical?.correct || 0).toString(),
      (sectionStats.numerical?.wrong || 0).toString(),
    ];

    csvData.push(row);
  });

  const csvContent = csvData.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `reports_${selectedTestId}.csv`);
};


  const downloadExcel = () => {
  if (!filteredReports.length) return;

  type ExcelRow = Record<string, string | number>;
  const excelData: ExcelRow[] = filteredReports.map((r) => {
    const sectionStats = calculateSectionStats(r);

    return {
      Name: r.name,
      Email: r.email,
      RegNo: r.regNo,
      Branch: r.branch,
      'Test ID': r.testId,
      'Test Title': r.testTitle,
      'Total Questions': r.totalQuestions,
      Attempted: r.attemptedQuestions,
      Correct: r.correctQuestions,
      Wrong: r.wrongQuestions,
      Marks: r.marks,

      'Verbal Attempted': sectionStats.verbal?.attempted || 0,
      'Verbal Correct': sectionStats.verbal?.correct || 0,
      'Verbal Wrong': sectionStats.verbal?.wrong || 0,

      'Analytical Attempted': sectionStats.analytical?.attempted || 0,
      'Analytical Correct': sectionStats.analytical?.correct || 0,
      'Analytical Wrong': sectionStats.analytical?.wrong || 0,

      'Numerical Attempted': sectionStats.numerical?.attempted || 0,
      'Numerical Correct': sectionStats.numerical?.correct || 0,
      'Numerical Wrong': sectionStats.numerical?.wrong || 0,
    };
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reports');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `reports_${selectedTestId}.xlsx`);
};


  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Exam Reports Summary</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          disabled={loadingTypes}
          className="border rounded px-3 py-2 min-w-[200px]"
        >
          <option value="">Select Test Type</option>
          {questionTypes.map((qt) => (
            <option key={qt.id} value={qt.id}>
              {qt.title} ({qt.duration})
            </option>
          ))}
        </select>

        <button
          onClick={fetchReports}
          disabled={!selectedTestId || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Get Reports'}
        </button>

        <input
          type="text"
          placeholder="Search by Name or Email"
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

      {loading && <p>Loading reports...</p>}

      {!loading && filteredReports.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredReports.length} result(s) for{' '}
            <strong>
              {questionTypes.find((qt) => qt.id === selectedTestId)?.title}
            </strong>
          </div>

          <div className="overflow-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Expand</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">RegNo</th>
                  <th className="border p-2">Branch</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Test ID</th>
                  <th className="border p-2">Test Title</th>
                  <th className="border p-2">Total Qs</th>
                  <th className="border p-2">Attempted</th>
                  <th className="border p-2">Correct</th>
                  <th className="border p-2">Wrong</th>
                  <th className="border p-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, idx) => {
                  const sectionStats = calculateSectionStats(r);
                  const isExpanded = expandedRow === idx;

                  return (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-gray-50">
                        <td className="border p-2 text-center">
                          <button
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : idx)
                            }
                            className="text-blue-600 hover:cursor-pointer hover:text-blue-800 font-bold"
                          >
                            {isExpanded ? <Minus/> : <Plus/>}
                          </button>
                        </td>
                        <td className="border p-2">{r.name}</td>
                        <td className="border p-2">{r.regNo}</td>
                        <td className="border p-2">{r.branch}</td>
                        <td className="border p-2">{r.email}</td>
                        <td className="border p-2">{r.testId}</td>
                        <td className="border p-2">{r.testTitle}</td>
                        <td className="border p-2">{r.totalQuestions}</td>
                        <td className="border p-2">{r.attemptedQuestions}</td>
                        <td className="border p-2 text-green-600">
                          {r.correctQuestions}
                        </td>
                        <td className="border p-2 text-red-600">
                          {r.wrongQuestions}
                        </td>
                        <td className="border p-2 font-semibold">
                          {r.marks ? r.marks.toFixed(2) : 'N/A'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="border p-4 bg-gray-50">
                            <div className="space-y-4">
                              <h3 className="font-bold text-lg mb-2">
                                Section-wise Breakdown
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.keys(sectionStats).map(
                                  (sectionName) => (
                                    <div
                                      key={sectionName}
                                      className="border rounded p-3 bg-white"
                                    >
                                      <h4 className="font-semibold text-md mb-2 capitalize">
                                        {sectionName}
                                      </h4>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span>Attempted:</span>
                                          <span className="font-medium">
                                            {
                                              sectionStats[sectionName]
                                                .attempted
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Correct:</span>
                                          <span className="font-medium text-green-600">
                                            {sectionStats[sectionName].correct}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Wrong:</span>
                                          <span className="font-medium text-red-600">
                                            {sectionStats[sectionName].wrong}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Unattempted:</span>
                                          <span className="font-medium text-gray-600">
                                            {(r.sections[sectionName]?.length ||
                                              0) -
                                              sectionStats[sectionName]
                                                .attempted}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>

                              <div className="mt-4">
                                <h4 className="font-semibold text-md mb-2">
                                  All Attempts
                                </h4>
                                <div className="max-h-64 overflow-y-auto">
                                  <table className="w-full text-xs border">
                                    <thead className="bg-gray-100 sticky top-0">
                                      <tr>
                                        <th className="border p-1">Q ID</th>
                                        <th className="border p-1">Answer</th>
                                        <th className="border p-1">
                                          Correct Answer
                                        </th>
                                        <th className="border p-1">Status</th>
                                        <th className="border p-1">
                                          Time Left
                                        </th>
                                        <th className="border p-1">
                                          Attempted At
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {r.attempts.map((att, attIdx) => (
                                        <tr
                                          key={attIdx}
                                          className={
                                            att.correct
                                              ? 'bg-green-50'
                                              : 'bg-red-50'
                                          }
                                        >
                                          <td className="border p-1">
                                            {att.qid}
                                          </td>
                                          <td className="border p-1">
                                            {att.answer || 'N/A'}
                                          </td>
                                          <td className="border p-1">
                                            {att.correctAnswer || 'N/A'}
                                          </td>
                                          <td className="border p-1">
                                            {att.correct ? (
                                              <span className="text-green-600 font-semibold">
                                                <Check/>
                                              </span>
                                            ) : (
                                              <span className="text-red-600 font-semibold">
                                                <X/>
                                              </span>
                                            )}
                                          </td>
                                          <td className="border p-1">
                                            {Math.floor(att.timeRemaining / 60)}
                                            m {att.timeRemaining % 60}s
                                          </td>
                                          <td className="border p-1">
                                            {new Date(
                                              att.attemptedAt,
                                            ).toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
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

      {!loading && !filteredReports.length && selectedTestId && (
        <p className="text-gray-600">No reports found for the selected test.</p>
      )}
    </div>
  );
}
