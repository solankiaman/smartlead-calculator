# 🧮 Smartlead Calculator Assignment

This is a fully functional calculator web app built using **React + Vite**, with a Node.js + MongoDB backend for logging audit events. Developed as part of the GTM Engineer assignment at **Smartlead.ai**.

---

## ✨ Features Implemented

✅ Basic operations: `+`, `-`, `x`, `÷`, `.`  
✅ `=` shows result but retains input  
✅ **Chained calculations**: `2 + 2 = 4`, then `- 1 =` gives `3`  
✅ Audit logs are sent to backend with `id`, `timestamp`, `action`, and `value`  
✅ **Clear** button to reset input and result manually  
✅ Operator buttons are styled with different colors and hover effects  
✅ Fully **responsive UI** (mobile + desktop support)

---

## 🌐 Technologies Used

| Frontend        | Backend         | DevOps / Infra       |
|-----------------|------------------|-----------------------|
| React + Vite    | Node.js (Express) | MongoDB Atlas         |
| CSS (Custom)    | Mongoose          | Vercel (Frontend)     |
| Axios           | CORS              | Render (Backend API)  |

---

## 📦 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/solankiaman520/smartlead-calculator.git
cd smartlead-calculator

npm install
npm run dev
