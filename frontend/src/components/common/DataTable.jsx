import EmptyState from "./EmptyState";

function getHeaderAlignmentClass(column) {
  const alignmentSource = `${column.className || ""} ${column.cellClassName || ""}`;

  if (alignmentSource.includes("text-right")) return "text-right";
  if (alignmentSource.includes("text-center")) return "text-center";

  return "";
}

export default function DataTable({ columns, data, emptyMessage = "No records found" }) {
  if (!data?.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 ${getHeaderAlignmentClass(column)} ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className={`px-6 py-4 ${column.cellClassName || ""}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
