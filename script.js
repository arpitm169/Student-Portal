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
        } catch (err) {
            console.error(err);
        }
    }

    /* ========= PAY BUTTON (FIXED — ONLY CHANGE) ========= */
    document.getElementById("pay-btn")?.addEventListener("click", async () => {
        const amount = parseFloat(document.getElementById("pay-amount").value);

        if (!amount || amount <= 0) {
            document.getElementById("payment-msg").textContent =
                "Enter a valid amount";
            return;
        }

        try {
            const res = await fetch("/finance/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: loggedInUser.id,
                    amount: amount
                })
            });

            const data = await res.json();

            if (!data.success) {
                document.getElementById("payment-msg").textContent =
                    data.message || "Payment failed";
                return;
            }

            document.getElementById("payment-msg").textContent =
                "Payment successful";
            document.getElementById("pay-amount").value = "";

            await loadFinanceData();

            pages.forEach(p => p.classList.remove("active"));
            document.getElementById("dashboard-page").classList.add("active");
            navItems.forEach(n => n.classList.remove("active"));
            navItems[0].classList.add("active");

        } catch {
            document.getElementById("payment-msg").textContent =
                "Payment failed";
        }
    });

    /* ========= COURSES ========= */
    async function loadEnrolledCourses() {
        try {
            const res = await fetch(`/courses/enrolled/${loggedInUser.id}`);
            const data = await res.json();
            const grid = document.getElementById("enrolled-courses-grid");

            grid.innerHTML = "";

            data.courses.forEach(c => {
                grid.innerHTML += `
                    <div class="course-card">
                        <div class="course-icon">${c.course_icon || "📚"}</div>
                        <div class="course-info">
                            <h3>${c.course_name}</h3>
                        </div>
                    </div>`;
            });
        } catch {}
    }

    /* ========= INSTRUCTORS ========= */
    async function loadInstructors() {
        try {
            const res = await fetch("/instructors");
            const data = await res.json();
            const section = document.querySelector(".instructors-section");
            section.innerHTML = "";

            data.instructors.forEach(i => {
                section.innerHTML += `
                    <div class="instructor-card">
                        <div class="instructor-avatar">${i.initials}</div>
                        <div>${i.name}</div>
                    </div>`;
            });
        } catch {}
    }

    /* ========= UTILS ========= */
    function getInputValue(id) {
        return document.getElementById(id)?.value.trim();
    }

    function getInitials(name) {
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    }

    function showLoginError(msg) {
        loginError.textContent = msg;
        loginError.classList.add("show");
    }

    function clearLoginError() {
        loginError.textContent = "";
        loginError.classList.remove("show");
    }

    function showRegisterError(msg) {
        registerError.textContent = msg;
        registerError.classList.add("show");
    }

    function formatNumber(num) {
        return parseFloat(num).toLocaleString("en-IN");
    }

    // Add this to the loadRegistration function to update the header display

    async function loadRegistration() {
        const nameInput = document.getElementById("reg-name-profile");
        if (!nameInput) return;

        try {
            const res = await fetch(`/profile/${loggedInUser.id}`);
            const data = await res.json();

            if (data.success) {
                // Populate form inputs
                document.getElementById("reg-name-profile").value = data.user.name || "";
                document.getElementById("reg-phone").value = data.user.phone || "";
                document.getElementById("reg-department").value = data.user.department || "";
                document.getElementById("reg-year").value = data.user.year || "";
                document.getElementById("reg-cgpa").value = data.user.cgpa || "";
                document.getElementById("reg-no").value = data.user.registration_no || "";

                // Update header display
                document.getElementById("profile-name-display").textContent = data.user.name || "—";
                document.getElementById("profile-regno-display").textContent = data.user.registration_no || "—";
                document.getElementById("profile-dept-display").textContent = data.user.department || "—";
                document.getElementById("profile-year-display").textContent = data.user.year || "—";
                
                // Update avatar with initials
                const initials = getInitials(data.user.name || "Student");
                document.getElementById("profile-avatar").textContent = initials;
            }
        } catch {
            console.error("Failed to load profile");
        }
    }

    // Update the save function to refresh the header display
    saveBtn?.addEventListener("click", async () => {
    const payload = {
        user_id: loggedInUser.id,
        name: document.getElementById("reg-name-profile").value, // ✅ ADD HERE
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





