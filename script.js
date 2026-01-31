/**************************************************
     * Student Portal - Frontend JavaScript (Dynamic)
     **************************************************/

    /* ========= GLOBAL STATE ========= */
    let loggedInUser = null;
    let hasPendingFees = false;   


    /* ========= DOM ELEMENTS ========= */
    const loginSection = document.getElementById("login-section");
    const dashboardSection = document.getElementById("dashboard-section");

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    const loginError = document.getElementById("login-error");
    const registerError = document.getElementById("register-error");

    const loginCard = document.getElementById("login-card");
    const registerCard = document.getElementById("register-card");

    const showRegisterBtn = document.getElementById("show-register");
    const showLoginBtn = document.getElementById("show-login");

    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".page");

    const logoutBtn = document.getElementById("logout-btn");
    const editBtn = document.getElementById("edit-registration");
    const saveBtn = document.getElementById("save-registration");

    const regInputs = [
        "reg-name-profile",
        "reg-no",
        "reg-phone",
        "reg-department",
        "reg-year",
        "reg-cgpa"
    ];
    editBtn?.addEventListener("click", () => {
        regInputs.forEach(id => {
            document.getElementById(id).disabled = false;
        });

        editBtn.classList.add("hidden");
        saveBtn.classList.remove("hidden");

        document.getElementById("registration-msg").textContent = "";
    });


    /* ========= INIT ========= */
    document.addEventListener("DOMContentLoaded", () => {
        showLoginPage();
        updateCurrentDate();
    });

    /* ========= UPDATE DATE ========= */
    function updateCurrentDate() {
        const dateElement = document.getElementById("current-date");
        if (dateElement) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }

    /* ========= LOGIN / REGISTER TOGGLE ========= */
    showRegisterBtn?.addEventListener("click", e => {
        e.preventDefault();
        loginCard.classList.add("hidden");
        registerCard.classList.remove("hidden");
    });

    showLoginBtn?.addEventListener("click", e => {
        e.preventDefault();
        registerCard.classList.add("hidden");
        loginCard.classList.remove("hidden");
    });

    /* ========= LOGIN ========= */
    loginForm?.addEventListener("submit", async e => {
        e.preventDefault();

        const email = getInputValue("email");
        const password = getInputValue("password");

        if (!email || !password) {
            showLoginError("Please enter email and password");
            return;
        }

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                loggedInUser = data.user;
                clearLoginError();
                showDashboardPage();
                await loadDashboard();
            } else {
                showLoginError(data.message);
            }
        } catch {
            showLoginError("Server error");
        }
    });

    /* ========= REGISTER ========= */
    registerForm?.addEventListener("submit", async e => {
        e.preventDefault();

        const name = getInputValue("reg-name");
        const email = getInputValue("reg-email");
        const password = getInputValue("reg-password");

        if (!name || !email || !password) {
            showRegisterError("All fields required");
            return;
        }

        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (data.success) {
                alert("Registration successful. Please login.");
                registerForm.reset();
                registerCard.classList.add("hidden");
                loginCard.classList.remove("hidden");
            } else {
                showRegisterError(data.message);
            }
        } catch {
            showRegisterError("Server error");
        }
    });

    /* ========= LOGOUT ========= */
    logoutBtn?.addEventListener("click", () => {
        loggedInUser = null;
        navItems.forEach(n => n.classList.remove("active"));
        pages.forEach(p => p.classList.remove("active"));
        showLoginPage();
    });

    /* ========= NAVIGATION ========= */
    navItems.forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            if (!loggedInUser) return;

            const page = item.dataset.page;
            if (!page) return;

            pages.forEach(p => p.classList.remove("active"));
            document.getElementById(`${page}-page`)?.classList.add("active");
        if (page === "registration") {
        loadRegistration();
    }
    if (page === "courses") {
            loadAllCourses();   
        }
        if (page === "attendance") {
    loadAttendance();
}




            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
        });
    });
    


    /* ========= PAGE CONTROL ========= */
    function showLoginPage() {
        loginSection.classList.add("active");
        dashboardSection.classList.remove("active");
        pages.forEach(p => p.classList.remove("active"));
    }

    function showDashboardPage() {
        loginSection.classList.remove("active");
        dashboardSection.classList.add("active");

        pages.forEach(p => p.classList.remove("active"));
        document.getElementById("dashboard-page")?.classList.add("active");

        navItems.forEach(n => n.classList.remove("active"));
        navItems[0]?.classList.add("active");
    }

    /* ========= DASHBOARD ========= */
    async function loadDashboard() {
        document.getElementById("student-name").textContent =
            loggedInUser.name

        document.getElementById("header-user-name").textContent =
            loggedInUser.name;
        document.getElementById("header-avatar").textContent =
            getInitials(loggedInUser.name);

        await Promise.all([
            loadFinanceData(),
            loadEnrolledCourses(),
            loadInstructors()
        ]);
    }

    /* ========= FINANCE ========= */
    async function loadFinanceData() {
        try {
            const res = await fetch(`/finance/${loggedInUser.id}`);
            const data = await res.json();

            if (data.success) {
                document.getElementById("total-amount").textContent =
    `₹ ${formatNumber(data.finance.total_amount)}`;

document.getElementById("paid-amount").textContent =
    `₹ ${formatNumber(data.finance.paid_amount)}`;

document.getElementById("overdue-amount").textContent =
    `₹ ${formatNumber(data.finance.overdue_amount)}`;

                    hasPendingFees = data.finance.overdue_amount > 0;
            }
        } catch {
            console.error("Failed to load finance");
        }
    }

    /* ========= ENROLLED COURSES ========= */
    async function loadEnrolledCourses() {
        try {
            const res = await fetch(`/courses/enrolled/${loggedInUser.id}`);
            const data = await res.json();

            const grid = document.getElementById("enrolled-courses-grid");
            grid.innerHTML = "";

            data.courses.forEach(c => {
                grid.innerHTML += `
                    <div class="course-card">
                        <div class="course-icon">${c.course_icon || "📘"}</div>
                        <div class="course-info">
                            <h3>${c.course_name}</h3>
                        </div>
                    </div>
                `;
            });
        } catch {
            console.error("Failed to load enrolled courses");
        }
    }

    /* ========= INSTRUCTORS ========= */
    async function loadInstructors() {
        try {
            const res = await fetch("/instructors");
            const data = await res.json();

            if (data.success) {
                const section = document.querySelector(".instructors-section");
                section.innerHTML = "";

                data.instructors.forEach(instructor => {
                    section.innerHTML += `
                        <div class="instructor-item">
                            <div class="instructor-avatar" style="background: ${instructor.avatar_color}">
                                ${instructor.initials}
                            </div>
                            <div class="instructor-info">
                                <div class="instructor-name">${instructor.name}</div>
                            </div>
                        </div>
                    `;
                });
            }
        } catch {
            console.error("Failed to load instructors");
        }
    }

    /* ========= HELPERS ========= */
    function getInputValue(id) {
        return document.getElementById(id)?.value?.trim() || "";
    }

    function showLoginError(msg) {
        loginError.textContent = msg;
        loginError.style.display = "block";
    }

    function clearLoginError() {
        loginError.textContent = "";
        loginError.style.display = "none";
    }

    function showRegisterError(msg) {
        registerError.textContent = msg;
        registerError.style.display = "block";
    }

    function formatNumber(num) {
    return Number(num).toLocaleString("en-IN");
}

    function getInitials(name) {
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    }
    async function loadRegistration() {
    try {
        const res = await fetch(`/profile/${loggedInUser.id}`);
        const data = await res.json();

        if (data.success && data.user) {
            document.getElementById("reg-name-profile").value = data.user.name || "";
            document.getElementById("reg-no").value = data.user.registration_no || "";
            document.getElementById("reg-phone").value = data.user.phone || "";
            document.getElementById("reg-department").value = data.user.department || "";
            document.getElementById("reg-year").value = data.user.year || "";
            document.getElementById("reg-cgpa").value = data.user.cgpa || "";

            // ✅ Update profile display at the top
            document.getElementById("profile-name-display").textContent = data.user.name || "John Doe";
            document.getElementById("profile-regno-display").textContent = data.user.registration_no || "—";
            document.getElementById("profile-dept-display").textContent = data.user.department || "—";
            document.getElementById("profile-year-display").textContent = data.user.year || "—";

            // ✅ Update avatar initials
            const initials = getInitials(data.user.name || "John Doe");
            document.getElementById("profile-avatar").textContent = initials;
        }
    } catch {
        console.error("Failed to load registration");
    }
}

