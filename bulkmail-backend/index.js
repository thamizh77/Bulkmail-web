const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ EXPLICIT SMTP CONFIG (IMPORTANT)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,              // 🔑 MUST
  secure: false,          // 🔑 MUST (true only for 465)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify once at startup
transporter.verify((err) => {
  if (err) {
    console.error("❌ Transporter error:", err);
  } else {
    console.log("✅ Transporter ready");
  }
});

app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  if (!msg || !emailList || emailList.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message or email list missing",
    });
  }

  try {
    for (const email of emailList) {
      await transporter.sendMail({
        from: `"Bulk Mail App" <${process.env.EMAIL}>`,
        to: email,
        subject: "Bulk Mail Test",
        text: msg,
      });
    }

    res.json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (err) {
    console.error("❌ Send error:", err);
    res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
});

// 🔥 IMPORTANT: Render PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
