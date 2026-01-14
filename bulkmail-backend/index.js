const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());

// -------------------- NODEMAILER SETUP --------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Transporter error:", error);
  } else {
    console.log("✅ Transporter ready to send emails");
  }
});

// -------------------- API ROUTE --------------------
app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  // Validation
  if (!msg || !emailList || emailList.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message or email list is missing",
    });
  }

  try {
    // Send mail to each recipient
    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: emailList[i],
        subject: "A message from Bulk Mail App",
        text: msg,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
});

// -------------------- SERVER --------------------
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server Started on http://localhost:${PORT}`);
});