saveBtn?.addEventListener("click", async () => {
    const payload = {
        user_id: loggedInUser.id,
        name: document.getElementById("reg-name-profile").value,
        registration_no: document.getElementById("reg-no").value,
        phone: document.getElementById("reg-phone").value,
        department: document.getElementById("reg-department").value,
        year: document.getElementById("reg-year").value,
        cgpa: document.getElementById("reg-cgpa").value
    };


        try {
            const res = await fetch("/profile/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                document.getElementById("registration-msg").textContent =
                    "Details saved successfully";

                // Disable fields again
                regInputs.forEach(id => {
                    document.getElementById(id).disabled = true;
                });

                saveBtn.classList.add("hidden");
                editBtn.classList.remove("hidden");
                loggedInUser.name = payload.name;

document.getElementById("student-name").textContent = payload.name;
document.getElementById("header-user-name").textContent = payload.name;
document.getElementById("header-avatar").textContent =
    getInitials(payload.name);


                // Update header display with new values
                document.getElementById("profile-regno-display").textContent = payload.registration_no || "—";
                document.getElementById("profile-dept-display").textContent = payload.department || "—";
                document.getElementById("profile-year-display").textContent = payload.year || "—";
            }
        } catch {
            document.getElementById("registration-msg").textContent =
                "Failed to save details";
        }
    });
