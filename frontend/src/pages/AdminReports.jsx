import { useState } from "react";
import { Download } from "lucide-react";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import PageTitle from "../components/common/PageTitle";
import { getErrorMessage } from "../lib/utils";
import { adminApi } from "../services/adminApi";

const reports = [
  { type: "users", label: "Users Report" },
  { type: "exams", label: "Exams Report" },
  { type: "results", label: "Results Report" },
];

export default function AdminReports() {
  const [loadingType, setLoadingType] = useState("");
  const [error, setError] = useState("");

  const downloadReport = async (type) => {
    try {
      setLoadingType(type);
      setError("");
      const blob = await adminApi.downloadReport(type);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${type}-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, "Could not download report"));
    } finally {
      setLoadingType("");
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Reports" description="Export simple CSV reports from the backend." />
      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <div key={report.type} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">{report.label}</h3>
            <Button className="mt-5 w-full" onClick={() => downloadReport(report.type)} disabled={Boolean(loadingType)}>
              <Download size={16} />
              {loadingType === report.type ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
