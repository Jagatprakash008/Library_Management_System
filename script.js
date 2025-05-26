/************************
 * AUTHENTICATION SYSTEM *
 ************************/

// Check if we're on the login page
if (window.location.pathname.includes('login.html')) {
    // Login form handler
    document.getElementById('login-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Demo users - replace with real database in production
        const validUsers = [
            { username: "admin", password: "admin123", role: "librarian" },
            { username: "user", password: "user123", role: "member" }
        ];
        
        const user = validUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Store user session
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('userRole', user.role);
            sessionStorage.setItem('username', username);
            
            // Redirect to main page
            window.location.href = "index.html";
        } else {
            document.getElementById('error-msg').textContent = "Invalid username or password!";
        }
    });
}
// For all other pages - check authentication
else {
    // Redirect to login if not authenticated
    if (!sessionStorage.getItem('loggedIn')) {
        window.location.href = 'login.html';
    }
    
    // Display username if available
    const username = sessionStorage.getItem('username');
    if (username && document.getElementById('logged-in-user')) {
        document.getElementById('logged-in-user').textContent = username;
    }
    
    // Logout functionality
    document.getElementById('logout-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear session data
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
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
            document.getElementById(sectionId).classList.add('active-section');
            
            // Refresh data when switching tabs
            if (sectionId === 'books-section') {
                fetchBooks();
            } else if (sectionId === 'members-section') {
                fetchMembers();
            } else if (sectionId === 'transactions-section') {
                fetchTransactions();
                populateBookDropdown();
                populateMemberDropdown();
            } else if (sectionId === 'home-section') {
                updateDashboardStats();
            }
        });
    });
    
    // Book Form Handling
    const bookForm = document.getElementById('book-form');
    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const book = {
            id: document.getElementById('book-id').value,
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            isbn: document.getElementById('book-isbn').value,
            status: document.getElementById('book-status').value
        };
        
        // Here you would typically send this data to the backend
        // For now, we'll simulate it with localStorage
        saveBook(book);
        bookForm.reset();
        fetchBooks();
    });
    
    // Member Form Handling
    const memberForm = document.getElementById('member-form');
    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const member = {
            id: document.getElementById('member-id').value,
            name: document.getElementById('member-name').value,
            email: document.getElementById('member-email').value,
            phone: document.getElementById('member-phone').value
        };
        
        saveMember(member);
        memberForm.reset();
        fetchMembers();
    });
    
    // Transaction Form Handling
    const transactionForm = document.getElementById('transaction-form');
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const transaction = {
            bookId: document.getElementById('transaction-book').value,
            memberId: document.getElementById('transaction-member').value,
            issueDate: document.getElementById('issue-date').value,
            returnDate: document.getElementById('return-date').value || null,
            status: document.getElementById('return-date').value ? 'Returned' : 'Issued'
        };
        
        issueBook(transaction);
        transactionForm.reset();
        fetchTransactions();
        fetchBooks(); // Refresh book status
        updateDashboardStats();
    });
    
    document.getElementById('return-btn').addEventListener('click', function() {
        const bookSelect = document.getElementById('transaction-book');
        const bookId = bookSelect.value;
        
        if (!bookId) {
            alert('Please select a book to return');
            return;
        }
        
        // Find the transaction for this book that's not returned
        const transactions = getTransactions();
        const activeTransaction = transactions.find(t => t.bookId === bookId && t.status === 'Issued');
        
        if (!activeTransaction) {
            alert('This book is not currently issued');
            return;
        }
        
        // Update the transaction
        activeTransaction.returnDate = new Date().toISOString().split('T')[0];
        activeTransaction.status = 'Returned';
        saveTransaction(activeTransaction);
        
        // Update the book status
        const books = getBooks();
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.status = 'Available';
            saveBook(book);
        }
        
        fetchTransactions();
        fetchBooks();
        updateDashboardStats();
    });
    
    // Initialize the dashboard
    updateDashboardStats();
    
    // Helper functions for localStorage (simulating backend)
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
        const books = getBooks().filter(b => b.id !== id);
        localStorage.setItem('library-books', JSON.stringify(books));
    }
    
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
        const members = getMembers().filter(m => m.id !== id);
        localStorage.setItem('library-members', JSON.stringify(members));
    }
    
    function getTransactions() {
        return JSON.parse(localStorage.getItem('library-transactions')) || [];
    }
    
    function saveTransaction(transaction) {
        const transactions = getTransactions();
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
        transaction.id = Date.now().toString(); // Simple ID generation
        saveTransaction(transaction);
    }
    
    function fetchBooks() {
        const books = getBooks();
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = '';
        
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.status}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${book.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${book.id}">Delete</button>
                </td>
            `;
            booksList.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
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
                    deleteBook(bookId);
                    fetchBooks();
                    updateDashboardStats();
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
            
            // Scroll to the form
            document.getElementById('books-section').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function fetchMembers() {
        const members = getMembers();
        const membersList = document.getElementById('members-list');
        membersList.innerHTML = '';
        
        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.id}</td>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${member.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${member.id}">Delete</button>
                </td>
            `;
            membersList.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
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
                    deleteMember(memberId);
                    fetchMembers();
                    updateDashboardStats();
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
            
            // Scroll to the form
            document.getElementById('members-section').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function fetchTransactions() {
        const transactions = getTransactions();
        const transactionsList = document.getElementById('transactions-list');
        transactionsList.innerHTML = '';
        
        transactions.forEach(trans => {
            const book = getBooks().find(b => b.id === trans.bookId);
            const member = getMembers().find(m => m.id === trans.memberId);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trans.id}</td>
                <td>${book ? book.title : 'Unknown Book'}</td>
                <td>${member ? member.name : 'Unknown Member'}</td>
                <td>${trans.issueDate}</td>
                <td>${trans.returnDate || 'Not returned'}</td>
                <td>${trans.status}</td>
            `;
            transactionsList.appendChild(row);
        });
    }
    
    function populateBookDropdown() {
        const bookSelect = document.getElementById('transaction-book');
        bookSelect.innerHTML = '<option value="">Select Book</option>';
        
        const books = getBooks().filter(b => b.status === 'Available');
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} (${book.id})`;
            bookSelect.appendChild(option);
        });
    }
    
    function populateMemberDropdown() {
        const memberSelect = document.getElementById('transaction-member');
        memberSelect.innerHTML = '<option value="">Select Member</option>';
        
        const members = getMembers();
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.id})`;
            memberSelect.appendChild(option);
        });
    }
    
    function updateDashboardStats() {
        document.getElementById('total-books').textContent = getBooks().length;
        document.getElementById('total-members').textContent = getMembers().length;
        document.getElementById('books-issued').textContent = 
            getBooks().filter(b => b.status === 'Issued').length;
    }
    
    // Initialize date fields
    document.getElementById('issue-date').valueAsDate = new Date();
});
// Add this at the START of your script.js
// Check login status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Redirect to login if not authenticated
    if (!sessionStorage.getItem('loggedIn')) {
        window.location.href = 'login.html';
    }
    
    // Display username if available
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('logged-in-user').textContent = username;
    }
    
    // Rest of your existing code...
});

// Add this at the END of your script.js
// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Clear session data
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('username');
    
    // Redirect to login page
    window.location.href = 'login.html';
});
/***********************
 * REGISTRATION SYSTEM *
 ***********************/

// OTP storage (in real app, use server-side storage)
let generatedOTP = null;
let otpExpiry = null;

// Registration page logic
if (window.location.pathname.includes('register.html')) {
    const registerForm = document.getElementById('register-form');
    const sendOTPBtn = document.getElementById('send-otp');
    const otpGroup = document.getElementById('otp-group');
    const registerBtn = document.getElementById('register-btn');
    
    // Simulate OTP sending
    sendOTPBtn.addEventListener('click', function() {
        const phone = document.getElementById('reg-phone').value;
        
        if (!phone || phone.length < 10) {
            document.getElementById('reg-error').textContent = "Please enter a valid phone number";
            return;
        }
        
        // Generate random 6-digit OTP
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
        
        // In real app, send this OTP via SMS API (Twilio, etc.)
        alert(`[DEMO] OTP sent to ${phone}: ${generatedOTP}`);
        
        otpGroup.style.display = 'block';
        registerBtn.disabled = false;
    });
    
    // Handle registration
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const otp = document.getElementById('otp').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        
        // Verify OTP
        if (otp !== generatedOTP || Date.now() > otpExpiry) {
            document.getElementById('reg-error').textContent = "Invalid or expired OTP";
            return;
        }
        
        // Save user (in real app, send to server)
        const users = JSON.parse(localStorage.getItem('library-users') || [];
        users.push({ username, password, phone: document.getElementById('reg-phone').value });
        localStorage.setItem('library-users', JSON.stringify(users));
        
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    });
}
