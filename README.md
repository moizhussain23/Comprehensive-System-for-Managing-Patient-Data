# **Comprehensive System for Managing Patient Data (CSMPD)**

A robust and fully digitalized **Hospital Management System** designed to streamline patient data handling, improve efficiency, and minimize paperwork. The system supports **three user roles**—**Receptionist, Doctor, and Patient**—with secure QR-based authentication and real-time data access.

---

## **🚀 Live Demo Links**
- **Receptionist Portal**: [Receptionist Login](http://csmpd-receptionist-login.netlify.app)
- **Doctor Portal**: [Doctor Login](http://csmpd-doctor-login.netlify.app)
- **Patient Portal**: [Patient Login](http://csmpd-patient-login.netlify.app)

---

## **🌟 Features**
- **Secure Authentication**: Login via **email/password** or **QR Code-based login (for patients)**.
- **Role-Based Access**:
  - **Receptionists** can register patients, manage appointments, and generate QR codes.
  - **Doctors** can access patient history, add prescriptions, and monitor visits.
  - **Patients** can view their medical records, prescriptions, and upcoming appointments.
- **Real-time Data Management**: Automatic updates of patient records.
- **Multi-Page Deployment**: Separate login portals for each role (**Receptionist, Doctor, and Patient**).
- **Deployed on Netlify & Railway**: Frontend on **Netlify**, Backend & Database on **Railway**.

---

## **🛠️ Tech Stack**
### **Frontend**
- React.js (with React Router for role-based navigation)
- Tailwind CSS for styling
- Netlify for hosting

### **Backend**
- Node.js with Express.js
- MySQL Database
- Railway.app for backend & database hosting
- JWT for authentication

---

## **📌 Project Structure**
```
Comprehensive System for Managing Patient Data
│── backend/              # Node.js backend with Express & MySQL
│── frontend/
│   │── receptionist/     # Receptionist login & dashboard
│   │── doctor/          # Doctor login & dashboard
│   │── patient/         # Patient login & dashboard
│── README.md
│── .env                 # Environment variables (backend)

```

---

## **🔧 Installation & Setup**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/moizhussain23/Comprehensive-System-for-Managing-Patient-Data.git
cd CSMPD
```

### **2️⃣ Backend Setup**
```sh
cd backend
npm install
```
- **Configure `.env` file in backend/**
  ```
  DB_HOST=your_database_host
  DB_USER=your_database_user
  DB_PASSWORD=your_database_password
  DB_NAME=your_database_name
  BACKEND_URL=https://your-backend-url.com
  PORT=5000
  ```
- **Run the Backend**:
  ```sh
  npm start
  ```
  _Backend will be running at `Your backend host`_

---

### **3️⃣ Frontend Setup (for Each Role)**
Go to each folder (`receptionist`, `doctor`, `patient`) and install dependencies:
```sh
cd frontend/receptionist
npm install
npm run build
```
_Repeat for doctor & patient_


---

## **🔑 Login Credentials for Testing**
| Role         | Email                        | Password               |
|--------------|------------------------------|------------------------|
| Receptionist | Bernardcampbell@example.com  | receptionist1@pass     |
| Doctor       | Sarahsmith@example.com       | doctor2@pass           |
| Patient      | robert.johnson@example.com   | robertJ@789            |

---

## **📢 Issues & Contributions**
Feel free to **open an issue** or **submit a pull request** to enhance this system.

---

## **📜 License**
This project is licensed under the **MIT License**.

---

💡 **Developed & Maintained by**: [MOIZ HUSSAIN](https://github.com/moizhussain23)
