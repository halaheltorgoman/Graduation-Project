const fs = require("fs");
const path = require("path");
const transporter = require("../config/nodemailer.js");

/**
 * Reads an HTML email template and replaces placeholders with actual data.
 * @param {string} templateName - Name of the HTML template file (e.g., "welcomeEmailSender.html").
 * @param {Object} replacements - Key-value pairs for placeholders in the template.
 * @returns {string} - The final HTML content with injected values.
 */
const getHtmlTemplate = (templateName, replacements) => {
  // Ensure correct absolute path
  const templatePath = path.join(process.cwd(), "templates", templateName);

  try {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, "utf-8");

    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    return html;
  } catch (error) {
    console.error(` Error reading email template: ${error.message}`);
    return ""; // Return an empty string if there's an issue
  }
};

/**
 * Sends an email using a specified HTML template.
 * @param {string} to - Recipient email.
 * @param {string} subject - Email subject.
 * @param {string} templateName - HTML template filename.
 * @param {Object} replacements - Data to inject into the template.
 */
const sendEmail = async (to, subject, templateName, replacements) => {
  try {
    const htmlContent = getHtmlTemplate(templateName, replacements);

    if (!htmlContent) {
      throw new Error("Email template could not be loaded.");
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

module.exports = sendEmail;
