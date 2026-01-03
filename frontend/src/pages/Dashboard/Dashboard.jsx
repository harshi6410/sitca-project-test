import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

const Dashboard = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Use environment variable with localhost fallback
  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

  const fetchPlayers = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      let url = `${API_BASE}/api/admin/players/pending`;
      if (viewMode === "all") {
        url = `${API_BASE}/api/admin/players/all`;
      }

      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setPlayers(data);
      setFilteredPlayers(data);
      setCurrentPage(1);
      setSelectedPlayers([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Fetch players error:", err);
      alert("Failed to load players. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [viewMode]);

  useEffect(() => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter(
        (player) =>
          player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.primaryPhone.includes(searchTerm) ||
          player.instagram.toLowerCase().includes(searchTerm.toLowerCase().replace("@", ""))
      );
    }

    if (roleFilter !== "all") {
      if (roleFilter === "Wicketkeeper") {
        filtered = filtered.filter(
          (p) =>
            p.battingProfile === "Wicketkeeper" ||
            p.allRounderType === "Wicketkeeper All-Rounder"
        );
      } else {
        filtered = filtered.filter((p) => p.primaryRole === roleFilter);
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPlayers(filtered);
    setCurrentPage(1);

    if (viewMode === "pending") {
      setSelectedPlayers([]);
      setSelectAll(false);
    }
  }, [searchTerm, roleFilter, statusFilter, players, viewMode]);

  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(
        currentPlayers.filter((p) => p.status === "PENDING").map((p) => p.id)
      );
    }
    setSelectAll(!selectAll);
  };

  const handleSelectPlayer = (id) => {
    if (selectedPlayers.includes(id)) {
      setSelectedPlayers(selectedPlayers.filter((pid) => pid !== id));
    } else {
      setSelectedPlayers([...selectedPlayers, id]);
    }
  };

  const bulkAction = async (status) => {
    if (selectedPlayers.length === 0) {
      alert("No players selected");
      return;
    }

    try {
      await Promise.all(
        selectedPlayers.map((id) =>
          fetch(`${API_BASE}/api/admin/player/${id}/status`, {
            method: "PATCH",
            mode: "cors",
            credentials: "omit",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          })
        )
      );

      alert(`Bulk ${status.toLowerCase()} successful!`);
      fetchPlayers();
    } catch (err) {
      console.error("Bulk action error:", err);
      alert("Bulk action failed");
    }
  };

  const changePlayerStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/admin/player/${id}/status`, {
        method: "PATCH",
        mode: "cors",
        credentials: "omit",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      fetchPlayers();
    } catch (err) {
      console.error("Status change error:", err);
      alert(`Failed to ${status.toLowerCase()} player`);
    }
  };

  const approvePlayer = (id) => changePlayerStatus(id, "APPROVED");
  const rejectPlayer = (id) => changePlayerStatus(id, "REJECTED");

  const exportToExcel = async () => {
    // ... export logic remains the same ...
    // (you can leave this part unchanged as it doesn't make API calls)
    try {
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("SITCA Players 2025");
      
      worksheet.addRow([
        "Full Name", "DOB", "Aadhaar", "Primary Phone", "Alternate Phone",
        "Blood Group", "Role", "Specialization", "Shirt Size", "Pant Size",
        "Instagram", "Previous Leagues", "Medical Conditions", "Status"
      ]);

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB11212" }
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      filteredPlayers.forEach(player => {
        worksheet.addRow([
          player.fullName,
          new Date(player.dob).toLocaleDateString("en-IN"),
          player.aadhaarNumber || "-",
          player.primaryPhone,
          player.alternatePhone || "-",
          player.bloodGroup,
          player.primaryRole,
          player.battingProfile || player.bowlingStyle || player.allRounderType || "-",
          player.shirtSize,
          player.pantSize,
          player.instagram,
          player.previousLeagues || "-",
          player.medicalConditions || "-",
          player.status
        ]);
      });

      worksheet.columns.forEach(column => {
        let maxLength = 12;
        column.eachCell({ includeEmpty: true }, cell => {
          const length = cell.value ? cell.value.toString().length : 10;
          if (length > maxLength) maxLength = length;
        });
        column.width = maxLength + 4;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, "SITCA_Players_2025.xlsx");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const isPendingMode = viewMode === "pending";

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h1 className="logo">
          Crimson <span>Console</span>
        </h1>
        <ul className="menu">
          <li className="active">Dashboard</li>
          <li>Settings</li>
          <li>Reports</li>
        </ul>
      </aside>

      <main className="main-content">
        {/* Fixed Top Bar */}
        <div className="top-bar">
          <h2>Player Management</h2>
          <div className="top-controls">
            <div className="tabs-group">
              <button
                onClick={() => setViewMode("pending")}
                className={viewMode === "pending" ? "tab-active" : "tab-inactive"}
              >
                Pending Approvals
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={viewMode === "all" ? "tab-active" : "tab-inactive"}
              >
                All Players
              </button>
            </div>

            <div className="top-actions">
              <button className="export-btn" onClick={exportToExcel}>
                📊 Export to Excel
              </button>
              <button className="add-btn" onClick={() => navigate("/SitcaForm")}>
                + Add New Player
              </button>
              <span className="admin-user">Admin</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="filters-container">
          <input
            type="text"
            className="search-box"
            placeholder="Search by name, phone, or @instagram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicketkeeper">Wicketkeeper</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {isPendingMode && selectedPlayers.length > 0 && (
          <div className="bulk-actions-bar">
            <span>
              {selectedPlayers.length} player{selectedPlayers.length > 1 ? "s" : ""} selected
            </span>
            <div>
              <button onClick={() => bulkAction("APPROVED")} className="bulk-approve">
                Bulk Approve
              </button>
              <button onClick={() => bulkAction("REJECTED")} className="bulk-reject">
                Bulk Reject
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="results-info">
          Showing {indexOfFirstPlayer + 1}–
          {Math.min(indexOfLastPlayer, filteredPlayers.length)} of {filteredPlayers.length} player
          {filteredPlayers.length !== 1 ? "s" : ""}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isPendingMode && (
                  <th>
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  </th>
                )}
                <th>#</th>
                <th>Player</th>
                <th>Role</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Status</th>
                {isPendingMode && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isPendingMode ? 8 : 7} className="no-data">
                    Loading players...
                  </td>
                </tr>
              ) : currentPlayers.length === 0 ? (
                <tr>
                  <td colSpan={isPendingMode ? 8 : 7} className="no-data">
                    No players match your filters
                  </td>
                </tr>
              ) : (
                currentPlayers.map((player, index) => (
                  <tr
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    style={{ cursor: "pointer" }}
                  >
                    {isPendingMode && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => handleSelectPlayer(player.id)}
                          disabled={player.status !== "PENDING"}
                        />
                      </td>
                    )}
                    <td>{indexOfFirstPlayer + index + 1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={`${API_BASE}${player.photoUrl}`}
                          alt={player.fullName}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #b11212",
                          }}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png"; // fallback image if exists
                          }}
                        />
                        <div>
                          <strong>{player.fullName}</strong>
                          <br />
                          <small style={{ color: "#ccc" }}>@{player.instagram}</small>
                        </div>
                      </div>
                    </td>
                    <td>{player.primaryRole}</td>
                    <td>
                      {player.battingProfile ||
                        player.bowlingStyle ||
                        player.allRounderType ||
                        "-"}
                    </td>
                    <td>{player.primaryPhone}</td>
                    <td>
                      <span
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          background:
                            player.status === "PENDING"
                              ? "#7a0b0b"
                              : player.status === "APPROVED"
                              ? "#0f5132"
                              : "#8b0000",
                          color: "white",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {player.status}
                      </span>
                    </td>
                    {isPendingMode && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="approve-btn"
                          onClick={() => approvePlayer(player.id)}
                          disabled={player.status !== "PENDING"}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => rejectPlayer(player.id)}
                          disabled={player.status !== "PENDING"}
                        >
                          Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Player Details Modal */}
        {selectedPlayer && (
          <div className="player-modal-overlay" onClick={() => setSelectedPlayer(null)}>
            <div className="player-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setSelectedPlayer(null)}>
                ×
              </button>

              <div className="modal-header">
                <img
                  src={`${API_BASE}${selectedPlayer.photoUrl}`}
                  alt={selectedPlayer.fullName}
                  className="modal-player-photo"
                />
                <div>
                  <h2>{selectedPlayer.fullName}</h2>
                  <p>@{selectedPlayer.instagram}</p>
                  <span className="modal-status" data-status={selectedPlayer.status}>
                    {selectedPlayer.status}
                  </span>
                </div>
              </div>

              <div className="modal-body">
                <div className="modal-grid">
                  <div>
                    <strong>Date of Birth:</strong>{" "}
                    {new Date(selectedPlayer.dob).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Primary Phone:</strong> {selectedPlayer.primaryPhone}
                  </div>
                  <div>
                    <strong>Alternate Phone:</strong>{" "}
                    {selectedPlayer.alternatePhone || "-"}
                  </div>
                  <div>
                    <strong>Blood Group:</strong> {selectedPlayer.bloodGroup}
                  </div>
                  <div>
                    <strong>Aadhaar Number:</strong>{" "}
                    {selectedPlayer.aadhaarNumber || "Not provided"}
                  </div>
                  <div>
                    <strong>Primary Role:</strong> {selectedPlayer.primaryRole}
                  </div>
                  <div>
                    <strong>Specialization:</strong>{" "}
                    {selectedPlayer.battingProfile ||
                      selectedPlayer.bowlingStyle ||
                      selectedPlayer.allRounderType ||
                      "-"}
                  </div>
                  <div>
                    <strong>Shirt Size:</strong> {selectedPlayer.shirtSize}
                  </div>
                  <div>
                    <strong>Pant Size:</strong> {selectedPlayer.pantSize}
                  </div>
                </div>

                <div className="modal-section">
                  <strong>Medical Conditions / Injuries:</strong>
                  <p>{selectedPlayer.medicalConditions || "None declared"}</p>
                </div>

                <div className="modal-section">
                  <strong>Previous Leagues:</strong>
                  <p>{selectedPlayer.previousLeagues || "None"}</p>
                </div>

                <div className="modal-section">
                  <strong>Aadhaar Photo:</strong>
                  <img
                    src={`${API_BASE}${selectedPlayer.aadhaarPhotoUrl}`}
                    alt="Aadhaar"
                    className="modal-aadhaar-photo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;