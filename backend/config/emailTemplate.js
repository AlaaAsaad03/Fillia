export const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Email Verification</title>
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
                  <h1>Email Verification</h1>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Dear User,
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    Thank you for registering with us! To complete your registration, please enter the following verification code on the verification page:
                  </p>
                  <p class="button">{{verificationToken}}</p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; font-weight: bold;">
                    Please note: This code will expire in 15 minutes for security reasons.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    If you did not request this email, please ignore it. No further action is required.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0;">
                    Regards,<br>
                    The Fillia's Team
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  If you have any questions, contact our support at support@yourcompany.com.
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

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Welcome to Fillia! </title>
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
      max-width: 600px;
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
      font-size: 24px;
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
      background: #FF6F61;
      text-decoration: none;
      padding: 12px 30px;
      color: white;
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
                  <h1>Welcome to Fillia!</h1>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Dear {{donorName}},
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    Thank you for joining us on this meaningful journey to support Lebanese families recovering after the hardships of war. At Fillia, we believe in the power of kindness and community to bring hope to those who need it most.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    With your help, we deliver customized care packages filled with essential items like food, clothes, and heating supplies to families in need. Every item you choose for your donation box makes a real difference in someone's life.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    Together, we can rebuild hope, one box at a time.
                  </p>
                  <a href="http://localhost:5173" class="button">Start Making a Difference</a>
                  <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:filliaspprt@gmail.com" style="color: #FF6F61;">filliaspprt@gmail.com</a>.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    Warm regards,<br>
                    The Fillia Team
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  You are receiving this email because you signed up on our platform. If you did not register, please ignore this email.
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

export const PASSWORD_RESET_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset Request</title>
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
      max-width: 600px;
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
      font-size: 24px;
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
      background:#ff6347;
      text-decoration: none;
      padding: 12px 30px;
      color:  #ffffff;
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
                  <h1>Password Reset Request</h1>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Hello {{userName}},
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    We received a request to reset the password for your account associated with this email: <span style="color: #4CAF50;">{{email}}</span>.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    If you did not request a password reset, please ignore this email. Your account remains secure.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                    To reset your password, click the button below:
                  </p>
                  <a href="{{resetURL}}" class="button">Reset Password</a>
                  <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    This link will expire in 1 hour for security reasons.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    If you have any issues or didn’t make this request, feel free to reach out to us at <a href="mailto:filliaspprt@gmail.com" style="color: #FF6F61;">filliaspprt@gmail.com</a>.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    Best regards,<br>
                    The Fillia Team
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  You are receiving this email because you requested a password reset. If you did not request this, please ignore this email.
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

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #FF6347, #FF6F61); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset. You can now log in with your new password.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #FF6347; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately at <a href="mailto:filliaspprt@gmail.com" style="color: #FF6F61;">filliaspprt@gmail.com</a>.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Fillia's Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;




