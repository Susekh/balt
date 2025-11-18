"use client";

import { useState, useEffect, useMemo } from "react";
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

interface QuestionContent {
  type: string;
  value: string;
}

interface Attempt {
  qid: string;
  answer: string | null;
  correct: boolean | null;
  correctAnswer?: string | null;
  question?: QuestionContent[] | string | null;
  subQuestion?: QuestionContent[] | string | null;
  timeRemaining: number;
  attemptedAt: string;
}

interface TestInfo {
  id: string;
  title: string;
}

interface AttemptResponse {
  email: string;
  testId: string;
  attempts: Attempt[];
}

interface SectionStats {
  name: string;
  attempts: Attempt[];
  total: number;
  correct: number;
  wrong: number;
  notGraded: number;
}

export default function Dashboard() {
  const [email, setEmail] = useState<string>("");
  const [selectedQid, setSelectedQid] = useState<string>("");
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [attemptData, setAttemptData] = useState<AttemptResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Fetch test list from /api/v1/me
  useEffect(() => {
    const loadTests = async () => {
      try {
        const res = await fetch("/api/v1/me");
        const data = await res.json();
        if (res.ok && data.questionList) {
          setTests(
            data.questionList.map((q: { id: string; title: string }) => ({
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
    if (!email || !selectedQid) {
      setError("Please enter email and select test.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Set cookies for the API to read
      document.cookie = `user-session=${encodeURIComponent(
        JSON.stringify({ email })
      )}; path=/`;
      
      const selectedTest = tests.find((t) => t.id === selectedQid);
      if (selectedTest) {
        document.cookie = `active_test=${encodeURIComponent(
          JSON.stringify({ id: selectedTest.id, title: selectedTest.title })
        )}; path=/`;
      }

      const res = await fetch("/api/v1/get-attempts");
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to fetch attempts");
        setAttemptData(null);
      } else {
        setAttemptData(data);
        setSelectedSection("all"); // Reset section filter
      }
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setError("Something went wrong while fetching attempts");
      setAttemptData(null);
    } finally {
      setLoading(false);
    }
  };

  // Group attempts by section
  const sectionStats = useMemo((): SectionStats[] => {
    if (!attemptData) return [];

    const verbal = attemptData.attempts.filter((a) => a.qid.startsWith('s1'));
    const analytical = attemptData.attempts.filter((a) => a.qid.startsWith('s2'));
    const numerical = attemptData.attempts.filter((a) => a.qid.startsWith('s3'));

    const createStats = (name: string, attempts: Attempt[]): SectionStats => ({
      name,
      attempts,
      total: attempts.length,
      correct: attempts.filter((a) => a.correct === true).length,
      wrong: attempts.filter((a) => a.correct === false).length,
      notGraded: attempts.filter((a) => a.correct === null).length,
    });

    return [
      createStats("Verbal", verbal),
      createStats("Analytical", analytical),
      createStats("Numerical", numerical),
    ].filter(s => s.total > 0); // Only show sections with attempts
  }, [attemptData]);

  // Filter attempts based on selected section
  const filteredAttempts = useMemo(() => {
    if (!attemptData) return [];
    if (selectedSection === "all") return attemptData.attempts;
    
    const sectionPrefix = 
      selectedSection === "Verbal" ? "s1" :
      selectedSection === "Analytical" ? "s2" :
      selectedSection === "Numerical" ? "s3" : "";
    
    return attemptData.attempts.filter(a => a.qid.startsWith(sectionPrefix));
  }, [attemptData, selectedSection]);

  const downloadCSV = () => {
    if (!attemptData || filteredAttempts.length === 0) return;

    const headers = [
      "Question ID",
      "Section",
      "Answer",
      "Correct Answer",
      "Result",
      "Time Remaining",
      "Attempted At",
    ];

    const getSectionName = (qid: string) => {
      if (qid.startsWith('s1')) return "Verbal";
      if (qid.startsWith('s2')) return "Analytical";
      if (qid.startsWith('s3')) return "Numerical";
      return "Unknown";
    };

    const rows = filteredAttempts.map((a) => [
      a.qid,
      getSectionName(a.qid),
      a.answer ?? "—",
      a.correctAnswer ?? "—",
      a.correct === null ? "Not Graded" : a.correct ? "Correct" : "Wrong",
      `${a.timeRemaining}s`,
      new Date(a.attemptedAt).toLocaleString(),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `attempts_${email}_${selectedQid}_${selectedSection}.csv`);
  };

  const downloadExcel = () => {
    if (!attemptData || filteredAttempts.length === 0) return;

    const getSectionName = (qid: string) => {
      if (qid.startsWith('s1')) return "Verbal";
      if (qid.startsWith('s2')) return "Analytical";
      if (qid.startsWith('s3')) return "Numerical";
      return "Unknown";
    };

    const worksheet = XLSX.utils.json_to_sheet(
      filteredAttempts.map((a) => ({
        "Question ID": a.qid,
        "Section": getSectionName(a.qid),
        Answer: a.answer ?? "—",
        "Correct Answer": a.correctAnswer ?? "—",
        Result:
          a.correct === null ? "Not Graded" : a.correct ? "Correct" : "Wrong",
        "Time Remaining": `${a.timeRemaining}s`,
        "Attempted At": new Date(a.attemptedAt).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attempts");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `attempts_${email}_${selectedQid}_${selectedSection}.xlsx`);
  };

  const testTitle = tests.find((t) => t.id === selectedQid)?.title;

  const getSectionName = (qid: string) => {
    if (qid.startsWith('s1')) return "Verbal";
    if (qid.startsWith('s2')) return "Analytical";
    if (qid.startsWith('s3')) return "Numerical";
    return "Unknown";
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case "Verbal": return "bg-blue-100 text-blue-800";
      case "Analytical": return "bg-purple-100 text-purple-800";
      case "Numerical": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Student Exam Attempts Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            type="email"
            placeholder="Enter student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />

          <select
            className="border rounded-md p-2 flex-1"
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
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded">
          {error}
        </div>
      )}

      {attemptData && filteredAttempts.length > 0 && (
        <>
          {/* Header with Actions */}
          <Card className="mb-4 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Attempts for {attemptData.email}
                  </CardTitle>
                  {testTitle && (
                    <p className="text-sm text-gray-600 mt-1">Test: {testTitle}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={downloadCSV}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Download CSV
                  </Button>
                  <Button
                    onClick={downloadExcel}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Download Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Section Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card 
              className={`shadow cursor-pointer transition-all ${
                selectedSection === "all" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedSection("all")}
            >
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-2">All Sections</p>
                <p className="text-3xl font-bold">{attemptData.attempts.length}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-600">
                    {attemptData.attempts.filter((a) => a.correct === true).length} correct
                  </span>
                  {" | "}
                  <span className="text-red-600">
                    {attemptData.attempts.filter((a) => a.correct === false).length} wrong
                  </span>
                </div>
              </CardContent>
            </Card>

            {sectionStats.map((section) => (
              <Card
                key={section.name}
                className={`shadow cursor-pointer transition-all ${
                  selectedSection === section.name ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedSection(section.name)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{section.name}</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getSectionColor(section.name)}`}>
                      {section.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{section.total}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="text-green-600">{section.correct} correct</span>
                    {" | "}
                    <span className="text-red-600">{section.wrong} wrong</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Attempts Table */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {selectedSection === "all" 
                    ? `All Attempts (${filteredAttempts.length})`
                    : `${selectedSection} Section (${filteredAttempts.length})`
                  }
                </CardTitle>
                {selectedSection !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSection("all")}
                  >
                    Show All Sections
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question ID</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Time Remaining</TableHead>
                    <TableHead>Attempted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((a, idx) => {
                    const sectionName = getSectionName(a.qid);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{a.qid}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getSectionColor(sectionName)}`}>
                            {sectionName}
                          </span>
                        </TableCell>
                        <TableCell>{a.answer ?? "—"}</TableCell>
                        <TableCell>{a.correctAnswer ?? "—"}</TableCell>
                        <TableCell
                          className={
                            a.correct === null
                              ? "text-gray-600"
                              : a.correct
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {a.correct === null
                            ? "Not Graded"
                            : a.correct
                            ? "✓ Correct"
                            : "✗ Wrong"}
                        </TableCell>
                        <TableCell>{a.timeRemaining}s</TableCell>
                        <TableCell>
                          {new Date(a.attemptedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Section Breakdown */}
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Section-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectionStats.map((section) => (
                  <div key={section.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{section.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSectionColor(section.name)}`}>
                        {section.total} Questions
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold">{section.total}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Correct</p>
                        <p className="text-2xl font-bold text-green-600">{section.correct}</p>
                        <p className="text-xs text-gray-500">
                          {section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <p className="text-sm text-gray-600">Wrong</p>
                        <p className="text-2xl font-bold text-red-600">{section.wrong}</p>
                        <p className="text-xs text-gray-500">
                          {section.total > 0 ? Math.round((section.wrong / section.total) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Not Graded</p>
                        <p className="text-2xl font-bold text-gray-600">{section.notGraded}</p>
                        <p className="text-xs text-gray-500">
                          {section.total > 0 ? Math.round((section.notGraded / section.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !error && (!attemptData || filteredAttempts.length === 0) && (
        <Card className="shadow-lg">
          <CardContent className="py-12">
            <p className="text-gray-500 text-center">
              No attempts to display. Enter email and select test to fetch results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}