/************************
* AUTHENTICATION SYSTEM *
************************/
// Global variables
let generatedOTP = null;
let otpExpiry = null;

// Initialize auth system based on current page
function initializeAuthSystem() {
    if (window.location.pathname.includes('login.html')) {
        setupLoginPage();
    } 
    else if (window.location.pathname.includes('register.html')) {
        setupRegistrationPage();
    }
    else {
        checkAuthentication();
    }
}

function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    // Auto-focus username field on page load
    document.getElementById('username')?.focus();

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Enhanced input validation
        if (!username || !password) {
            showLoginError("Please enter both username and password");
            return;
        }
        
        if (password.length < 6) {
            showLoginError("Password must be at least 6 characters");
            return;
        }
        
        // Get registered users from localStorage
        const validUsers = JSON.parse(localStorage.getItem('library-users')) || [
            { username: "admin", password: "admin123", role: "librarian" },
            { username: "user", password: "user123", role: "member" }
        ];
        
        const user = validUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Successful login - store minimal session data
            const sessionData = {
                loggedIn: true,
                userRole: user.role || 'member',
                username: username,
                loginTime: new Date().getTime()
            };
            sessionStorage.setItem('library-session', JSON.stringify(sessionData));
            
            // Redirect to home page
            window.location.href = "index.html";
        } else {
            showLoginError("Invalid credentials. Don't have an account? <a href='register.html'>Create one</a>");
        }
    });
    
    // Switch to registration view
    document.getElementById('show-register')?.addEventListener('click', function() {
        window.location.href = "register.html";
    });
}

function setupRegistrationPage() {
    const registerForm = document.getElementById('register-form');
    const sendOTPBtn = document.getElementById('send-otp');
    const otpGroup = document.getElementById('otp-group');
    const registerBtn = document.getElementById('register-btn');
    
    if (!registerForm) return;

    // Auto-focus first field
    document.getElementById('reg-username')?.focus();

    // Enhanced phone number validation
    document.getElementById('reg-phone')?.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });

    // Password strength indicator
    document.getElementById('reg-password')?.addEventListener('input', function() {
        const strengthIndicator = document.getElementById('password-strength');
        if (!strengthIndicator) return;
        
        const strength = calculatePasswordStrength(this.value);
        strengthIndicator.textContent = `Strength: ${strength}`;
        strengthIndicator.className = `strength-${strength.toLowerCase()}`;
    });

    // Simulate OTP sending with rate limiting
    sendOTPBtn?.addEventListener('click', function() {
        const phone = document.getElementById('reg-phone').value.trim();
        
        if (!phone || phone.length < 10) {
            showRegistrationError("Please enter a valid 10-digit phone number");
            return;
        }
        
        // Check if OTP was recently sent
        const lastOTPSent = parseInt(localStorage.getItem(`lastOTP-${phone}`)) || 0;
        if (Date.now() - lastOTPSent < 60000) { // 1 minute cooldown
            showRegistrationError("Please wait before requesting another OTP");
            return;
        }
        
        // Generate random 6-digit OTP
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpiry = Date.now() + 300000; // 5 minutes expiry
        
        // Store OTP data
        localStorage.setItem(`lastOTP-${phone}`, Date.now().toString());
        
        // In real app, send via SMS API (Twilio, etc.)
        alert(`[DEMO] OTP sent to ${phone}: ${generatedOTP}`);
        
        if (otpGroup) otpGroup.style.display = 'block';
        if (registerBtn) registerBtn.disabled = false;
        
        // Start OTP expiry countdown
        startOTPTimer();
    });
    
    // Handle registration with enhanced validation
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const otp = document.getElementById('otp')?.value;
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const phone = document.getElementById('reg-phone')?.value.trim();
        
        // Input validation
        if (!username || !password) {
            showRegistrationError("Username and password are required");
            return;
        }
        
        if (username.length < 4) {
            showRegistrationError("Username must be at least 4 characters");
            return;
        }
        
        if (password.length < 6) {
            showRegistrationError("Password must be at least 6 characters");
            return;
        }
        
        // OTP verification
        if (otp !== generatedOTP || Date.now() > otpExpiry) {
            showRegistrationError("Invalid or expired OTP");
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('library-users')) || [];
        
        // Check if username exists
        if (users.some(u => u.username === username)) {
            showRegistrationError("Username already exists");
            return;
        }
        
        // Create new user with hashed password (in real app)
        const newUser = {
            username,
            password, // In production, hash this password
            phone: phone || '',
            role: "member",
            joinDate: new Date().toISOString()
        };
        
        // Save user
        users.push(newUser);
        localStorage.setItem('library-users', JSON.stringify(users));
        
        // Auto-login after registration
        const sessionData = {
            loggedIn: true,
            userRole: newUser.role,
            username: newUser.username,
            loginTime: new Date().getTime()
        };
        sessionStorage.setItem('library-session', JSON.stringify(sessionData));
        window.location.href = "index.html";
    });
}

