import java.util.ArrayList;
import java.util.Date;
import java.util.List;

// Book class
class Book {
    private String id;
    private String title;
    private String author;
    private String isbn;
    private String status; // Available, Issued

    public Book(String id, String title, String author, String isbn, String status) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.status = status;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

// Member class
class Member {
    private String id;
    private String name;
    private String email;
    private String phone;

    public Member(String id, String name, String email, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}

// Transaction class
class Transaction {
    private String id;
    private String bookId;
    private String memberId;
    private Date issueDate;
    private Date returnDate;
    private String status; // Issued, Returned

    public Transaction(String id, String bookId, String memberId, Date issueDate, Date returnDate, String status) {
        this.id = id;
        this.bookId = bookId;
        this.memberId = memberId;
        this.issueDate = issueDate;
        this.returnDate = returnDate;
        this.status = status;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public Date getIssueDate() { return issueDate; }
    public void setIssueDate(Date issueDate) { this.issueDate = issueDate; }
    public Date getReturnDate() { return returnDate; }
    public void setReturnDate(Date returnDate) { this.returnDate = returnDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

// LibraryService class to manage operations
class LibraryService {
    private List<Book> books;
    private List<Member> members;
    private List<Transaction> transactions;

    public LibraryService() {
        this.books = new ArrayList<>();
        this.members = new ArrayList<>();
        this.transactions = new ArrayList<>();
    }

    // Book operations
    public void addBook(Book book) {
        books.add(book);
    }

    public Book getBookById(String id) {
        return books.stream().filter(b -> b.getId().equals(id)).findFirst().orElse(null);
    }

    public List<Book> getAllBooks() {
        return new ArrayList<>(books);
    }

    public void updateBook(Book book) {
        Book existing = getBookById(book.getId());
        if (existing != null) {
            existing.setTitle(book.getTitle());
            existing.setAuthor(book.getAuthor());
            existing.setIsbn(book.getIsbn());
            existing.setStatus(book.getStatus());
        }
    }

    public void deleteBook(String id) {
        books.removeIf(b -> b.getId().equals(id));
    }

    // Member operations
    public void addMember(Member member) {
        members.add(member);
    }

    public Member getMemberById(String id) {
        return members.stream().filter(m -> m.getId().equals(id)).findFirst().orElse(null);
    }

    public List<Member> getAllMembers() {
        return new ArrayList<>(members);
    }

    public void updateMember(Member member) {
        Member existing = getMemberById(member.getId());
        if (existing != null) {
            existing.setName(member.getName());
            existing.setEmail(member.getEmail());
            existing.setPhone(member.getPhone());
        }
    }

    public void deleteMember(String id) {
        members.removeIf(m -> m.getId().equals(id));
    }

    // Transaction operations
    public void issueBook(Transaction transaction) {
        // Update book status
        Book book = getBookById(transaction.getBookId());
        if (book != null) {
            book.setStatus("Issued");
        }
        
        transactions.add(transaction);
    }

    public void returnBook(String transactionId) {
        Transaction transaction = transactions.stream()
            .filter(t -> t.getId().equals(transactionId))
            .findFirst()
            .orElse(null);
            
        if (transaction != null) {
            transaction.setReturnDate(new Date());
            transaction.setStatus("Returned");
            
            // Update book status
            Book book = getBookById(transaction.getBookId());
            if (book != null) {
                book.setStatus("Available");
            }
        }
    }

    public List<Transaction> getAllTransactions() {
        return new ArrayList<>(transactions);
    }

    // Statistics
    public int getTotalBooks() {
        return books.size();
    }

    public int getTotalMembers() {
        return members.size();
    }

    public int getBooksIssued() {
        return (int) books.stream().filter(b -> b.getStatus().equals("Issued")).count();
    }
}

// Main class
public class LibraryManagementSystem {
    public static void main(String[] args) {
        // Initialize library service
        LibraryService libraryService = new LibraryService();
        
        // Add sample data
        libraryService.addBook(new Book("B001", "Java Programming", "John Doe", "1234567890", "Available"));
        libraryService.addBook(new Book("B002", "Python Basics", "Jane Smith", "0987654321", "Available"));
        
        libraryService.addMember(new Member("M001", "Alice Johnson", "alice@example.com", "555-1234"));
        libraryService.addMember(new Member("M002", "Bob Williams", "bob@example.com", "555-5678"));
        
        // Display statistics
        System.out.println("Library Management System");
        System.out.println("Total Books: " + libraryService.getTotalBooks());
        System.out.println("Total Members: " + libraryService.getTotalMembers());
        System.out.println("Books Issued: " + libraryService.getBooksIssued());
        
        // In a real application, you would connect this backend to the frontend
        // using a web framework like Spring Boot and REST API endpoints
    }
}
