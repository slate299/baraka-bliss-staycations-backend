// services/emailService.js
const nodemailer = require("nodemailer");

// Store transporter and test account info
let transporter = null;
let testAccount = null;

/**
 * Initialize email transporter (creates Ethereal test account)
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  try {
    // Create a free Ethereal test account
    testAccount = await nodemailer.createTestAccount();
    console.log("✅ Ethereal test account created:");
    console.log("   Username:", testAccount.user);
    console.log("   Password:", testAccount.pass);
    console.log("   Preview URL: https://ethereal.email");

    // Create transporter
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return transporter;
  } catch (error) {
    console.error("❌ Failed to create Ethereal account:", error);
    return null;
  }
};

/**
 * Send confirmation email to user
 */
exports.sendInquiryConfirmation = async (inquiry, apartment) => {
  try {
    const transport = await initTransporter();
    if (!transport) {
      console.log("⚠️ Email transporter not available");
      return { success: false, error: "Email service not available" };
    }

    const mailOptions = {
      from: '"Baraka Bliss Properties" <noreply@barakabliss.com>',
      to: inquiry.email,
      subject: "We received your inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Thank you for your interest!</h2>
          <p>Dear <strong>${inquiry.name}</strong>,</p>
          <p>We've received your inquiry about:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">${apartment.name}</h3>
            <p><strong>Location:</strong> ${apartment.city}, ${apartment.area}</p>
            <p><strong>Price:</strong> KES ${apartment.price}/night</p>
          </div>
          
          <p><strong>Your message:</strong></p>
          <blockquote style="border-left: 4px solid #3498db; padding-left: 15px; color: #555;">
            ${inquiry.message}
          </blockquote>
          
          <p>We'll get back to you within <strong>24 hours</strong>.</p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #777; font-size: 12px;">
            Baraka Bliss Properties<br>
            Your trusted property partner
          </p>
          
          <p style="color: #999; font-size: 10px; margin-top: 20px;">
            This is a test email from Ethereal. No real emails were sent.
          </p>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);

    // Get preview URL (Ethereal specific)
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log("✅ Confirmation email sent!");
    console.log("📧 Preview URL:", previewUrl);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification email to admin
 */
exports.sendAdminNotification = async (inquiry, apartment) => {
  try {
    const transport = await initTransporter();
    if (!transport) {
      return { success: false, error: "Email service not available" };
    }

    const mailOptions = {
      from: '"Baraka Bliss System" <system@barakabliss.com>',
      to: "admin@barakabliss.com", // Will be caught by Ethereal
      subject: "🔔 New Property Inquiry Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Inquiry Received</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">${apartment.name}</h3>
            <p><strong>Location:</strong> ${apartment.city}, ${apartment.area}</p>
            <p><strong>Price:</strong> KES ${apartment.price}/night</p>
          </div>
          
          <h3>Guest Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; background-color: #f2f2f2;"><strong>Name:</strong></td>
              <td style="padding: 8px;">${inquiry.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background-color: #f2f2f2;"><strong>Email:</strong></td>
              <td style="padding: 8px;">${inquiry.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; background-color: #f2f2f2;"><strong>Date:</strong></td>
              <td style="padding: 8px;">${new Date(inquiry.createdAt).toLocaleString()}</td>
            </tr>
          </table>
          
          <h3>Message:</h3>
          <blockquote style="border-left: 4px solid #3498db; padding-left: 15px; color: #555;">
            ${inquiry.message}
          </blockquote>
          
          <p style="margin-top: 30px;">
            <a href="#" style="background-color: #3498db; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px;">
              View in Dashboard (Coming Soon)
            </a>
          </p>
          
          <p style="color: #999; font-size: 10px; margin-top: 20px;">
            This is a test email from Ethereal. No real emails were sent.
          </p>
        </div>
      `,
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log("✅ Admin notification sent!");
    console.log("📧 Preview URL:", previewUrl);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Test email configuration
 */
exports.testEmail = async (testEmail = "test@example.com") => {
  try {
    const testInquiry = {
      name: "Test User",
      email: testEmail,
      message:
        "This is a test inquiry to verify email notifications are working correctly.",
      _id: "test-123",
      createdAt: new Date(),
    };

    const testApartment = {
      name: "Test Apartment",
      city: "Nairobi",
      area: "Westlands",
      price: 5000,
    };

    console.log("📧 Sending test confirmation email...");
    const result = await exports.sendInquiryConfirmation(
      testInquiry,
      testApartment,
    );

    if (result.success) {
      console.log("✅ Test email sent successfully!");
      console.log("🔗 Preview your email at:", result.previewUrl);
      return result;
    } else {
      console.log("❌ Test email failed:", result.error);
      return result;
    }
  } catch (error) {
    console.error("❌ Test email error:", error);
    return { success: false, error: error.message };
  }
};

// Auto-initialize on load
initTransporter().catch(console.error);
