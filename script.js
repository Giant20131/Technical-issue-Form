// =========================================
//   Credentials & config
// =========================================

// User credentials
const userId = "teacher";
const userPass = "podar1234";

// Admin credentials
const adminId = "principal";
const adminPass = "podar_pr1234";

// Password for downloading TXT files
const downloadPass = "download123";

// Expiry window (1 day)
const ONE_DAY = 24 * 60 * 60 * 1000;


// =========================================
//   Notifications
// =========================================
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function showNotification(issue) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("New Technical Issue", {
      body: `${issue.name} (${issue.className}) - ${issue.text}`,
      icon: "https://cdn-icons-png.flaticon.com/512/565/565547.png"
    });
  }
}


// =========================================
//   Login page
// =========================================
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("userId").value.trim();
    const pass = document.getElementById("userPass").value;

    if (id === userId && pass === userPass) {
      sessionStorage.setItem("loggedIn", "user");
      window.location.href = "form.html";
    } else if (id === adminId && pass === adminPass) {
      sessionStorage.setItem("loggedIn", "admin");
      window.location.href = "admin.html";
    } else {
      document.getElementById("errorMsg").textContent = "Invalid ID or Password!";
    }
  });
}


// =========================================
//   Helpers for issue storage
// =========================================
function loadIssuesPruned() {
  let issues = JSON.parse(localStorage.getItem("issues") || "[]");
  const now = Date.now();
  // remove items older than 1 day
  issues = issues.filter((issue) => now - issue.timestamp < ONE_DAY);
  localStorage.setItem("issues", JSON.stringify(issues));
  return issues;
}

function saveIssues(issues) {
  localStorage.setItem("issues", JSON.stringify(issues));
}


// =========================================
//   User form page (submit only)
// =========================================
if (document.getElementById("issueForm")) {
  const issueForm = document.getElementById("issueForm");
  let issues = loadIssuesPruned();

  issueForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const className = document.getElementById("classSelect").value;
    const date = document.getElementById("date").value;
    const text = document.getElementById("issue").value.trim();

    const newIssue = {
      name,
      className,
      date,
      text,
      timestamp: Date.now()
    };

    issues.push(newIssue);
    saveIssues(issues);

    // Notify (browser popup)
    showNotification(newIssue);

    alert("✅ Your issue has been submitted successfully!");
    issueForm.reset();
  });

  // Ask for notification permission on page load
  requestNotificationPermission();
}


// =========================================
//   Admin page (list, download, delete)
// =========================================
if (document.getElementById("adminIssueList")) {
  let issues = loadIssuesPruned();

  function renderAdminIssues() {
    const adminList = document.getElementById("adminIssueList");
    adminList.innerHTML = "";

    // Newest first
    issues.slice().reverse().forEach((issue, i) => {
      const index = issues.length - 1 - i;
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${issue.name} (${issue.className})</strong><br/>
        ${issue.text}
        <br/><span class="date">Date: ${issue.date}</span>
        <br/>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button onclick="downloadIssue(${index})">⬇️ Download</button>
          <button onclick="deleteIssue(${index})">❌ Delete</button>
        </div>
      `;
      adminList.appendChild(li);
    });
  }

  // Download a specific issue as TXT (with password prompt)
  window.downloadIssue = function (index) {
    const enteredPass = prompt("Enter password to download this file:");
    if (enteredPass !== downloadPass) {
      alert("Incorrect password! File download cancelled.");
      return;
    }

    const issue = issues[index];
    const content =
`Technical Issue Report
----------------------
Name: ${issue.name}
Class: ${issue.className}
Date: ${issue.date}
Issue: ${issue.text}
----------------------`;

    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `issue_${index + 1}.txt`;
    a.click();
  };

  // Delete a specific issue
  window.deleteIssue = function (index) {
    if (confirm("Are you sure you want to delete this issue?")) {
      issues.splice(index, 1);
      saveIssues(issues);
      renderAdminIssues();
    }
  };

  renderAdminIssues();
}

