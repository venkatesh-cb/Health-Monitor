import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  original_filename: string | null;
  processing_state: string | null;
  created_at: string | null;
  submitter_name: string;
  lab_name: string | null;
  patient_id: string | null;
}

const Home = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "success":
        return "Ready";
      case "processing":
        return "Processing";
      case "error":
        return "Error";
      default:
        return "Processing";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="h-1 bg-primary w-full" />
        <div className="py-6">
          <div className="container flex items-center justify-center">
            <img src="/logo-cb.png" alt="CodeByte" className="h-10" />
          </div>
          <p className="text-center text-muted-foreground mt-2">
            Health Report Monitor Dashboard
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Your Reports</h1>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Plus className="w-4 h-4" />
            Upload New Report
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Reports Yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload your first health report to get started
            </p>
            <Button onClick={() => navigate("/")}>Upload Report</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => report.processing_state === "success" && navigate(`/report/${report.id}`)}
                className={`bg-card border border-border rounded-lg p-6 transition-all ${
                  report.processing_state === "success"
                    ? "cursor-pointer hover:border-primary hover:shadow-md"
                    : "opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {report.original_filename || "Health Report"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted by {report.submitter_name}
                        {report.lab_name && ` • ${report.lab_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(report.processing_state)}
                    <span
                      className={`text-sm font-medium ${
                        report.processing_state === "success"
                          ? "text-success"
                          : report.processing_state === "error"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {getStatusText(report.processing_state)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