async function loadAllCourses() {
    try {
        const res = await fetch(`/courses/all/${loggedInUser.id}`);
        const data = await res.json();

        const grid = document.getElementById("all-courses-grid");
        grid.innerHTML = "";

        data.courses.forEach(c => {
            grid.innerHTML += `
                <div class="course-card">
                    <div class="course-icon">${c.course_icon || "📘"}</div>
                    <div class="course-info">
                        <h3>${c.course_name}</h3>
<small>${c.course_code}</small>

<p class="course-prof">
    👨‍🏫 ${c.instructor_name || "TBA"}
</p>

<p class="course-desc">
    ${c.description || "No description available"}
</p>
<br>

<span class="badge ${c.enrolled ? 'enrolled' : 'available'}">
    ${c.enrolled ? 'ENROLLED' : 'AVAILABLE'}
</span>
<br><br>

                        ${
    hasPendingFees
    ? `<button class="btn btn-primary" disabled title="Clear pending fees to manage courses">
           Fees Pending
       </button>`
    : c.enrolled
        ? `<button class="btn btn-view" onclick="dropCourse(${c.course_id})">Drop</button>`
        : `<button class="btn btn-primary" onclick="enrollCourse(${c.course_id})">Enroll</button>`
}

                    </div>
                </div>
            `;
        });
    } catch {
        console.error("Failed to load courses");
    }
}
// 🔍 COURSE SEARCH LOGIC
document.getElementById("course-search")?.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();

    document.querySelectorAll("#all-courses-grid .course-card").forEach(card => {
        card.style.display =
            card.textContent.toLowerCase().includes(term)
                ? "flex"
                : "none";
    });
});