function checkAuthentication() {
    // Check session data
    const sessionData = JSON.parse(sessionStorage.getItem('library-session'));
    
    // Redirect to login if not authenticated
    if (!sessionData?.loggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check session timeout (8 hours)
    const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;
    if (Date.now() - sessionData.loginTime > SESSION_TIMEOUT) {
        sessionStorage.clear();
        window.location.href = 'login.html?timeout=1';
        return;
    }
    
    // Display username in navigation
    if (sessionData.username && document.getElementById('logged-in-user')) {
        document.getElementById('logged-in-user').textContent = sessionData.username;
    }
    
    // Show admin controls if librarian
    if (sessionData.userRole === 'librarian') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // Setup logout functionality
    document.getElementById('logout-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// Helper functions
function showLoginError(message) {
    const errorElement = document.getElementById('error-msg');
    if (errorElement) {
        errorElement.innerHTML = message;
        errorElement.style.display = 'block';
    } else {
        alert(message.replace(/<[^>]*>/g, '')); // Fallback with stripped HTML
    }
}

function showRegistrationError(message) {
    const errorElement = document.getElementById('reg-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

function calculatePasswordStrength(password) {
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        return 'Strong';
    }
    return 'Medium';
}

function startOTPTimer() {
    const timerElement = document.getElementById('otp-timer');
    if (!timerElement) return;

    const expiryTime = otpExpiry;
    timerElement.style.display = 'block';
    
    const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, expiryTime - now);
        
        if (remaining <= 0) {
            clearInterval(timer);
            timerElement.textContent = 'OTP expired';
            generatedOTP = null;
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timerElement.textContent = `OTP expires in: ${minutes}m ${seconds}s`;
    }, 1000);
}

/**********************
 * MAIN APPLICATION   *
 **********************/
function initializeApplication() {
    // Check user role and adjust UI accordingly
    const sessionData = JSON.parse(sessionStorage.getItem('library-session'));
    if (sessionData?.userRole === 'member') {
        document.querySelectorAll('.librarian-only').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Tab switching functionality
    setupTabs();
    
    // Form handlers
    setupBookForm();
    setupMemberForm();
    setupTransactionForm();
    
    // Initialize data
    updateDashboardStats();
    document.getElementById('issue-date').valueAsDate = new Date();
    
    // Set default active tab if none is selected
    if (!document.querySelector('nav a.active')) {
        document.getElementById('home-tab')?.classList.add('active');
        document.getElementById('home-section')?.classList.add('active-section');
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and sections
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active-section'));
            
            // Add active class to clicked tab and corresponding section
            this.classList.add('active');
            const sectionId = this.id.replace('-tab', '-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active-section');
                
                // Refresh data when switching tabs
                refreshTabData(sectionId);
                
                // Scroll to top of section
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function refreshTabData(sectionId) {
    switch(sectionId) {
        case 'books-section':
            fetchBooks();
            break;
        case 'members-section':
            fetchMembers();
            break;
        case 'transactions-section':
            fetchTransactions();
            populateBookDropdown();
            populateMemberDropdown();
            break;
        case 'home-section':
            updateDashboardStats();
            break;
    }
}

function setupBookForm() {
    const bookForm = document.getElementById('book-form');
    if (!bookForm) return;

    // Auto-generate book ID if field is empty
    document.getElementById('book-id')?.addEventListener('focus', function() {
        if (!this.value) {
            this.value = 'BK-' + Date.now().toString().slice(-6);
        }
    });

    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const book = {
            id: document.getElementById('book-id').value.trim(),
            title: document.getElementById('book-title').value.trim(),
            author: document.getElementById('book-author').value.trim(),
            isbn: document.getElementById('book-isbn').value.trim(),
            status: document.getElementById('book-status').value,
            addedDate: new Date().toISOString().split('T')[0]
        };
        
        // Enhanced validation
        if (!book.id || !book.title || !book.author) {
            alert('Please fill in all required book fields');
            return;
        }
        
        if (!/^BK-\d{6}$/.test(book.id)) {
            alert('Book ID must be in format BK-123456');
            return;
        }
        
        saveBook(book);
        this.reset();
        fetchBooks();
        updateDashboardStats();
        showToast('Book saved successfully!');
    });
}

function setupMemberForm() {
    const memberForm = document.getElementById('member-form');
    if (!memberForm) return;

    // Auto-generate member ID if field is empty
    document.getElementById('member-id')?.addEventListener('focus', function() {
        if (!this.value) {
            this.value = 'MEM-' + Date.now().toString().slice(-6);
        }
    });

    // Email validation
    document.getElementById('member-email')?.addEventListener('blur', function() {
        if (this.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
            alert('Please enter a valid email address');
            this.focus();
        }
    });

    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const member = {
            id: document.getElementById('member-id').value.trim(),
            name: document.getElementById('member-name').value.trim(),
            email: document.getElementById('member-email').value.trim(),
            phone: document.getElementById('member-phone').value.trim(),
            joinDate: new Date().toISOString().split('T')[0]
        };
        
        // Enhanced validation
        if (!member.id || !member.name) {
            alert('Please fill in all required member fields');
            return;
        }
        
        if (!/^MEM-\d{6}$/.test(member.id)) {
            alert('Member ID must be in format MEM-123456');
            return;
        }
        
        saveMember(member);
        this.reset();
        fetchMembers();
        updateDashboardStats();
        showToast('Member saved successfully!');
    });
}

function setupTransactionForm() {
    const transactionForm = document.getElementById('transaction-form');
    if (!transactionForm) return;

    // Set default issue date to today
    document.getElementById('issue-date').valueAsDate = new Date();

    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const transaction = {
            bookId: document.getElementById('transaction-book').value,
            memberId: document.getElementById('transaction-member').value,
            issueDate: document.getElementById('issue-date').value,
            returnDate: document.getElementById('return-date').value || null,
            status: document.getElementById('return-date').value ? 'Returned' : 'Issued'
        };
        
        // Enhanced validation
        if (!transaction.bookId || !transaction.memberId) {
            alert('Please select both a book and a member');
            return;
        }
        
        issueBook(transaction);
        this.reset();
        document.getElementById('issue-date').valueAsDate = new Date();
        fetchTransactions();
        fetchBooks();
        updateDashboardStats();
        showToast('Transaction recorded successfully!');
    });

    document.getElementById('return-btn')?.addEventListener('click', handleBookReturn);
}

