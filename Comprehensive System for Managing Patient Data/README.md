# Comprehensive System for Managing Patient Data

A robust web-based application designed to streamline the management of patient records, appointments, and medical histories within healthcare facilities. This system ensures efficient data handling, enhancing both administrative operations and patient care.

## Features

- **Patient Registration**: Securely register new patients with comprehensive personal and medical information.
- **Appointment Scheduling**: Efficiently manage and schedule patient appointments with healthcare providers.
- **Medical Records Management**: Maintain detailed and up-to-date medical histories for all patients.
- **User Authentication**: Ensure data security with role-based access controls for administrators and medical staff.

## Technologies Used

- **Frontend**: React.js, HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Version Control**: Git

## Installation and Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/moizhussain23/Comprehensive-System-for-Managing-Patient-Data.git
   cd Comprehensive-System-for-Managing-Patient-Data
   ```

2. **Install Backend Dependencies**:

   ```bash
   cd backend
   npm install
   ```

3. **Configure the Backend**:

   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     DB_HOST=your_database_host
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=your_database_name
     ```
   - Ensure your MySQL database is set up and accessible with the provided credentials.

4. **Start the Backend Server**:

   ```bash
   npm start
   ```

   The backend server will run on `http://localhost:5000`.

5. **Install Frontend Dependencies**:

   ```bash
   cd ../frontend
   npm install
   ```

6. **Configure the Frontend**:

   - Create a `.env` file in the `frontend` directory with the following variable:
     ```
     REACT_APP_API_URL=http://localhost:5000
     ```

7. **Start the Frontend Server**:

   ```bash
   npm start
   ```

   Access the application at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your proposed changes.



## Contact

For questions or support, please contact [Moiz Hussain](mailto\:mz5hus7@gmail.com).

---
