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
    const cancelBtn = document.getElementById("cancel-registration");
    const profileEditActions = document.getElementById("profile-edit-actions");

    const regInputs = [
        "reg-name-profile",
        "reg-no",
        "reg-phone",
        "reg-department",
        "reg-year",
        "reg-cgpa"
    ];
    
    let originalProfileData = {};

    editBtn?.addEventListener("click", () => {
        regInputs.forEach(id => {
            const el = document.getElementById(id);
            originalProfileData[id] = el.value;
            el.disabled = false;
        });

        editBtn.style.display = "none";
        profileEditActions?.classList.remove("hidden");

        const msg = document.getElementById("registration-msg");
        if (msg) {
            msg.className = "";
            msg.textContent = "";
        }
    });

    cancelBtn?.addEventListener("click", () => {
        regInputs.forEach(id => {
            const el = document.getElementById(id);
            el.value = originalProfileData[id] || "";
            el.disabled = true;
        });

        editBtn.style.display = "flex";
        profileEditActions?.classList.add("hidden");

        const msg = document.getElementById("registration-msg");
        if (msg) {
            msg.className = "";
            msg.textContent = "";
        }
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
        if (page === "payment") {
        loadPaymentPage();
    }
        if (page === "registration") {
        loadRegistration();
    }
    if (page === "courses") {
            loadAllCourses();   
        }
        if (page === "attendance") {
    loadAttendance();
}
if (page === "result") {
    loadResults();
}
if (page === "notice") {
    loadNotices();
}
if (page === "schedule") {
    loadSchedule();
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
    loadAttendanceSummary()
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
            document.getElementById("profile-cgpa-display").textContent = data.user.cgpa || "—";

            // ✅ Update avatar initials
            const initials = getInitials(data.user.name || "John Doe");
            document.getElementById("profile-avatar").textContent = initials;
        }
    } catch {
        console.error("Failed to load registration");
    }
}

saveBtn?.addEventListener("click", async () => {
    const saveBtnText = document.getElementById("save-btn-text");
    const saveBtnLoader = document.getElementById("save-btn-loader");
    const msgElement = document.getElementById("registration-msg");
    const profileEditActions = document.getElementById("profile-edit-actions");
    const editBtn = document.getElementById("edit-registration");
    
    saveBtn.disabled = true;
    saveBtnText.textContent = "Saving...";
    saveBtnLoader.classList.remove("hidden");
    msgElement.className = "";
    msgElement.textContent = "";

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
            msgElement.textContent = "Profile updated successfully!";
            msgElement.className = "success";

            // Disable fields again
            regInputs.forEach(id => {
                document.getElementById(id).disabled = true;
            });

            if(profileEditActions) profileEditActions.classList.add("hidden");
            if(editBtn) editBtn.style.display = "flex";
            
            loggedInUser.name = payload.name;
            document.getElementById("student-name").textContent = payload.name;
            document.getElementById("header-user-name").textContent = payload.name;
            document.getElementById("header-avatar").textContent = getInitials(payload.name);

            // Update header display with new values
            document.getElementById("profile-name-display").textContent = payload.name || "John Doe";
            document.getElementById("profile-regno-display").textContent = payload.registration_no || "—";
            document.getElementById("profile-dept-display").textContent = payload.department || "—";
            document.getElementById("profile-year-display").textContent = payload.year || "—";
            document.getElementById("profile-cgpa-display").textContent = payload.cgpa || "—";
            document.getElementById("profile-avatar").textContent = getInitials(payload.name || "John Doe");
        } else {
            msgElement.textContent = "Failed to update profile";
            msgElement.className = "error";
        }
    } catch {
        msgElement.textContent = "Server error occurred while saving";
        msgElement.className = "error";
    } finally {
        saveBtn.disabled = false;
        saveBtnText.textContent = "Save Changes";
        saveBtnLoader.classList.add("hidden");
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
let selectedPaymentMethod = 'Card';

// --- Payment method selector ---
document.querySelectorAll('.pay-method-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPaymentMethod = card.dataset.method;
    });
});

