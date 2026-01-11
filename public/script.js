async function verify() {
  const email = document.getElementById("email").value;

  await fetch("/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  document.getElementById("result").textContent =
    "Verifying decision-maker status…";

  pollStatus(email);
}

async function pollStatus(email) {
  const res = await fetch(`/status?email=${encodeURIComponent(email)}`);
  const data = await res.json();

  if (data.status === "COMPLETED") {
    document.getElementById("result").textContent = JSON.stringify(
      data.result,
      null,
      2
    );
    return;
  }

  setTimeout(() => pollStatus(email), 5000);
}
