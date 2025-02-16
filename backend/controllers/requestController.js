import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import RequestWork from "../models/requestWorkModel.js";
import Admin from "../models/adminModel.js";

// Create a new request
export const createRequest = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const newRequest = new RequestWork({ name, email, phone, role });
    await newRequest.save();

    res.status(201).json({ message: "Request submitted successfully.", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error submitting request.", error: error.message });
  }
};

// Process a request (accept or reject)
export const processRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const request = await RequestWork.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (action === "reject") {
      request.status = "rejected";
      await request.save();
      return res.status(200).json({ message: "Request rejected" });
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save(); // Save updated status

      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const newAdmin = new Admin({
        name: request.name,
        email: request.email,
        password: hashedPassword,
        role: request.role,
      });
      await newAdmin.save();

      // Email Configuration
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: "filliaspprt@gmail.com", pass: "jixa brvi qjks aczy", },
      });

      const emailContent = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Work Acceptance</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #F5F8FA;
    }

    table, td {
      border-collapse: collapse;
    }

    .container {
      width: 100%;
      max-width: 500px;
      margin: 50px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    }

    .header {
      background-color: #ff6347;
      padding: 20px;
      text-align: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: bold;
    }

    .main-content {
      padding: 30px;
      color: #000000;
    }

    .button {
      display: block;
      width: fit-content;
      margin: 20px auto;
      background: #ff6347;
      text-decoration: none;
      padding: 12px 30px;
      color: #ffffff;
      font-size: 16px;
      font-weight: bold;
      border-radius: 5px;
      text-align: center;
    }

    .footer {
      font-size: 12px;
      text-align: center;
      color: #7E7E7E;
      padding: 20px;
    }

    @media only screen and (max-width: 480px) {
      .container {
        width: 90% !important;
      }

      .button {
        width: 70% !important;
      }
    }
  </style>
</head>
<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="header">
                  <h1>Work Acceptance</h1>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Dear ${request.name},
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    We are pleased to inform you that your application for the <strong>${request.role}</strong> role has been accepted!
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    You can log in with the following credentials:
                  </p>
                  <ul style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    <li>Email: <strong>${request.email}</strong></li>
                    <li>Password: <strong>${generatedPassword}</strong></li>
                  </ul>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0;">
                    Regards,<br>
                    The Fillia's Team
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  If you have any questions, contact our support at filliaspprt@gmail.com.
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;


      await transporter.sendMail({
        from: "filliaspprt@gmail.com",
        to: request.email,
        subject: "Work Acceptance - Fillia's Team",
        html: emailContent,
      });

      console.log("Email Sent Successfully");
      res.status(200).json({ message: "Request accepted and user added as admin." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error processing request.", error: error.message });
  }
};

// Ask a question 
export const questionRequest = async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ success: false, message: 'Email and message are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: "10121762@mu.edu.lb", pass: "dbhg dulj ezwm guzc", },
    });

    const mailOptions = {
      from: email,
      to: 'filliaspprt@gmail.com',
      subject: 'User Question',
      text: `From: ${email}\n\nMessage:\n${message}`,
      replyTo: email,
    };

    const info = await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
}

// Get all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await RequestWork.find();
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requests.", error: error.message });
  }
};





