"use client"

import { useEffect, useState } from "react";
import { getAllReports } from "@/utils/db/actions";

export default function ComplaintHistoryPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // Modal state for image preview
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      const data = await getAllReports();
      setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, []);

  // Calculate the reports to display for the current page
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);

  // Calculate total pages
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  // Handlers for pagination
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handler to open image preview modal
  const openPreview = (url) => {
    setPreviewImage(url);
  };

  // Handler to close modal
  const closePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <p className="text-center mt-8 text-gray-500">Loading report history...</p>
    );
  }

  if (reports.length === 0) {
    return <p className="text-center mt-8 text-gray-500">No reports found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Report History</h1>

      <ul className="space-y-6">
        {currentReports.map((report) => (
          <li
            key={report.id}
            className="border border-gray-300 rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300 flex gap-6"
          >
            {/* Image on left */}
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt={`Report ${report.id}`}
                onClick={() => openPreview(report.imageUrl)}
                className="w-40 h-32 object-cover rounded-md cursor-pointer flex-shrink-0"
                title="Click to preview"
              />
            )}

            {/* Content on right */}
            <div className="flex flex-col flex-grow">
              <p className="mb-1">
                <span className="font-semibold">ID:</span> {report.id}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Location:</span> {report.location}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Waste Type:</span> {report.wasteType}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Amount:</span> {report.amount}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`ml-2 px-2 py-1 rounded text-white text-sm ${
                    report.status === "pending"
                      ? "bg-yellow-500"
                      : report.status === "completed"
                      ? "bg-green-600"
                      : "bg-gray-600"
                  }`}
                >
                  {report.status}
                </span>
              </p>
              <p className="mt-auto text-sm text-gray-600">
                <span className="font-semibold">Created At:</span>{" "}
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
        >
          Next
        </button>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={closePreview}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-pointer"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
          />
          <button
            onClick={closePreview}
            className="absolute top-6 right-6 text-white text-3xl font-bold focus:outline-none"
            aria-label="Close Preview"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