// --- Load payment page data ---
async function loadPaymentPage() {
    try {
        // Fetch finance + payment history in parallel
        const [finRes, histRes] = await Promise.all([
            fetch(`/finance/${loggedInUser.id}`),
            fetch(`/payments/${loggedInUser.id}`)
        ]);
        const finData = await finRes.json();
        const histData = await histRes.json();

        // Update fee summary card
        if (finData.success && finData.finance) {
            const f = finData.finance;
            const total = Number(f.total_amount);
            const paid = Number(f.paid_amount);
            const remaining = Number(f.overdue_amount);
            const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

            document.getElementById('pay-total').textContent = `₹ ${formatNumber(total)}`;
            document.getElementById('pay-paid').textContent = `₹ ${formatNumber(paid)}`;
            document.getElementById('pay-remaining').textContent = `₹ ${formatNumber(remaining)}`;

            // Progress bar
            document.getElementById('pay-progress-fill').style.width = `${pct}%`;
            document.getElementById('pay-progress-label').textContent = `${pct}% paid`;

            // Badge
            const badge = document.getElementById('pay-status-badge');
            if (remaining <= 0) {
                badge.textContent = 'ALL CLEARED';
                badge.className = 'pay-summary-badge cleared';
            } else {
                badge.textContent = 'PENDING';
                badge.className = 'pay-summary-badge pending';
            }
        }

        // Update payment history table
        const tbody = document.getElementById('pay-history-body');
        tbody.innerHTML = '';

        if (histData.success && histData.payments && histData.payments.length > 0) {
            histData.payments.forEach((p, i) => {
                const date = new Date(p.paid_at);
                const dateStr = date.toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });

                const methodIcons = { 'Card': '💳', 'UPI': '📱', 'Net Banking': '🏦' };
                const icon = methodIcons[p.payment_method] || '💳';

                tbody.innerHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${dateStr}</td>
                        <td><strong>₹ ${formatNumber(p.amount)}</strong></td>
                        <td><span class="pay-method-badge">${icon} ${p.payment_method}</span></td>
                        <td>
                            <button class="btn-receipt" onclick='downloadReceipt(${JSON.stringify(p)})'>
                                📄 Receipt
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted-foreground);">No payments yet</td></tr>';
        }
    } catch (e) {
        console.error('Failed to load payment page', e);
    }
}

// --- Pay button handler ---
document.getElementById('pay-btn')?.addEventListener('click', async () => {
    const amountInput = document.getElementById('pay-amount');
    const inputWrapper = amountInput.closest('.pay-input-wrapper');
    const msgElement = document.getElementById('payment-msg');
    const payBtn = document.getElementById('pay-btn');
    const btnText = document.getElementById('pay-btn-text');
    const btnLoader = document.getElementById('pay-btn-loader');
    const amount = parseFloat(amountInput.value);

    // Reset states
    inputWrapper.classList.remove('error', 'success');
    msgElement.className = '';
    msgElement.textContent = '';

    // Validate
    if (!amount || amount <= 0) {
        inputWrapper.classList.add('error');
        msgElement.textContent = '✗ Please enter a valid amount';
        msgElement.className = 'error';
        return;
    }

    // Show loading state
    payBtn.disabled = true;
    btnText.textContent = 'Processing...';
    btnLoader.classList.remove('hidden');

    try {
        const response = await fetch('/finance/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: loggedInUser.id,
                amount: amount,
                payment_method: selectedPaymentMethod
            })
        });

        const data = await response.json();

        if (data.success) {
            inputWrapper.classList.add('success');
            msgElement.textContent = `✓ Payment of ₹${formatNumber(amount)} via ${selectedPaymentMethod} successful!`;
            msgElement.className = 'success';
            amountInput.value = '';

            // Refresh all payment data
            await Promise.all([loadPaymentPage(), loadFinanceData()]);
        } else {
            inputWrapper.classList.add('error');
            msgElement.textContent = '✗ ' + (data.message || 'Payment failed');
            msgElement.className = 'error';
        }
    } catch (error) {
        inputWrapper.classList.add('error');
        msgElement.textContent = '✗ An error occurred. Please try again.';
        msgElement.className = 'error';
    } finally {
        // Reset button
        payBtn.disabled = false;
        btnText.textContent = 'Pay Now';
        btnLoader.classList.add('hidden');
    }
});

