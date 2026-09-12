const statusTone = {
  Scheduled: "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
};

const documentLabels = {
  INSTRUMENT_PHOTO: "Instrument Photo",
  SUPPORTING_DOCUMENT: "Supporting Document",
  PREVIOUS_CERTIFICATE: "Previous Certificate",
  INSPECTION_PHOTO: "Inspection Photo",
  OTHER: "Other",
};

const requiredDocuments = [
  "INSTRUMENT_PHOTO",
  "SUPPORTING_DOCUMENT",
  "PREVIOUS_CERTIFICATE",
  "INSPECTION_PHOTO",
];

export default function ApplicationTable({
  applications,
  onInspect,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-3">Application</th>
            <th className="px-4 py-3">Applicant</th>
            <th className="px-4 py-3">Instrument</th>
            <th className="px-4 py-3">Officer</th>
            <th className="px-4 py-3">Documents</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-5 py-3">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {applications.map((item) => {
            const documents = item.documents || [];

            const documentCount =
              item.documentCount ?? documents.length;

            const canInspect =
              item.status !== "CERTIFICATE_GENERATED" &&
              item.status !== "PASSED";

            return (
              <tr key={item.id}>
                {/* Application */}
                <td className="px-5 py-4 text-sm font-bold text-[#075b4c]">
                  {item.applicationNumber}
                </td>

                {/* Applicant */}
                <td className="px-4 py-4">
                  <p className="text-sm font-medium">
                    {item.applicant}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.owner || "New applicant"}
                  </p>
                </td>

                {/* Instrument */}
                <td className="px-4 py-4">
                  <p className="text-sm">
                    {item.instrument}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.serialNumber || "—"}
                  </p>
                </td>

                {/* Officer */}
                <td className="px-4 py-4 text-sm text-slate-500">
                  {item.officer || "Unassigned"}
                </td>

                {/* Documents */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1.5">
                    {/* Document count */}
                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                        documentCount === 4
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {documentCount}/4 uploaded
                    </span>

                    {/* Required documents */}
                    <div className="mt-1 space-y-1">
                      {requiredDocuments.map((type) => {
                        const uploaded = documents.some(
                          (document) =>
                            document.type === type
                        );

                        return (
                          <div
                            key={type}
                            className={`flex items-center gap-1.5 text-[11px] font-medium ${
                              uploaded
                                ? "text-emerald-700"
                                : "text-rose-600"
                            }`}
                          >
                            <span className="text-sm leading-none">
                              {uploaded ? "✓" : "✕"}
                            </span>

                            <span>
                              {documentLabels[type]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusTone[item.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  {canInspect ? (
                    <button
                      type="button"
                      onClick={() => onInspect(item)}
                      className="rounded-lg bg-[#08755d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#075f4d]"
                    >
                      Inspect
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}