function handleBookReturn() {
    const bookId = document.getElementById('transaction-book').value;
    
    if (!bookId) {
        alert('Please select a book to return');
        return;
    }
    
    const transactions = getTransactions();
    const activeTransaction = transactions.find(t => t.bookId === bookId && t.status === 'Issued');
    
    if (!activeTransaction) {
        alert('This book is not currently issued');
        return;
    }
    
    // Update transaction
    activeTransaction.returnDate = new Date().toISOString().split('T')[0];
    activeTransaction.status = 'Returned';
    saveTransaction(activeTransaction);
    
    // Update book status
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    if (book) {
        book.status = 'Available';
        saveBook(book);
    }
    
    fetchTransactions();
    fetchBooks();
    updateDashboardStats();
    showToast('Book returned successfully!');
}

/**********************
 * DATA MANAGEMENT    *
 **********************/
// Book functions
function getBooks() {
    return JSON.parse(localStorage.getItem('library-books')) || [];
}

function saveBook(book) {
    const books = getBooks();
    const existingIndex = books.findIndex(b => b.id === book.id);
    
    if (existingIndex >= 0) {
        books[existingIndex] = book;
    } else {
        books.push(book);
    }
    
    localStorage.setItem('library-books', JSON.stringify(books));
}

function deleteBook(id) {
    // Check if book is currently issued
    const transactions = getTransactions();
    const isIssued = transactions.some(t => t.bookId === id && t.status === 'Issued');
    
    if (isIssued) {
        alert('Cannot delete a book that is currently issued');
        return false;
    }
    
    const books = getBooks().filter(b => b.id !== id);
    localStorage.setItem('library-books', JSON.stringify(books));
    return true;
}