// --- Download Receipt ---
function downloadReceipt(payment) {
    const date = new Date(payment.paid_at);
    const dateStr = date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });
    const txnId = 'TXN' + String(payment.payment_id).padStart(8, '0');

    const receiptHTML = `
    <!DOCTYPE html>
    <html><head>
        <title>Payment Receipt - ${txnId}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', sans-serif;
                background: #f5f7fb;
                padding: 40px;
                color: #1a1a2e;
            }
            .receipt {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            }
            .receipt-header {
                background: linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #7c3aed 100%);
                color: white;
                padding: 2rem 2.5rem;
                text-align: center;
            }
            .receipt-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
            .receipt-header p { opacity: 0.85; font-size: 0.9rem; }
            .receipt-body { padding: 2rem 2.5rem; }
            .receipt-row {
                display: flex;
                justify-content: space-between;
                padding: 0.875rem 0;
                border-bottom: 1px solid #e5e9f2;
            }
            .receipt-row:last-child { border-bottom: none; }
            .receipt-label { color: #64748b; font-size: 0.9rem; }
            .receipt-value { font-weight: 600; font-size: 0.95rem; }
            .receipt-amount {
                text-align: center;
                padding: 1.5rem;
                margin: 1rem 0;
                background: #f0fdf4;
                border-radius: 12px;
                border: 1px solid #bbf7d0;
            }
            .receipt-amount .label { font-size: 0.85rem; color: #64748b; }
            .receipt-amount .value { font-size: 2rem; font-weight: 700; color: #16a34a; }
            .receipt-footer {
                text-align: center;
                padding: 1.5rem;
                background: #f8f9fd;
                font-size: 0.8rem;
                color: #64748b;
            }
            .receipt-status {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                background: #dcfce7;
                color: #16a34a;
                font-weight: 700;
                font-size: 0.8rem;
                margin-top: 0.5rem;
            }
            .print-btn {
                display: block;
                margin: 1.5rem auto;
                padding: 0.75rem 2rem;
                background: #4a5aba;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
            }
            .print-btn:hover { background: #3d4a9a; }
            @media print {
                body { padding: 0; background: white; }
                .print-btn { display: none; }
                .receipt { box-shadow: none; }
            }
        </style>
    </head><body>
        <div class="receipt">
            <div class="receipt-header">
                <h1>🎓 Student Portal</h1>
                <p>Payment Receipt</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-amount">
                    <div class="label">Amount Paid</div>
                    <div class="value">₹ ${Number(payment.amount).toLocaleString('en-IN')}</div>
                    <span class="receipt-status">✓ PAID</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Transaction ID</span>
                    <span class="receipt-value">${txnId}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Student Name</span>
                    <span class="receipt-value">${loggedInUser.name}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Payment Method</span>
                    <span class="receipt-value">${payment.payment_method}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Date</span>
                    <span class="receipt-value">${dateStr}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Time</span>
                    <span class="receipt-value">${timeStr}</span>
                </div>
            </div>
            <div class="receipt-footer">
                This is a computer-generated receipt. No signature required.
            </div>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
    </body></html>
    `;

    const win = window.open('', '_blank');
    win.document.write(receiptHTML);
    win.document.close();
}

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
async function loadResults() {
    try {
        const res = await fetch(`/results/${loggedInUser.id}`);
        const data = await res.json();

        const tbody = document.getElementById("result-table-body");
        tbody.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">No results published yet</td>
                </tr>
            `;
            return;
        }

        data.results.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>${r.course_name}</td>
                    <td>${r.internal_marks}</td>
                    <td>${r.external_marks}</td>
                    <td><strong>${r.total_marks}</strong></td>
                    <td>${r.grade}</td>
                    <td style="color:${r.status === 'PASS' ? 'green' : 'red'};">
                        ${r.status}
                    </td>
                </tr>
            `;
        });
    } catch {
        console.error("Failed to load results");
    }
}

