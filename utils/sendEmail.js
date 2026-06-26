const nodemailer=require('nodemailer');


const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',        
      port: 587,                     
      secure: false,                 
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.verify();      // ← ADD THIS (test connection)
    console.log('✅ Email connected');

    const mailOptions = {
      from: `"ShopNest Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
  }
};

module.exports = sendEmail;

//Your Node.js App
//       ↓
// Login to Gmail using

// GMAIL_USER + GMAIL_PASS
//         ↓
// Gmail Server
//         ↓
// Send Email
//         ↓
// User receives email