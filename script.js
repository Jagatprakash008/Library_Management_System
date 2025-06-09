
document.getElementById("studentForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const id = document.getElementById("studentId").value;
  const name = document.getElementById("name").value;
  const father = document.getElementById("fatherName").value;
  const course = document.getElementById("course").value;
  const branch = document.getElementById("branch").value;

  alert(Student Saved:\nID: ${id}\nName: ${name}\nFather: ${father}\nCourse: ${course}\nBranch: ${branch});
});

function logout() {
  alert("Logging out...");
}

function navigate(to) {
  alert(Navigating to: ${to});
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
