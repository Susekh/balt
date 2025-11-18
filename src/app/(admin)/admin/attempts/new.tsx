"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

interface Attempt {
  qid: string;
  regNo: string;
  section: string;
  questionNo: number;
  answer: string | null;
  correct: boolean;
  correctAnswer: string;
  timeRemaining: number;
  attemptedAt: string;
}

interface TestInfo {
  id: string;
  title: string;
}

export default function Dashboard() {
  const [email, setEmail] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [selectedQid, setSelectedQid] = useState<string>("");
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch test list from /api/v1/me
  useEffect(() => {
    const loadTests = async () => {
      try {
        const res = await fetch("/api/v1/me");
        const data = await res.json();
        if (res.ok && data.questionList) {
          setTests(
            data.questionList.map((q: any) => ({
              id: q.id,
              title: q.title,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load test list", err);
      }
    };

    loadTests();
  }, []);

  const fetchAttempts = async () => {
    if (!email || !date || !selectedQid) {
      setError("Please enter email, date and select test.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/v1/get-attempts?email=${email}&date=${date}&qid=${selectedQid}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to fetch attempts");
        setAttempts([]);
      } else {
        setAttempts(data.attempts || []);
      }
    } catch {
      setError("Something went wrong while fetching attempts");
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (attempts.length === 0) return;

    const headers = [
      "Registration Number",
      "Q. No",
      "Section",
      "Answer",
      "Correct Answer",
      "Result",
      "Time Remaining",
      "Attempted At",
    ];

    const rows = attempts.map((a) => [
      a.regNo,
      a.questionNo,
      a.section,
      a.answer ?? "—",
      a.correctAnswer,
      a.correct ? "Correct" : "Wrong",
      `${a.timeRemaining}s`,
      new Date(a.attemptedAt).toLocaleString(),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `attempts_${email}_${date}_${selectedQid}.csv`);
  };

  const downloadExcel = () => {
    if (attempts.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      attempts.map((a) => ({
        "Registration Number": a.regNo,
        "Q. No": a.questionNo,
        Section: a.section,
        Answer: a.answer ?? "—",
        "Correct Answer": a.correctAnswer,
        Result: a.correct ? "Correct" : "Wrong",
        "Time Remaining": `${a.timeRemaining}s`,
        "Attempted At": new Date(a.attemptedAt).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attempts");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `attempts_${email}_${date}_${selectedQid}.xlsx`);
  };

  const testTitle = tests.find((t) => t.id === selectedQid)?.title;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Exam Attempts Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            type="email"
            placeholder="Enter student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Select Test Dropdown */}
          <select
            className="border rounded-md p-2"
            value={selectedQid}
            onChange={(e) => setSelectedQid(e.target.value)}
          >
            <option value="">Select Test</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <Button onClick={fetchAttempts} disabled={loading}>
            {loading ? "Loading..." : "Fetch Attempts"}
          </Button>

          {attempts.length > 0 && (
            <div className="flex gap-2 ml-2">
              <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700">
                Download CSV
              </Button>
              <Button onClick={downloadExcel} className="bg-blue-600 hover:bg-blue-700">
                Download Excel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {attempts.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Attempts on {date} {testTitle && `- ${testTitle}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Q. No</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Time Remaining</TableHead>
                  <TableHead>Attempted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((a, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{a.regNo}</TableCell>
                    <TableCell>{a.section}</TableCell>
                    <TableCell>{a.questionNo}</TableCell>
                    <TableCell>{a.answer ?? "—"}</TableCell>
                    <TableCell>{a.correctAnswer}</TableCell>
                    <TableCell className={a.correct ? "text-green-600" : "text-red-600"}>
                      {a.correct ? "Correct" : "Wrong"}
                    </TableCell>
                    <TableCell>{a.timeRemaining}s</TableCell>
                    <TableCell>{new Date(a.attemptedAt).toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && !error && attempts.length === 0 && (
        <p className="text-gray-500 text-center mt-6">
          No attempts to display. Enter email, date and test to fetch results.
        </p>
      )}
    </div>
  );
}