function fetchBooks() {
    const books = getBooks();
    const booksList = document.getElementById('books-list');
    if (!booksList) return;

    booksList.innerHTML = '';
    
    if (books.length === 0) {
        booksList.innerHTML = '<tr><td colspan="6" class="no-data">No books found</td></tr>';
        return;
    }
    
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn || 'N/A'}</td>
            <td><span class="status-badge ${book.status.toLowerCase()}">${book.status}</span></td>
            <td>${book.addedDate || 'Unknown'}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${book.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${book.id}">Delete</button>
            </td>
        `;
        booksList.appendChild(row);
    });
    
    setupBookActionButtons();
}

function setupBookActionButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            editBook(bookId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this book?')) {
                if (deleteBook(bookId)) {
                    fetchBooks();
                    updateDashboardStats();
                    showToast('Book deleted successfully!');
                }
            }
        });
    });
}

function editBook(id) {
    const book = getBooks().find(b => b.id === id);
    if (book) {
        document.getElementById('book-id').value = book.id;
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-status').value = book.status;
        document.getElementById('books-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Member functions
function getMembers() {
    return JSON.parse(localStorage.getItem('library-members')) || [];
}

function saveMember(member) {
    const members = getMembers();
    const existingIndex = members.findIndex(m => m.id === member.id);
    
    if (existingIndex >= 0) {
        members[existingIndex] = member;
    } else {
        members.push(member);
    }
    
    localStorage.setItem('library-members', JSON.stringify(members));
}

function deleteMember(id) {
    // Check if member has active transactions
    const transactions = getTransactions();
    const hasActiveTransactions = transactions.some(t => t.memberId === id && t.status === 'Issued');
    
    if (hasActiveTransactions) {
        alert('Cannot delete member with active book transactions');
        return false;
    }
    
    const members = getMembers().filter(m => m.id !== id);
    localStorage.setItem('library-members', JSON.stringify(members));
    return true;
}

function fetchMembers() {
    const members = getMembers();
    const membersList = document.getElementById('members-list');
    if (!membersList) return;

    membersList.innerHTML = '';
    
    if (members.length === 0) {
        membersList.innerHTML = '<tr><td colspan="5" class="no-data">No members found</td></tr>';
        return;
    }
    
    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.email || 'N/A'}</td>
            <td>${member.phone || 'N/A'}</td>
            <td>${member.joinDate || 'Unknown'}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${member.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${member.id}">Delete</button>
            </td>
        `;
        membersList.appendChild(row);
    });
    
    setupMemberActionButtons();
}

function setupMemberActionButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            editMember(memberId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this member?')) {
                if (deleteMember(memberId)) {
                    fetchMembers();
                    updateDashboardStats();
                    showToast('Member deleted successfully!');
                }
            }
        });
    });
}

