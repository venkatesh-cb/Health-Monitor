import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Building, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  original_filename: string | null;
  lab_name: string | null;
  lab_no: string | null;
  collection_date: string | null;
  report_date: string | null;
  submitter_name: string;
  patient_id: string | null;
  confidence: number | null;
}

interface Patient {
  id: string;
  patient_name: string | null;
  submitter_name: string;
  relation: string;
  age: string | null;
  gender: string | null;
}

interface TestResult {
  id: string;
  test_name: string;
  test_category: string | null;
  result_value: string | null;
  numeric_value: string | null;
  unit: string | null;
  ref_low: string | null;
  ref_high: string | null;
  flag: string | null;
  standard_test_name: string | null;
  loinc_code: string | null;
}

interface ExtraInfo {
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  blood_group: string | null;
  allergies: string | null;
  notes: string | null;
}

const ReportDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [extraInfo, setExtraInfo] = useState<ExtraInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReportData();
    }
  }, [id]);

  const fetchReportData = async () => {
    try {
      // Fetch report
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (reportError) throw reportError;
      if (!reportData) {
        navigate("/home");
        return;
      }
      setReport(reportData);

      // Fetch patient if exists
      if (reportData.patient_id) {
        const { data: patientData } = await supabase
          .from("patients")
          .select("*")
          .eq("id", reportData.patient_id)
          .maybeSingle();

        if (patientData) setPatient(patientData);
      }

      // Fetch test results
      const { data: resultsData } = await supabase
        .from("test_results")
        .select("*")
        .eq("report_id", id)
        .order("test_category", { ascending: true });

      if (resultsData) setTestResults(resultsData);

      // Fetch extra info
      const { data: extraData } = await supabase
        .from("extra_info")
        .select("*")
        .eq("report_id", id)
        .maybeSingle();

      if (extraData) setExtraInfo(extraData);

      // Also check session storage for extra info
      const sessionExtra = sessionStorage.getItem("extraInfo");
      if (sessionExtra && !extraData) {
        setExtraInfo(JSON.parse(sessionExtra));
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFlagColor = (flag: string | null) => {
    if (!flag) return "";
    const lowerFlag = flag.toLowerCase();
    if (lowerFlag === "high" || lowerFlag === "h" || lowerFlag === "critical high") {
      return "bg-destructive/10 text-destructive";
    }
    if (lowerFlag === "low" || lowerFlag === "l" || lowerFlag === "critical low") {
      return "bg-warning/10 text-warning";
    }
    if (lowerFlag === "normal" || lowerFlag === "n") {
      return "bg-success/10 text-success";
    }
    return "bg-warning/10 text-warning";
  };

  const formatReferenceRange = (low: string | null, high: string | null) => {
    if (!low && !high) return "-";
    if (low && high) return `${low} - ${high}`;
    if (low) return `> ${low}`;
    if (high) return `< ${high}`;
    return "-";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="h-1 bg-primary w-full" />
        <div className="py-6">
          <div className="container flex items-center justify-center">
            <img src="/logo-cb.png" alt="CodeByte" className="h-10" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Report Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {report.original_filename || "Health Report"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Submitted by {report.submitter_name}
              </p>
            </div>
            {report.confidence && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold text-primary">
                  {Math.round(report.confidence * 100)}%
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.lab_name && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Lab</p>
                  <p className="text-sm font-medium">{report.lab_name}</p>
                </div>
              </div>
            )}
            {report.lab_no && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Lab No</p>
                  <p className="text-sm font-medium">{report.lab_no}</p>
                </div>
              </div>
            )}
            {report.collection_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Collection Date</p>
                  <p className="text-sm font-medium">{report.collection_date}</p>
                </div>
              </div>
            )}
            {report.report_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Report Date</p>
                  <p className="text-sm font-medium">{report.report_date}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient & Extra Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Patient Info */}
          {patient && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {patient.patient_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{patient.patient_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Relation</p>
                  <p className="font-medium">{patient.relation}</p>
                </div>
                {patient.age && (
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium">{patient.age}</p>
                  </div>
                )}
                {patient.gender && (
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extra Info */}
          {extraInfo && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {extraInfo.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{extraInfo.phone}</p>
                  </div>
                )}
                {extraInfo.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{extraInfo.email}</p>
                  </div>
                )}
                {extraInfo.blood_group && (
                  <div>
                    <p className="text-xs text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{extraInfo.blood_group}</p>
                  </div>
                )}
                {extraInfo.emergency_contact && (
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{extraInfo.emergency_contact}</p>
                  </div>
                )}
                {extraInfo.allergies && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Allergies</p>
                    <p className="font-medium">{extraInfo.allergies}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test Results Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No test results available yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Reference Range</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{test.standard_test_name || test.test_name}</p>
                          {test.loinc_code && (
                            <p className="text-xs text-muted-foreground">
                              LOINC: {test.loinc_code}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{test.test_category || "-"}</TableCell>
                      <TableCell className="font-semibold">
                        {test.result_value || test.numeric_value || "-"}
                      </TableCell>
                      <TableCell>{test.unit || "-"}</TableCell>
                      <TableCell>
                        {formatReferenceRange(test.ref_low, test.ref_high)}
                      </TableCell>
                      <TableCell>
                        {test.flag ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getFlagColor(
                              test.flag
                            )}`}
                          >
                            {test.flag.toUpperCase()}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportDetails;
