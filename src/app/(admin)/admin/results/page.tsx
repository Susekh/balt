'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface SectionScores {
  English: number;
  'Analytical Ability': number;
  'Quantitative Ability': number;
}

interface Result {
  id: string;
  regNo: string;
  name: string;
  email: string;
  branch: string;
  collegeName: string;
  contactNo: string;
  sectionScores: SectionScores;
  totalScore: number;
  finalScore: number;
  finalMarks: number;
  submittedAt: string;
}

interface ApiResponse {
  data: Result[];
  message?: string;
}

export default function AdminResultsDashboard() {
  const [date, setDate] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [searchName, setSearchName] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'finalScore'>('finalScore');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResults = async (selectedDate: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/results?date=${selectedDate}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to fetch results');
      }
      const data: ApiResponse = await res.json();
      setResults(data.data || []);
      setFilteredResults(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchResults(date);
    } else {
      setResults([]);
      setFilteredResults([]);
    }
  }, [date]);

  useEffect(() => {
    const filtered = results.filter((result) =>
      result.name?.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchName, results]);

  useEffect(() => {
    const sorted = [...filteredResults].sort((a, b) => {
      if (sortKey === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      } else {
        return b.finalScore - a.finalScore;
      }
    });
    setFilteredResults(sorted);
  }, [sortKey]);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value);
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchName(e.target.value);
  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setSortKey(e.target.value as 'name' | 'finalScore');

  const downloadCSV = () => {
    const headers = [
      'Name',
      'RegNo',
      'Email',
      'Contact No',
      'College Name',
      'Branch',
      'English',
      'Analytical Ability',
      'Quantitative Ability',
      'Final Score',
      'Final Marks',
      'Total Score',
      'Submitted At',
    ];
    const rows = filteredResults.map((result) => [
      result.name,
      result.regNo,
      result.email,
      result.contactNo,
      result.collegeName,
      result.branch,
      result.sectionScores.English,
      result.sectionScores['Analytical Ability'],
      result.sectionScores['Quantitative Ability'],
      result.finalScore,
      result.finalMarks,
      result.totalScore,
      new Date(result.submittedAt).toLocaleString(),
    ]);

    const csvContent =
      headers.join(',') +
      '\n' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `results_${date}.csv`);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredResults.map((result) => ({
        Name: result.name,
        'Reg No': result.regNo,
        Email: result.email,
        'Contact No': result.contactNo,
        'College Name': result.collegeName,
        Branch: result.branch,
        English: result.sectionScores.English,
        'Analytical Ability': result.sectionScores['Analytical Ability'],
        'Quantitative Ability': result.sectionScores['Quantitative Ability'],
        'Final Score': result.finalScore,
        'Final Marks': result.finalMarks,
        'Total Score': result.totalScore,
        'Submitted At': new Date(result.submittedAt).toLocaleString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `results_${date}.xlsx`);
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-center text-indigo-700">
        Admin Results Dashboard
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 justify-center items-end">
        <div>
          <label className="block mb-1 font-medium text-gray-600 text-sm">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-600 text-sm">Search Name</label>
          <input
            type="text"
            value={searchName}
            onChange={handleSearchChange}
            placeholder="Enter name..."
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-600 text-sm">Sort By</label>
          <select
            value={sortKey}
            onChange={handleSortChange}
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="finalScore">Final Score (High to Low)</option>
            <option value="name">Name (A to Z)</option>
          </select>
        </div>

        <div className="space-x-2">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition text-sm"
          >
            Download CSV
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition text-sm"
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && filteredResults.length === 0 && date && (
        <p className="text-center text-gray-500">No results found for this date.</p>
      )}

      {!loading && filteredResults.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-300 shadow-md bg-white">
          <table className="w-full min-w-[1100px] table-auto border-collapse text-gray-700 text-sm md:text-base">
            <thead className="bg-indigo-50 text-gray-600">
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Reg No</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Contact No</th>
                <th className="border px-4 py-2">College Name</th>
                <th className="border px-4 py-2">Branch</th>
                <th className="border px-4 py-2">English</th>
                <th className="border px-4 py-2">Analytical</th>
                <th className="border px-4 py-2">Quantitative</th>
                <th className="border px-4 py-2">Final Score</th>
                <th className="border px-4 py-2">Final Marks</th>
                <th className="border px-4 py-2">Total Score</th>
                <th className="border px-4 py-2">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className="even:bg-gray-50 hover:bg-indigo-50 transition">
                  <td className="border px-4 py-2">{result.name}</td>
                  <td className="border px-4 py-2">{result.regNo}</td>
                  <td className="border px-4 py-2">{result.email}</td>
                  <td className="border px-4 py-2">{result.contactNo}</td>
                  <td className="border px-4 py-2">{result.collegeName}</td>
                  <td className="border px-4 py-2">{result.branch}</td>
                  <td className="border px-4 py-2">{result.sectionScores.English}</td>
                  <td className="border px-4 py-2">{result.sectionScores['Analytical Ability']}</td>
                  <td className="border px-4 py-2">{result.sectionScores['Quantitative Ability']}</td>
                  <td className="border px-4 py-2">{result.finalScore}</td>
                  <td className="border px-4 py-2">{result.finalMarks}</td>
                  <td className="border px-4 py-2">{result.totalScore}</td>
                  <td className="border px-4 py-2">
                    {new Date(result.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
