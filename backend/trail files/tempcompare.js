const bcrypt = require("bcryptjs");

const testPassword = async () => {
    const plainPassword = "newpassword1";  // Replace with what you entered in Postman
    const hashedPassword = "$2b$10$9DjbYNuTKePioPdcJ5g4e.fs7K7AkN0m6DVhWqJpgAVu2z7bn/q/O";  // Copy from the database

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("Password Match:", isMatch);
};

testPassword();