// Enhanced loadNotices function with better structure
async function loadNotices() {
    try {
        const res = await fetch("/notices");
        const data = await res.json();

        const container = document.getElementById("notice-container");
        container.innerHTML = "";

        data.notices.forEach(n => {
            container.innerHTML += `
                <div class="notice-card ${n.is_pinned ? "pinned" : ""}">
                    <div class="notice-icon">${n.icon}</div>
                    <div class="notice-body">
                        <span class="notice-type">${n.notice_type}</span>
                        <h3>${n.title}</h3>
                        <p>${n.content}</p>
                        <small>${new Date(n.posted_at).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
        });
    } catch {
        console.error("Failed to load notices");
    }
}

async function loadSchedule() {
    try {
        const res = await fetch(`/schedule/${loggedInUser.id}`);
        const data = await res.json();

        const grid = document.getElementById("schedule-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const dayInitials = { Monday:"Mo", Tuesday:"Tu", Wednesday:"We", Thursday:"Th", Friday:"Fr" };

        // Group by day
        const grouped = {};
        days.forEach(d => grouped[d] = []);
        data.schedule.forEach(s => {
            if (grouped[s.day_of_week]) grouped[s.day_of_week].push(s);
        });

        const colors = ["sched-color-0","sched-color-1","sched-color-2","sched-color-3","sched-color-4","sched-color-5"];

        days.forEach(day => {
            const items = grouped[day];
            const count = items.length;

            let itemsHTML = "";
            if (count === 0) {
                itemsHTML = `
                    <div class="sched-empty">
                        <span class="sched-empty-icon">🌙</span>
                        No classes
                    </div>`;
            } else {
                items.forEach((item, i) => {
                    const colorClass = colors[i % colors.length];
                    // Format time: "08:00:00" → "08:00 AM"
                    const fmt = t => {
                        const [h, m] = t.split(":");
                        const hr = parseInt(h);
                        return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
                    };
                    itemsHTML += `
                        <div class="schedule-item ${colorClass}">
                            <span class="sched-item-icon">${item.course_icon || "📘"}</span>
                            <span class="sched-item-name">${item.course_name}</span>
                            <span class="sched-item-time">🕐 ${fmt(item.start_time)} – ${fmt(item.end_time)}</span>
                            ${item.room ? `<span class="sched-item-room">📍 ${item.room}</span>` : ""}
                        </div>`;
                });
            }

            grid.innerHTML += `
                <div class="schedule-day">
                    <div class="sched-day-header">
                        <span class="sched-day-name">${day}</span>
                        <span class="sched-day-initial">${dayInitials[day]}</span>
                        <span class="sched-class-count">${count} class${count !== 1 ? "es" : ""}</span>
                    </div>
                    <div class="sched-items">${itemsHTML}</div>
                </div>`;
        });

    } catch (e) {
        console.error("Failed to load schedule", e);
    }
}

// Optional: Add filter functionality
function initNoticeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filterType = btn.dataset.filter;
            const noticeCards = document.querySelectorAll('.notice-card');
            
            noticeCards.forEach(card => {
                if (filterType === 'all') {
                    card.style.display = 'block';
                } else {
                    const badge = card.querySelector('.notice-badge');
                    const cardType = badge ? badge.classList[1].replace('badge-', '') : '';
                    
                    if (cardType === filterType) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}
async function loadAttendanceSummary() {
    try {
        const res = await fetch(`/attendance/${loggedInUser.id}`);
        const data = await res.json();

        if (!data.attendance || data.attendance.length === 0) return;

        let totalClasses = 0;
        let attended = 0;

        data.attendance.forEach(a => {
            totalClasses += a.total_classes;
            attended += a.attended_classes;
        });

        const percent = totalClasses > 0
            ? Math.round((attended / totalClasses) * 100)
            : 0;

        const absent = totalClasses - attended;
        const deg = (percent / 100) * 360;

        // Set the conic-gradient angle via CSS variable
        document.querySelector(".attendance-circle")
            .style.setProperty("--attendance-deg", deg + "deg");

        document.getElementById("attendance-percentage").textContent = percent + "%";

        let status = "Good Standing 🎉";
        if (percent < 75) status = "⚠️ Low Attendance";
        else if (percent < 85) status = "⚡ Needs Improvement";

        document.getElementById("attendance-status").textContent = status;

        // Add legend if not already present
        const card = document.getElementById("attendance-summary-card");
        if (!card.querySelector(".attendance-legend")) {
            card.insertAdjacentHTML("beforeend", `
                <div class="attendance-legend">
                    <span>
                        <span class="legend-dot" style="background:#4caf50;"></span>
                        Present: ${attended}
                    </span>
                    <span>
                        <span class="legend-dot" style="background:#ef4444;"></span>
                        Absent: ${absent}
                    </span>
                </div>
            `);
        }

    } catch (e) {
        console.error("Failed to load attendance summary");
    }
}



