document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Fetch envia os dados ao servidor (backend)
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const messageElement = document.getElementById("message");
  if (response.ok) {
    window.location.href = "protected.html";
  } else {
    const errorMessage = await response.text();
    messageElement.textContent = errorMessage;
  }
});
