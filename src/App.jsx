import { useState, useEffect } from "react";

import {
Briefcase,
LayoutDashboard,
FileText,
Settings,
Bell,
Search,
Plus,
Trash2,
X,
Database,
LogOut,
User
} from "lucide-react";

import {
onAuthStateChanged,
signOut
} from "firebase/auth";

import {
collection,
addDoc,
deleteDoc,
doc,
onSnapshot,
getDocs
} from "firebase/firestore";

import { auth, db } from "./firebase";
import Auth from "./Auth";

import "./App.css";

function App() {

// Authentication states
const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

// Application states
const [applications, setApplications] = useState([]);
const [dataLoading, setDataLoading] = useState(false);

const [showForm, setShowForm] = useState(false);
const [search, setSearch] = useState("");

const [activePage, setActivePage] = useState("Dashboard");

const [form, setForm] = useState({
company: "",
position: "",
date: "",
status: "Applied"
});

const [error, setError] = useState("");

// 1. Check Firebase login status
useEffect(() => {


const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  setUser(currentUser);
  setAuthLoading(false);
});

return () => unsubscribe();


}, []);

// 2. Fetch current user's applications from Firestore
useEffect(() => {


if (!user) {
  setApplications([]);
  return;
}

setDataLoading(true);
setError("");

const applicationsRef = collection(
  db,
  "users",
  user.uid,
  "applications"
);

const unsubscribe = onSnapshot(
  applicationsRef,
  (snapshot) => {

    const data = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));

    setApplications(data);
    setDataLoading(false);

  },
  (err) => {
    console.error(err);
    setError("Unable to load applications. Check Firestore rules.");
    setDataLoading(false);
  }
);

return () => unsubscribe();


}, [user]);

// 3. Add application to Firestore
const handleSubmit = async (e) => {


e.preventDefault();

if (!user) return;

try {

  const applicationsRef = collection(
    db,
    "users",
    user.uid,
    "applications"
  );

  await addDoc(applicationsRef, {
    company: form.company,
    position: form.position,
    date: form.date,
    status: form.status,
    createdAt: new Date()
  });

  setForm({
    company: "",
    position: "",
    date: "",
    status: "Applied"
  });

  setShowForm(false);

} catch (err) {

  console.error(err);
  setError("Unable to save application.");

}


};

// 4. Delete application
const deleteApplication = async (id) => {


try {

  await deleteDoc(
    doc(db, "users", user.uid, "applications", id)
  );

} catch (err) {

  console.error(err);
  setError("Unable to delete application.");

}


};

// 5. Clear all applications
const clearAllData = async () => {


const confirmDelete = window.confirm(
  "Are you sure you want to delete all applications?"
);

if (!confirmDelete) return;

try {

  const applicationsRef = collection(
    db,
    "users",
    user.uid,
    "applications"
  );

  const snapshot = await getDocs(applicationsRef);

  await Promise.all(
    snapshot.docs.map((document) =>
      deleteDoc(document.ref)
    )
  );

} catch (err) {

  console.error(err);
  setError("Unable to clear applications.");

}


};

// 6. Logout
const handleLogout = async () => {


try {

  await signOut(auth);

  setActivePage("Dashboard");

} catch (err) {

  console.error(err);
  setError("Logout failed.");

}


};

// Search
const filteredApplications = applications.filter((app) =>
app.company.toLowerCase().includes(search.toLowerCase())
);

// Statistics
const total = applications.length;

const applied = applications.filter(
(app) => app.status === "Applied"
).length;

const interviews = applications.filter(
(app) => app.status === "Interview"
).length;

const offers = applications.filter(
(app) => app.status === "Offer"
).length;

// Interviews
const interviewApplications = filteredApplications.filter(
(app) => app.status === "Interview"
);

// Reusable table
const renderTable = (data) => (

<>
  <table>

    <thead>
      <tr>
        <th>Company</th>
        <th>Position</th>
        <th>Date</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>

      {data.map((app) => (

        <tr key={app.id}>

          <td>{app.company}</td>

          <td>{app.position}</td>

          <td>{app.date}</td>

          <td>
            <span className={`status ${app.status.toLowerCase()}`}>
              {app.status}
            </span>
          </td>

          <td>
            <button
              className="delete-btn"
              onClick={() => deleteApplication(app.id)}
            >
              <Trash2 size={17} />
            </button>
          </td>

        </tr>

      ))}

    </tbody>

  </table>

  {data.length === 0 && (
    <p className="empty">No applications found.</p>
  )}

</>


);

const pageDescriptions = {
Dashboard: "Welcome back! Here's your application overview.",
"My Applications": "Manage all your job applications.",
Interviews: "Track your upcoming interviews.",
Settings: "Manage your JobTrack settings."
};

// Authentication loading
if (authLoading) {
return <div className="auth-container">Loading JobTrack...</div>;
}

// If user is not logged in, show Login page
if (!user) {
return <Auth />;
}

