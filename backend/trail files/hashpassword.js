const bcrypt = require("bcryptjs");

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Hashed Password:", hashedPassword);
};

generateHash("receptionist2@pass");  // Change this to the new password you want
