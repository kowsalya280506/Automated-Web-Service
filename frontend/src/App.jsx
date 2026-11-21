
import { useEffect, useState, useCallback } from "react";

import {
  Activity,
  Server,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Bell,
  Pencil,
  X,
  Check
} from "lucide-react";

import {
  getServices,
  addService,
  deleteService,
  getHistory,
  checkService,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  updateService
} from "./services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./App.css";
const APIL =
  import.meta.env.VITE_API_URL || "https://automated-web-service-qbx6.onrender.com/api";
function App() {
  const [services, setServices] = useState([]);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  // Load services
  const loadServices = useCallback(async () => {
    try {
      const data = await getServices();
      setServices(data);

      setSelected(current => {
        if (!current) return data[0] || null;

        return data.find(s => s._id === current._id) || data[0] || null;
      });

      setError("");
    } catch (err) {
      setError("Unable to load services. Check backend.");
    }
  }, []);

  // Load notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Notification loading failed:", err);
    }
  }, []);

  // Load history
  const loadHistory = useCallback(async (id) => {
    if (!id) {
      setHistory([]);
      return;
    }

    try {
      const data = await getHistory(id);
      setHistory(data.slice(0, 20).reverse());
    } catch (err) {
      setHistory([]);
    }
  }, []);

  // Refresh everything
  const refreshAll = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadServices(),
        fetchNotifications()
      ]);

      if (selected?._id) {
        await loadHistory(selected._id);
      }
    } catch (err) {
      setError("Refresh failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial loading and automatic refresh
  useEffect(() => {
    refreshAll();

    const interval = setInterval(() => {
      loadServices();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadServices, fetchNotifications]);

  // Refresh history when selected service changes
  useEffect(() => {
    if (selected?._id) {
      loadHistory(selected._id);
    } else {
      setHistory([]);
    }
  }, [selected?._id, loadHistory]);

  // Add service
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await addService({
        name: name.trim(),
        url: url.trim()
      });

      setName("");
      setUrl("");

      await loadServices();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add service."
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit service
  const handleEdit = (service) => {
    setEditingId(service._id);
    setName(service.name);
    setUrl(service.url);
    setError("");
  };

  // Update service
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await updateService(editingId, {
        name: name.trim(),
        url: url.trim()
      });

      setEditingId(null);
      setName("");
      setUrl("");

      await loadServices();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update service."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setError("");
  };

  // Delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      setLoading(true);

      await deleteService(id);

      if (selected?._id === id) {
        setSelected(null);
        setHistory([]);
      }

      await loadServices();
    } catch (err) {
      setError("Unable to delete service.");
    } finally {
      setLoading(false);
    }
  };

  // Manual monitoring
  const handleCheck = async (id) => {
    try {
      setLoading(true);
      setError("");

      await checkService(id);

      await Promise.all([
        loadServices(),
        fetchNotifications(),
        loadHistory(id)
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Monitoring failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Mark notification read
  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      await fetchNotifications();
    } catch (err) {
      setError("Unable to mark notification as read.");
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      await fetchNotifications();
    } catch (err) {
      setError("Unable to delete notification.");
    }
  };

  // Statistics
  const count = (status) =>
    services.filter(s => s.currentStatus === status).length;

  const average = services.length
    ? Math.round(
        services.reduce(
          (sum, s) => sum + (s.responseTime || 0), 0
        ) / services.length
      )
    : 0;

  const unreadCount = notifications.filter(
    n => !n.isRead
  ).length;

  // Status colors
  const statusColor = (status) => {
    const colors = {
      Healthy: "#16a34a",
      Slow: "#d97706",
      Unavailable: "#dc2626",
      Recovering: "#2563eb",
      Restored: "#0d9488"
    };

    return colors[status] || "#64748b";
  };

  const notificationColor = (type) => {
    const colors = {
      Failure: "#dc2626",
      Recovery: "#2563eb",
      Restored: "#16a34a"
    };

    return colors[type] || "#64748b";
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <Activity size={27} />
          <span>ServiceWatch</span>
        </div>

        <p className="nav-heading">MONITORING</p>

        <div
          className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("Dashboard")}
        >
          <Activity size={19} />
          Dashboard
        </div>

        <div
          className={`nav-item ${activePage === "Services" ? "active" : ""}`}
          onClick={() => setActivePage("Services")}
        >
          <Server size={19} />
          Services
        </div>

        <div
          className={`nav-item ${activePage === "Notifications" ? "active" : ""}`}
          onClick={() => setActivePage("Notifications")}
        >
          <Bell size={19} />
          Notifications

          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="sidebar-bottom">
          <span className="online-dot"></span>
          Backend monitoring active
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <h1>
              {activePage === "Dashboard"
                ? "Service Dashboard"
                : activePage === "Services"
                  ? "Registered Services"
                  : "Notifications"}
            </h1>

            <p>Monitor your web services in real time.</p>
          </div>

          <button
            className="refresh-btn"
            onClick={refreshAll}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

        </header>

        {error && (
          <div className="error">{error}</div>
        )}

        {/* DASHBOARD PAGE */}
        {activePage === "Dashboard" && (

          <>

            <section className="stats">

              <div className="stat-card">
                <Server color="#2563eb" size={23} />
                <p>Total Services</p>
                <h2>{services.length}</h2>
              </div>

              <div className="stat-card">
                <CheckCircle color="#16a34a" size={23} />
                <p>Healthy</p>
                <h2>{count("Healthy")}</h2>
              </div>

              <div className="stat-card">
                <AlertTriangle color="#dc2626" size={23} />
                <p>Unavailable</p>
                <h2>{count("Unavailable")}</h2>
              </div>

              <div className="stat-card">
                <Clock color="#d97706" size={23} />
                <p>Average Response</p>
                <h2>{average} <small>ms</small></h2>
              </div>

            </section>

            {/* SERVICE STATUS SUMMARY */}
            <section className="panel">

              <div className="panel-heading">
                <h2>Service Status Overview</h2>
                <span>{services.length} registered services</span>
              </div>

              {services.length > 0 ? (

                <div className="service-list">

                  {services.map(service => (

                    <div
                      key={service._id}
                      className="service-row"
                    >

                      <div className="service-info">

                        <span
                          className="status-dot"
                          style={{
                            background: statusColor(service.currentStatus)
                          }}
                        />

                        <div>
                          <strong>{service.name}</strong>
                          <p>{service.url}</p>
                          <span
                            className="status-text"
                            style={{
                              color: statusColor(service.currentStatus)
                            }}
                          >
                            {service.currentStatus}
                          </span>
                        </div>

                      </div>

                      <span>
                        {service.responseTime || 0} ms
                      </span>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="empty">No services registered.</p>

              )}

              <button
                className="check-btn"
                onClick={() => setActivePage("Services")}
              >
                <Server size={16} />
                Manage Services
              </button>

            </section>

            {/* RESPONSE HISTORY */}
            <section className="panel history-panel">

              <div className="panel-heading">
                <h2>Response Time History</h2>
                <span>Latest 20 checks</span>
              </div>

              {history.length > 0 ? (

                <div className="chart">

                  <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="checkedAt"
                        tickFormatter={value =>
                          new Date(value).toLocaleTimeString()
                        }
                      />

                      <YAxis />

                      <Tooltip
                        formatter={value => [
                          `${value} ms`,
                          "Response Time"
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              ) : (

                <p className="empty">
                  Select a service from Services to view its history.
                </p>

              )}

            </section>

          </>

        )}

        {/* SERVICES PAGE */}
        {activePage === "Services" && (

          <section className="content-grid">

            <div className="panel">

              <div className="panel-heading">
                <h2>Manage Services</h2>
                <span>{services.length} services</span>
              </div>

              <form
                className="add-form"
                onSubmit={editingId ? handleUpdate : handleAdd}
              >

                <input
                  type="text"
                  placeholder="Service name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  maxLength={80}
                />

                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />

                <button type="submit" disabled={loading}>
                  {editingId ? (
                    <>
                      <Check size={17} />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Add Service
                    </>
                  )}
                </button>

                {editingId && (
                  <button type="button" onClick={cancelEdit}>
                    <X size={17} />
                    Cancel
                  </button>
                )}

              </form>

              <div className="service-list">

                {services.map(service => (

                  <div
                    key={service._id}
                    className={`service-row ${
                      selected?._id === service._id ? "selected" : ""
                    }`}
                    onClick={() => setSelected(service)}
                  >

                    <div className="service-info">

                      <span
                        className="status-dot"
                        style={{
                          background: statusColor(service.currentStatus)
                        }}
                      />

                      <div>
                        <strong>{service.name}</strong>
                        <p>{service.url}</p>
                        <span
                          className="status-text"
                          style={{
                            color: statusColor(service.currentStatus)
                          }}
                        >
                          {service.currentStatus}
                        </span>
                      </div>

                    </div>

                    <div className="service-actions">

                      <span>{service.responseTime || 0} ms</span>

                      <button
                        title="Check service"
                        disabled={loading}
                        onClick={e => {
                          e.stopPropagation();
                          handleCheck(service._id);
                        }}
                      >
                        <RefreshCw size={16} />
                      </button>

                      <button
                        title="Edit service"
                        onClick={e => {
                          e.stopPropagation();
                          handleEdit(service);
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Delete service"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(service._id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                ))}

                {services.length === 0 && (
                  <p className="empty">
                    No services registered yet.
                  </p>
                )}

              </div>

            </div>

            {/* SERVICE DETAILS */}
            <div className="panel">

              <div className="panel-heading">
                <h2>Service Details</h2>
              </div>

              {selected ? (

                <>
                  <h3>{selected.name}</h3>

                  <p className="detail-url">{selected.url}</p>

                  <div className="detail-box">
                    <span>Current Status</span>
                    <strong style={{
                      color: statusColor(selected.currentStatus)
                    }}>
                      {selected.currentStatus}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Response Time</span>
                    <strong>{selected.responseTime || 0} ms</strong>
                  </div>

                  <div className="detail-box">
                    <span>Last Checked</span>
                    <strong>
                      {selected.lastChecked
                        ? new Date(selected.lastChecked).toLocaleString()
                        : "Not checked"}
                    </strong>
                  </div>

                  <button
                    className="check-btn"
                    disabled={loading}
                    onClick={() => handleCheck(selected._id)}
                  >
                    <RefreshCw size={16} />
                    Check Now
                  </button>

                </>

              ) : (

                <p className="empty">
                  Select a service to view details.
                </p>

              )}

            </div>

          </section>

        )}

        {/* NOTIFICATIONS PAGE */}
        {activePage === "Notifications" && (

          <section className="panel">

            <div className="panel-heading">
              <h2>All Notifications</h2>
              <span>{notifications.length} notifications</span>
            </div>

            {notifications.length > 0 ? (

              <div className="notification-list">

                {notifications.map(notification => (

                  <div
                    key={notification._id}
                    className="notification-item"
                  >

                    <div className="notification-content">

                      <strong>{notification.serviceName}</strong>

                      <span
                        style={{
                          color: notificationColor(notification.type),
                          fontWeight: "bold"
                        }}
                      >
                        {notification.type}
                      </span>

                      <p>{notification.message}</p>

                      <small>
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </small>

                      <span className="read-status">
                        {notification.isRead ? "Read" : "Unread"}
                      </span>

                    </div>

                    <div className="notification-actions">

                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkRead(notification._id)}
                        >
                          <Check size={16} />
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <p className="empty">No notifications available.</p>

            )}

          </section>

        )}

        <footer>
          Automated Web Service Availability and Recovery System
        </footer>

      </main>

    </div>
  );
}

export default App;
