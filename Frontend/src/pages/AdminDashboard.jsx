import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaUser,
  FaChartBar,
  FaSync,
  FaDownload,
  FaPrint,
  FaWhatsapp,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCheck,
  FaHistory,
  FaTags,
  FaCalendarAlt,
  FaFileExport,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminDashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    startDate: null,
    endDate: null,
    mobileVerified: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const [updateForm, setUpdateForm] = useState({
    status: "",
    notes: "",
    assignedTo: "",
    priority: "medium",
    followUpDate: null,
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Fetch enquiries
  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...filters,
      });

      // Remove null/undefined values
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          if (filters[key] instanceof Date) {
            params.set(key, filters[key].toISOString());
          } else {
            params.set(key, filters[key]);
          }
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/admin/enquiries?${params}`
      );

      if (response.data.success) {
        setEnquiries(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to fetch enquiries");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to fetch enquiries. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`);

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchStatistics();
  }, [pagination.page, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      search: "",
      startDate: null,
      endDate: null,
      mobileVerified: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Update enquiry status
  const handleUpdateEnquiry = async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/enquiries/${id}`,
        updateForm
      );

      if (response.data.success) {
        toast.success("Enquiry updated successfully");
        setShowModal(false);
        fetchEnquiries();
        fetchStatistics();
      }
    } catch (error) {
      toast.error("Failed to update enquiry");
      console.error("Update error:", error);
    }
  };

  // Delete enquiry
  const handleDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/enquiries/${enquiryToDelete._id}`
      );

      if (response.data.success) {
        toast.success("Enquiry deleted successfully");
        setShowDeleteModal(false);
        fetchEnquiries();
        fetchStatistics();
      }
    } catch (error) {
      toast.error("Failed to delete enquiry");
    }
  };

  // View enquiry details
  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setUpdateForm({
      status: enquiry.status || "pending",
      notes: "",
      assignedTo: enquiry.assignedTo || "",
      priority: enquiry.priority || "medium",
      followUpDate: enquiry.followUpDate
        ? new Date(enquiry.followUpDate)
        : null,
    });
    setShowModal(true);
  };

  // Confirm delete
  const confirmDelete = (enquiry) => {
    setEnquiryToDelete(enquiry);
    setShowDeleteModal(true);
  };

  // Send WhatsApp message
  const handleWhatsApp = (mobile) => {
    window.open(`https://wa.me/91${mobile}`, "_blank");
  };

  // Send email
  const handleEmail = (email) => {
    window.open(`mailto:${email}`, "_blank");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date only (without time)
  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      case "medium":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "high":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "urgent":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = [
      "S.No",
      "Enquiry ID",
      "Name",
      "Email",
      "Mobile",
      "Subject",
      "Status",
      "Priority",
      "Mobile Verified",
      "Assigned To",
      "Created At",
      "Last Updated",
    ];

    const csvData = enquiries.map((e) => [
      e.serialNo || "",
      e.enquiryId || "",
      e.name || "",
      e.email || "",
      e.mobile || "",
      e.subject ? e.subject.substring(0, 50) : "",
      e.status || "",
      e.priority || "medium",
      e.isMobileVerified ? "Yes" : "No",
      e.assignedTo || "",
      formatDate(e.createdAt),
      formatDate(e.updatedAt || e.createdAt),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully!");
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(enquiries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("JSON exported successfully!");
  };

  // Handle sort
  const handleSort = (field) => {
    if (filters.sortBy === field) {
      handleFilterChange(
        "sortOrder",
        filters.sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      handleFilterChange("sortBy", field);
      handleFilterChange("sortOrder", "desc");
    }
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (filters.sortBy !== field)
      return <FaSort className="ml-1 text-gray-400" />;
    return filters.sortOrder === "asc" ? (
      <FaSortUp className="ml-1 text-blue-600" />
    ) : (
      <FaSortDown className="ml-1 text-blue-600" />
    );
  };

  return (
    <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Leela Board Enquiry Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and track all customer enquiries in real-time
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-4">
              <FaEnvelope className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg mr-4">
              <FaClock className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.pending || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingPercent || 0}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mr-4">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.completed || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedPercent || 0}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-4">
              <FaUserCheck className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Verified Mobile</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.verified || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total
                  ? Math.round((stats.verified / stats.total) * 100)
                  : 0}
                % verified
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg mr-4">
              <FaChartBar className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Today's Enquiries</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.today || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {stats.dailyAverage || 0}/day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
            Filters & Search
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={fetchEnquiries}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition"
            >
              <FaSync className="mr-2" /> Refresh
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center transition"
            >
              <FaFilter className="mr-2" /> Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, mobile, subject..."
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Mobile Verified Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Verified
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filters.mobileVerified}
              onChange={(e) =>
                handleFilterChange("mobileVerified", e.target.value)
              }
            >
              <option value="all">All</option>
              <option value="true">Verified Only</option>
              <option value="false">Not Verified</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange("startDate", date)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholderText="Start Date"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange("endDate", date)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholderText="End Date"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition"
            >
              <FaFileExport className="mr-2" /> Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition"
            >
              <FaDownload className="mr-2" /> Export JSON
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center transition"
            >
              <FaPrint className="mr-2" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-8 text-center">
            <FaEnvelope className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No enquiries found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("serialNo")}
                    >
                      <div className="flex items-center">
                        S.No {renderSortIcon("serialNo")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("enquiryId")}
                    >
                      <div className="flex items-center">
                        Enquiry ID {renderSortIcon("enquiryId")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name {renderSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email {renderSortIcon("email")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("subject")}
                    >
                      <div className="flex items-center">
                        Subject {renderSortIcon("subject")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status {renderSortIcon("status")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Date {renderSortIcon("createdAt")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enquiry.serialNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {enquiry.enquiryId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {enquiry.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 truncate max-w-[200px]">
                            {enquiry.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaPhone className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {enquiry.mobile}
                          </span>
                          {enquiry.isMobileVerified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <span
                            className="text-sm text-gray-900 truncate block"
                            title={enquiry.subject}
                          >
                            {enquiry.subject}
                          </span>
                          {enquiry.priority &&
                            enquiry.priority !== "medium" && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getPriorityColor(
                                  enquiry.priority
                                )}`}
                              >
                                {enquiry.priority}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            enquiry.status
                          )}`}
                        >
                          {enquiry.status.charAt(0).toUpperCase() +
                            enquiry.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {formatDateOnly(enquiry.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(enquiry)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleWhatsApp(enquiry.mobile)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="WhatsApp"
                          >
                            <FaWhatsapp />
                          </button>
                          <button
                            onClick={() => handleEmail(enquiry.email)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Email"
                          >
                            <FaEnvelope />
                          </button>
                          <button
                            onClick={() => confirmDelete(enquiry)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: pageNum }))
                        }
                        className={`px-4 py-2 border rounded-lg ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        } transition`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View/Update Modal */}
      {showModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Enquiry Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enquiry ID
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg font-mono">
                      {selectedEnquiry.enquiryId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg">
                      {selectedEnquiry.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg">
                      {selectedEnquiry.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg flex items-center">
                      {selectedEnquiry.mobile}
                      {selectedEnquiry.isMobileVerified && (
                        <span className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg">
                      {selectedEnquiry.subject}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg min-h-[120px] whitespace-pre-wrap">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submitted On
                    </label>
                    <p className="p-3 bg-gray-50 rounded-lg">
                      {formatDate(selectedEnquiry.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  Update Enquiry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={updateForm.status}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, status: e.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={updateForm.priority}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      placeholder="Manager email"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={updateForm.assignedTo}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          assignedTo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date
                    </label>
                    <DatePicker
                      selected={updateForm.followUpDate}
                      onChange={(date) =>
                        setUpdateForm({ ...updateForm, followUpDate: date })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholderText="Select date"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Note
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows="3"
                    placeholder="Add update or follow-up note..."
                    value={updateForm.notes}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, notes: e.target.value })
                    }
                  />
                </div>

                {/* Existing Notes */}
                {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Previous Notes
                    </h5>
                    <div className="space-y-2 max-h-48 overflow-y-auto p-2">
                      {selectedEnquiry.notes.map((note, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                        >
                          <p className="text-sm text-gray-700">
                            {note.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {note.addedBy || "System"} on{" "}
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateEnquiry(selectedEnquiry._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Update Enquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && enquiryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete enquiry{" "}
                <span className="font-semibold">
                  {enquiryToDelete.enquiryId}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEnquiry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
