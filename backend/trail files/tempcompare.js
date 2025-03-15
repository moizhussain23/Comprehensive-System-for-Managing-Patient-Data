const bcrypt = require("bcrypt");

const enteredPassword = "doctor12@pass"; // 🔹 Replace with the actual password you want to check
const storedHash = "$2b$10$YmULRpDmntL.Y8EXPm7WZ.BESl2LyZB77PyeTItXKljwYCKNK7hyq"; // 🔹 Replace with the actual hash from your database

bcrypt.compare(enteredPassword, storedHash, (err, result) => {
  if (err) {
    console.error("Error comparing password:", err);
  } else {
    console.log("Password Match:", result ? "✅ Yes" : "❌ No");
  }
});
