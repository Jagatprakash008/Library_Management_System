
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