async function enrollCourse(courseId) {
    const btn = event.target;            
    btn.disabled = true;                 
    btn.textContent = "Enrolling...";    

    try {
        await fetch("/courses/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: loggedInUser.id,
                course_id: courseId
            })
        });

        await loadAllCourses();
        await loadEnrolledCourses();
    } catch (err) {
        console.error("Enroll failed", err);
        btn.disabled = false;
        btn.textContent = "Enroll";
    }
}


async function dropCourse(courseId) {
    const btn = event.target;            
    btn.disabled = true;                
    btn.textContent = "Dropping...";     

    try {
        await fetch("/courses/drop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: loggedInUser.id,
                course_id: courseId
            })
        });

        await loadAllCourses();
        await loadEnrolledCourses();
    } catch (err) {
        console.error("Drop failed", err);
        btn.disabled = false;
        btn.textContent = "Drop";
    }
}






/* ========= PAYMENT PAGE ========= */
document.getElementById('pay-btn')?.addEventListener('click', async () => {
    const amountInput = document.getElementById('pay-amount');
    const msgElement = document.getElementById('payment-msg');
    const amount = parseFloat(amountInput.value);

    // ✅ STEP 1: Reset previous states (remove old colors)
    amountInput.classList.remove('error', 'success');
    msgElement.className = '';
    msgElement.textContent = '';

    // ✅ STEP 2: Check if amount is valid
    if (!amount || amount <= 0) {
        // Show RED error with shake animation
        amountInput.classList.add('error');
        msgElement.textContent = '✗ Please enter a valid amount';
        msgElement.className = 'error';
        return;
    }

    try {
        // ✅ STEP 3: Send payment to server
        const response = await fetch('/finance/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: loggedInUser.id,
                amount: amount
            })
        });

        const data = await response.json();

        if (data.success) {
            // ✅ STEP 4: Show GREEN success
            amountInput.classList.add('success');
            msgElement.textContent = '✓ Payment successful!';
            msgElement.className = 'success';
            amountInput.value = ''; // Clear the input
            
            // Refresh finance data on dashboard
            await loadFinanceData();
        } else {
            // ✅ STEP 5: Show RED error if payment failed
            amountInput.classList.add('error');
            msgElement.textContent = '✗ ' + (data.message || 'Payment failed');
            msgElement.className = 'error';
        }
    } catch (error) {
        // ✅ STEP 6: Show RED error if server is down
        amountInput.classList.add('error');
        msgElement.textContent = '✗ An error occurred. Please try again.';
        msgElement.className = 'error';
    }
});