// Dashboard
return (

<div className="app">

  {/* Sidebar */}
  <aside className="sidebar">

    <h2 className="logo">JobTrack.</h2>

    <nav>

      <button
        className={activePage === "Dashboard" ? "active" : ""}
        onClick={() => setActivePage("Dashboard")}
      >
        <LayoutDashboard /> Dashboard
      </button>

      <button
        className={activePage === "My Applications" ? "active" : ""}
        onClick={() => setActivePage("My Applications")}
      >
        <Briefcase /> My Applications
      </button>

      <button
        className={activePage === "Interviews" ? "active" : ""}
        onClick={() => setActivePage("Interviews")}
      >
        <FileText /> Interviews
      </button>

      <button
        className={activePage === "Settings" ? "active" : ""}
        onClick={() => setActivePage("Settings")}
      >
        <Settings /> Settings
      </button>

    </nav>

    {/* Profile */}
    <div className="profile">

      <div className="avatar">
        {user.displayName
          ? user.displayName.charAt(0).toUpperCase()
          : "U"}
      </div>

      <div>
        <h4>{user.displayName || "User"}</h4>
        <p>Student Account</p>
      </div>

      <button
        onClick={handleLogout}
        title="Logout"
        className="logout-btn"
      >
        <LogOut size={18} />
      </button>

    </div>

  </aside>

  {/* Main Content */}
  <main className="main">

    <header className="navbar">

      <div>
        <h1>{activePage}</h1>
        <p>{pageDescriptions[activePage]}</p>
      </div>

      <div className="nav-right">

        <div className="search">

          <Search size={18} />

          <input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <button
          className="notification-btn"
          onClick={() => setActivePage("Interviews")}
          title="View interviews"
        >
          <Bell />
        </button>

      </div>

    </header>

    {error && (
      <p className="empty">{error}</p>
    )}

    {/* Dashboard */}
    {activePage === "Dashboard" && (

      <>

        <section className="stats">

          <div className="card">
            <p>Total Applications</p>
            <h1>{total}</h1>
            <span>All applications</span>
          </div>

          <div className="card">
            <p>Applied</p>
            <h1>{applied}</h1>
            <span>Waiting for response</span>
          </div>

          <div className="card">
            <p>Interviews</p>
            <h1>{interviews}</h1>
            <span>Interview scheduled</span>
          </div>

          <div className="card">
            <p>Offers</p>
            <h1>{offers}</h1>
            <span>Congratulations!</span>
          </div>

        </section>

        <section className="applications">

          <div className="section-header">

            <h2>Recent Applications</h2>

            <button
              className="add-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Add Application
            </button>

          </div>

          {dataLoading
            ? <p>Loading applications...</p>
            : renderTable(filteredApplications)
          }

        </section>

      </>

    )}

    {/* My Applications */}
    {activePage === "My Applications" && (

      <section className="applications">

        <div className="section-header">

          <h2>All Applications</h2>

          <button
            className="add-btn"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Application
          </button>

        </div>

        {dataLoading
          ? <p>Loading applications...</p>
          : renderTable(filteredApplications)
        }

      </section>

    )}

    {/* Interviews */}
    {activePage === "Interviews" && (

      <section className="applications">

        <div className="section-header">
          <h2>Interview Applications</h2>
        </div>

        {renderTable(interviewApplications)}

      </section>

    )}

    {/* Settings */}
    {activePage === "Settings" && (

      <section className="applications settings-page">

        <h2>Settings</h2>

        <div className="settings-card">

          <User size={35} />

          <div>
            <h3>Account Information</h3>

            <p>
              Name: {user.displayName || "User"}
            </p>

            <p>
              Email: {user.email}
            </p>
          </div>

        </div>

        <div className="settings-card">

          <Database size={35} />

          <div>
            <h3>Cloud Storage</h3>

            <p>
              Your applications are stored securely in Firebase Firestore.
            </p>

            <p>
              Total applications: <strong>{total}</strong>
            </p>

          </div>

        </div>

        <div className="settings-card">

          <div>
            <h3>Delete All Applications</h3>

            <p>
              This will permanently delete all your applications.
            </p>
          </div>

          <button
            className="delete-btn"
            onClick={clearAllData}
          >
            <Trash2 size={17} />
            Clear All Data
          </button>

        </div>

        <div className="settings-card">

          <div>
            <h3>Logout</h3>
            <p>Sign out of your JobTrack account.</p>
          </div>

          <button
            className="delete-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </section>

    )}

    {/* Add Application Modal */}
    {showForm && (

      <div className="modal-overlay">

        <div className="modal">

          <div className="modal-header">

            <h2>Add New Application</h2>

            <button
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              <X />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <label>Company Name</label>

            <input
              type="text"
              placeholder="Enter company name"
              value={form.company}
              onChange={(e) =>
                setForm({ ...form, company: e.target.value })
              }
              required
            />

            <label>Job Position</label>

            <input
              type="text"
              placeholder="Enter job position"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
              required
            />

            <label>Application Date</label>

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              required
            />

            <label>Application Status</label>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button type="submit" className="submit-btn">
              Save Application
            </button>

          </form>

        </div>

      </div>

    )}

  </main>

</div>

);

}

export default App;
