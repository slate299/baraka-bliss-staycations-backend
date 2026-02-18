# **Baraka Bliss Staycations – Backend**

## **Project Overview**

This is the **Node.js + Express backend** for the Baraka Bliss Staycations MVP. It provides APIs for:

- Managing apartment listings with multiple images/videos
- Handling user inquiries
- Storing data in **MongoDB Atlas**

The backend is designed to support a Flutter frontend for an MVP staycation booking platform.

---

## **Features**

- **CRUD operations** for apartments
- **File uploads** (images/videos) using Multer
- **Inquiry submission** linked to specific apartments
- **CORS enabled** for frontend requests
- **Environment-based configuration** with `.env`

---

## **Folder Structure**

```
baraka-bliss-backend/
├── controllers/       # Business logic
├── models/            # MongoDB schemas
├── routes/            # API endpoints
├── uploads/           # Temporary storage for media files
├── middleware/        # Multer config
├── server.js          # Express server
├── package.json
└── .env               # Environment variables (not pushed)
```

---

## **Installation & Setup**

1. Clone the repository:

```bash
git clone https://github.com/slate299/baraka-bliss-staycations-backend.git
cd baraka-bliss-staycations-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root with:

```
MONGO_URI=<your-mongodb-connection-string>
```

4. Start the server:

```bash
npm start
```

5. Server will run at:

```
http://localhost:5000
```

---

## **API Endpoints**

### **Apartments**

| Method | Endpoint              | Description                                                |
| ------ | --------------------- | ---------------------------------------------------------- |
| GET    | `/api/apartments`     | Get all apartments                                         |
| GET    | `/api/apartments/:id` | Get single apartment                                       |
| POST   | `/api/apartments`     | Create new apartment (multipart/form-data with mediaFiles) |

### **Inquiries**

| Method | Endpoint         | Description                     |
| ------ | ---------------- | ------------------------------- |
| POST   | `/api/inquiries` | Submit inquiry for an apartment |

---

## **Notes**

- Uploaded files are stored temporarily in `uploads/`. For production, consider cloud storage (e.g., AWS S3, Cloudinary).
- Environment variables are required for MongoDB connection.
- The backend uses **CommonJS modules** (`require`, `module.exports`).

---

## **Author**

Natasha Hinga