/* ========= ATTENDANCE PAGE WITH PIE CHARTS ========= */
async function loadAttendance() {
    try {
        const res = await fetch(`/attendance/${loggedInUser.id}`);
        const data = await res.json();

        const container = document.getElementById("attendance-table");
        container.innerHTML = "";

        if (!data.attendance || data.attendance.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <p>📊 No attendance data available</p>
                </div>
            `;
            return;
        }

        // Calculate overall attendance
        let totalClasses = 0;
        let totalAttended = 0;
        
        data.attendance.forEach(a => {
            totalClasses += a.total_classes;
            totalAttended += a.attended_classes;
        });

        const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(2) : 0;
        const overallAbsent = totalClasses - totalAttended;

        // Determine overall status
        let overallStatusClass = 'good';
        let overallStatusText = 'Good Standing';
        if (overallPercentage < 75) {
            overallStatusClass = 'critical';
            overallStatusText = 'Needs Attention';
        } else if (overallPercentage < 85) {
            overallStatusClass = 'warning';
            overallStatusText = 'Below Target';
        }

        // Add overall attendance card
        container.innerHTML = `
            <div class="overall-attendance-card">
                <div class="overall-header">
                    <h2>📊 Overall Attendance</h2>
                    <span class="attendance-badge ${overallStatusClass}">${overallStatusText}</span>
                </div>
                
                <div class="overall-content">
                    <div class="overall-pie-container">
                        <div class="pie-chart-large" style="--percentage: ${overallPercentage};">
                            <div class="pie-chart-center-large">
                                <span class="percentage-text-large">${overallPercentage}%</span>
                                <span class="percentage-label">Overall Present</span>
                            </div>
                        </div>
                        <div class="pie-legend">
                            <div class="legend-item">
                                <span class="legend-color present"></span>
                                <span class="legend-text">Present: ${totalAttended}</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color absent"></span>
                                <span class="legend-text">Absent: ${overallAbsent}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="overall-stats">
                        <div class="overall-stat-card">
                            <div class="stat-icon-large">📚</div>
                            <div class="stat-details">
                                <span class="stat-value-large">${totalClasses}</span>
                                <span class="stat-label-large">Total Classes</span>
                            </div>
                        </div>
                        <div class="overall-stat-card">
                            <div class="stat-icon-large">✅</div>
                            <div class="stat-details">
                                <span class="stat-value-large">${totalAttended}</span>
                                <span class="stat-label-large">Attended</span>
                            </div>
                        </div>
                        <div class="overall-stat-card">
                            <div class="stat-icon-large">❌</div>
                            <div class="stat-details">
                                <span class="stat-value-large">${overallAbsent}</span>
                                <span class="stat-label-large">Missed</span>
                            </div>
                        </div>
                        <div class="overall-stat-card">
                            <div class="stat-icon-large">📖</div>
                            <div class="stat-details">
                                <span class="stat-value-large">${data.attendance.length}</span>
                                <span class="stat-label-large">Total Courses</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-divider">
                <h2>📚 Course-wise Attendance</h2>
            </div>

            <div class="course-attendance-grid">
        `;

        // Add individual course attendance cards
        data.attendance.forEach(a => {
            const percentage = parseFloat(a.attendance_percentage);
            const attended = a.attended_classes;
            const total = a.total_classes;
            const absent = total - attended;
            
            // Determine status color
            let statusClass = 'good';
            let statusText = 'Good';
            if (percentage < 75) {
                statusClass = 'critical';
                statusText = 'Critical';
            } else if (percentage < 85) {
                statusClass = 'warning';
                statusText = 'Warning';
            }

            container.innerHTML += `
                <div class="attendance-card">
                    <div class="attendance-header">
                        <h3>${a.course_name}</h3>
                        <span class="attendance-badge ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div class="attendance-content">
                        <div class="pie-chart-container">
                            <div class="pie-chart" style="--percentage: ${percentage};">
                                <div class="pie-chart-center">
                                    <span class="percentage-text">${percentage}%</span>
                                    <span class="percentage-label">Present</span>
                                </div>
                            </div>
                            <div class="pie-legend">
                                <div class="legend-item">
                                    <span class="legend-color present"></span>
                                    <span class="legend-text">Present: ${attended}</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-color absent"></span>
                                    <span class="legend-text">Absent: ${absent}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="attendance-stats">
                            <div class="stat-item">
                                <span class="stat-icon">📚</span>
                                <div class="stat-content">
                                    <span class="stat-value">${total}</span>
                                    <span class="stat-label">Total Classes</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">✅</span>
                                <div class="stat-content">
                                    <span class="stat-value">${attended}</span>
                                    <span class="stat-label">Attended</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">❌</span>
                                <div class="stat-content">
                                    <span class="stat-value">${absent}</span>
                                    <span class="stat-label">Missed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML += `</div>`; // Close course-attendance-grid

    } catch (e) {
        console.error("Failed to load attendance", e);
        const container = document.getElementById("attendance-table");
        container.innerHTML = `
            <div class="error-message">
                <p>⚠️ Failed to load attendance data</p>
            </div>
        `;
    }
}
