import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export const sendConfirmationEmail = async (email: string, name: string, bookingDetails: any) => {
  return await resend.emails.send({
    from: 'JILK Integrated Services <onboarding@resend.dev>',
    to: email,
    subject: 'Your Cleaning Booking is Confirmed!',
    html: `
      <div>
        <h1>Hi ${name},</h1>
        <p>Your booking has been received and is pending confirmation. Here are the details:</p>
        <ul>
          <li><strong>Service:</strong> ${bookingDetails.serviceType}</li>
          <li><strong>Date:</strong> ${bookingDetails.preferredDate}</li>
          <li><strong>Time:</strong> ${bookingDetails.preferredTime}</li>
          <li><strong>Address:</strong> ${bookingDetails.address}, ${bookingDetails.city}</li>
        </ul>
        <p>We will contact you shortly if we need any more information.</p>
        <p>Thanks,<br/>The JILK Integrated Services Team</p>
      </div>
    `
  });
};

export const sendAdminNotification = async (bookingDetails: any) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jilkintegratedservices.com';
  return await resend.emails.send({
    from: 'JILK Integrated Services <onboarding@resend.dev>',
    to: adminEmail,
    subject: 'New Booking Request',
    html: `
      <div>
        <h2>New Booking Alert</h2>
        <p><strong>Customer:</strong> ${bookingDetails.firstName} ${bookingDetails.lastName}</p>
        <p><strong>Phone:</strong> ${bookingDetails.phone}</p>
        <p><strong>Email:</strong> ${bookingDetails.email}</p>
        <p><strong>Service:</strong> ${bookingDetails.serviceType} (${bookingDetails.frequency})</p>
        <p><strong>Date:</strong> ${bookingDetails.preferredDate} at ${bookingDetails.preferredTime}</p>
        <p><strong>Address:</strong> ${bookingDetails.address}, ${bookingDetails.city}, ${bookingDetails.state} ${bookingDetails.zip}</p>
        <p>Please log in to the admin portal to confirm.</p>
      </div>
    `
  });
};
