import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create a transporter using your Gmail account
    // We use environment variables for security
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be an App Password, not the real password
      },
    });

    // Define the email options
    const mailOptions = {
      from: `"NSS SCE" <${process.env.EMAIL_USER}>`,
      to: email, // The dynamic email address from the frontend
      subject: 'Confirmation - PR Selection & POC Recommendations',
      text: `Dear ${name},\n\nWe’ve received your submissions loud and clear for:\n- Project Representative (PR) Selection\n- Your Point of Contact (POC) recommendations\n\nThank you for being part of this process. Every response helps shape what the next tenure looks like, and we’re glad you’re a part of it.\n\nOnwards and upwards 🚀\nNSS SCE`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Submission Confirmed</h2>
            <div style="height: 3px; width: 50px; background-color: #4f46e5; margin: 15px auto 0;"></div>
          </div>
          
          <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We’ve received your submissions loud and clear for:
          </p>
          
          <ul style="background-color: #f8fafc; padding: 15px 15px 15px 35px; border-radius: 8px; font-size: 15px; color: #334155; margin-bottom: 25px;">
            <li style="margin-bottom: 8px;"><strong>Project Representative (PR)</strong> Selection</li>
            <li>Your <strong>Point of Contact (POC)</strong> recommendations</li>
          </ul>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Thank you for being part of this process. Every response helps shape what the next tenure looks like, and we’re glad you’re a part of it.
          </p>
          
          <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 16px; color: #475569;">Onwards and upwards 🚀</p>
            <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #4f46e5;">NSS SCE</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email', error: error.message });
  }
}