function editMember(id) {
    const member = getMembers().find(m => m.id === id);
    if (member) {
        document.getElementById('member-id').value = member.id;
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-email').value = member.email;
        document.getElementById('member-phone').value = member.phone;
        document.getElementById('members-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Transaction functions
function getTransactions() {
    return JSON.parse(localStorage.getItem('library-transactions')) || [];
}

function saveTransaction(transaction) {
    const transactions = getTransactions();
    
    // For new transactions, generate an ID
    if (!transaction.id) {
        transaction.id = 'TR-' + Date.now().toString().slice(-8);
    } else {
        // For existing transactions, update them
        const existingIndex = transactions.findIndex(t => t.id === transaction.id);
        if (existingIndex >= 0) {
            transactions[existingIndex] = transaction;
            localStorage.setItem('library-transactions', JSON.stringify(transactions));
            return;
        }
    }
    
    transactions.push(transaction);
    localStorage.setItem('library-transactions', JSON.stringify(transactions));
}

function issueBook(transaction) {
    // Update book status
    const books = getBooks();
    const book = books.find(b => b.id === transaction.bookId);
    if (book) {
        book.status = 'Issued';
        saveBook(book);
    }
    
    // Save transaction
    saveTransaction(transaction);
}

function fetchTransactions() {
    const transactions = getTransactions();
    const transactionsList = document.getElementById('transactions-list');
    if (!transactionsList) return;

    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<tr><td colspan="6" class="no-data">No transactions found</td></tr>';
        return;
    }
    
    // Sort by issue date (newest first)
    transactions.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    
    transactions.forEach(trans => {
        const book = getBooks().find(b => b.id === trans.bookId);
        const member = getMembers().find(m => m.id === trans.memberId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trans.id}</td>
            <td>${book ? book.title : 'Unknown Book'} (${trans.bookId})</td>
            <td>${member ? member.name : 'Unknown Member'} (${trans.memberId})</td>
            <td>${formatDate(trans.issueDate)}</td>
            <td>${trans.returnDate ? formatDate(trans.returnDate) : 'Not returned'}</td>
            <td><span class="status-badge ${trans.status.toLowerCase()}">${trans.status}</span></td>
        `;
        transactionsList.appendChild(row);
    });
}

// Dropdown functions
function populateBookDropdown() {
    const bookSelect = document.getElementById('transaction-book');
    if (!bookSelect) return;

    bookSelect.innerHTML = '<option value="">Select Book</option>';
    
    const availableBooks = getBooks().filter(b => b.status === 'Available');
    
    if (availableBooks.length === 0) {
        bookSelect.innerHTML = '<option value="" disabled>No available books</option>';
        return;
    }
    
    availableBooks.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = `${book.title} (${book.id})`;
        bookSelect.appendChild(option);
    });
}

function populateMemberDropdown() {
    const memberSelect = document.getElementById('transaction-member');
    if (!memberSelect) return;

    memberSelect.innerHTML = '<option value="">Select Member</option>';
    
    const members = getMembers();
    
    if (members.length === 0) {
        memberSelect.innerHTML = '<option value="" disabled>No members available</option>';
        return;
    }
    
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.id})`;
        memberSelect.appendChild(option);
    });
}

// Dashboard functions
function updateDashboardStats() {
    const books = getBooks();
    const members = getMembers();
    const transactions = getTransactions();
    
    const totalBooksEl = document.getElementById('total-books');
    const totalMembersEl = document.getElementById('total-members');
    const booksIssuedEl = document.getElementById('books-issued');
    const overdueBooksEl = document.getElementById('overdue-books');
    
    if (totalBooksEl) totalBooksEl.textContent = books.length;
    if (totalMembersEl) totalMembersEl.textContent = members.length;
    if (booksIssuedEl) booksIssuedEl.textContent = books.filter(b => b.status === 'Issued').length;
    
    // Calculate overdue books (issued more than 14 days ago)
    if (overdueBooksEl) {
        const overdueCount = transactions.filter(t => {
            if (t.status === 'Issued') {
                const issueDate = new Date(t.issueDate);
                const daysOut = (Date.now() - issueDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysOut > 14;
            }
            return false;
        }).length;
        
        overdueBooksEl.textContent = overdueCount;
        overdueBooksEl.className = overdueCount > 0 ? 'stat-value warning' : 'stat-value';
    }
    
    // Recent activity chart data
    updateRecentActivityChart();
}

function updateRecentActivityChart() {
    // This would integrate with a charting library in a real app
    const transactions = getTransactions();
    
    // Get last 7 days of transactions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTransactions = transactions.filter(t => 
        new Date(t.issueDate) >= sevenDaysAgo
    );
    
    // Group by day
    const activityByDay = {};
    recentTransactions.forEach(t => {
        const day = t.issueDate.split('T')[0];
        activityByDay[day] = (activityByDay[day] || 0) + 1;
    });
    
    // Update UI - in a real app, this would render a chart
    const activityList = document.getElementById('recent-activity');
    if (activityList) {
        activityList.innerHTML = Object.entries(activityByDay)
            .map(([date, count]) => `<li>${formatDate(date)}: ${count} transactions</li>`)
            .join('');
    }
}

/**********************
 * UTILITY FUNCTIONS  *
 **********************/
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**********************
 * INITIALIZATION     *
 **********************/
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthSystem();
    
    // Only initialize main app if we're not on auth pages
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
        initializeApplication();
    }
});
