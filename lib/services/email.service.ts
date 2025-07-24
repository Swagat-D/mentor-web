import nodemailer from 'nodemailer';

interface SupportEmailData {
  ticketId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
  priority: string;
  userRole: string;
  userInfo: {
    name: string;
    email: string;
    role: string;
    joinDate: Date;
  };
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  
static async sendNotificationEmail(
  to: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<void> {
  const html = this.getNotificationEmailTemplate(title, message, actionUrl);
  await EmailService.sendEmail(to, title, html);
}
static async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
  try {
    const transporter = await this.getTransporter();
    await transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      // Validate required environment variables
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });

      // Verify connection
      try {
        await this.transporter!.verify();
        console.log('SMTP server connection verified successfully');
      } catch (error) {
        console.error('SMTP server connection failed:', error);
        throw new Error('Failed to connect to SMTP server');
      }
    }

    return this.transporter!;
  }

  private static fromEmail = process.env.EMAIL_FROM!;
  private static fromName = process.env.EMAIL_FROM_NAME || 'MentorMatch';
  private static appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  static async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${token}`;
    
    try {
      const transporter = await this.getTransporter();
      
      await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Verify Your MentorMatch Account',
        html: this.getVerificationEmailTemplate(verificationUrl, firstName),
        text: `Hello${firstName ? ` ${firstName}` : ''}!\n\nThank you for signing up for MentorMatch. Please verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe MentorMatch Team`,
      });
      
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;
    
    try {
      const transporter = await this.getTransporter();
      
      await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Reset Your MentorMatch Password',
        html: this.getPasswordResetEmailTemplate(resetUrl, firstName),
        text: `Hello${firstName ? ` ${firstName}` : ''}!\n\nWe received a request to reset your password. Please visit: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe MentorMatch Team`,
      });
      
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  static async sendWelcomeEmail(email: string, firstName: string, role: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Welcome to MentorMatch!',
        html: this.getWelcomeEmailTemplate(firstName, role),
        text: `Hello ${firstName}!\n\nWelcome to MentorMatch! We're excited to have you join our community.\n\nGet started: ${this.appUrl}/dashboard\n\nBest regards,\nThe MentorMatch Team`,
      });
      
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }

  static async sendOnboardingCompletionEmail(email: string, firstName: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: 'Your MentorMatch Application is Under Review',
        html: this.getOnboardingCompletionEmailTemplate(firstName),
        text: `Hello ${firstName}!\n\nThank you for completing your mentor application! Our team will review your profile and credentials within 24-48 hours.\n\nYou'll receive an email once your application is approved.\n\nBest regards,\nThe MentorMatch Team`,
      });
      
      console.log(`Onboarding completion email sent to ${email}`);
    } catch (error) {
      console.error('Error sending onboarding completion email:', error);
    }
  }

  private static getOnboardingCompletionEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Under Review</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MentorMatch</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Application Under Review</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B4513; margin-top: 0;">Hello ${firstName}!</h2>
            <p>Thank you for completing your mentor application! We're excited about the possibility of having you join our expert mentor community.</p>
            <p><strong>What happens next?</strong></p>
            <ul style="color: #666; padding-left: 20px;">
              <li>Our team will review your profile and credentials within 24-48 hours</li>
              <li>We'll verify your documents and qualifications</li>
              <li>You'll receive an email notification once your application is approved</li>
              <li>Once approved, you can start accepting student sessions immediately</li>
            </ul>
            <p>We appreciate your patience during the review process. If you have any questions, feel free to contact our support team.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">Best regards,<br>The MentorMatch Team</p>
          </div>
        </body>
      </html>
    `;
  }

private static getNotificationEmailTemplate(title: string, message: string, actionUrl?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">MentorMatch</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">Notification</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #8B4513; margin-top: 0;">${title}</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">${message}</p>
          ${actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${actionUrl}" 
                 style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            You received this notification because you have an active account with MentorMatch. 
            You can manage your notification preferences in your account settings.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The MentorMatch Team
          </p>
        </div>
      </body>
    </html>
  `;
}

static async sendMentorMessageEmail(
  studentEmail: string,
  studentName: string,
  mentorName: string,
  subject: string,
  message: string
): Promise<void> {
  try {
    const transporter = await this.getTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message from Your Mentor</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MentorMatch</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">📧 New Message from Your Mentor</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B4513; margin-top: 0;">Hello ${studentName}!</h2>
            
            <p>You have received a new message from your mentor <strong>${mentorName}</strong> on MentorMatch.</p>
            
            <div style="background: #e8ddd1; border-left: 4px solid #8B4513; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0;"><strong>From:</strong> ${mentorName}</p>
              <p style="margin: 5px 0 0 0;"><strong>Sent:</strong> ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div style="background: #f8f3ee; border-left: 4px solid #8B4513; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <div style="font-weight: bold; color: #8B4513; margin-bottom: 10px;">Subject: ${subject}</div>
              <div style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/messages" 
                 style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Message in Dashboard
              </a>
            </div>

            <p style="margin-top: 30px; color: #666;">
              <strong>Need to respond?</strong> Log in to your MentorMatch dashboard to reply to this message and continue the conversation with your mentor.
            </p>

            <p style="color: #888; font-size: 14px;">
              This message was sent through the MentorMatch platform. If you have any concerns about this message, please contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              The MentorMatch Team
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      New Message from Your Mentor

      Hello ${studentName},

      You have received a new message from your mentor ${mentorName} on MentorMatch.

      From: ${mentorName}
      Subject: ${subject}

      Message:
      ${message}

      To view and respond to this message, please log in to your MentorMatch dashboard:
      ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/messages

      Best regards,
      The MentorMatch Team
    `;

    await transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: studentEmail,
      subject: `New message from ${mentorName} - ${subject}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Mentor message email sent to ${studentEmail}`);
  } catch (error) {
    console.error('Error sending mentor message email:', error);
    throw new Error('Failed to send mentor message email');
  }
}

static async sendSupportEmail(data: SupportEmailData) {
    const priorityBadge = {
      urgent: '<span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">URGENT</span>',
      high: '<span style="background-color: #ea580c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">HIGH</span>',
      medium: '<span style="background-color: #ca8a04; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">MEDIUM</span>',
      low: '<span style="background-color: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">LOW</span>',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Support Ticket</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Support Ticket</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Ticket ID: #${data.ticketId}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
            <div style="margin-bottom: 20px;">
              <strong>Priority:</strong> ${priorityBadge[data.priority as keyof typeof priorityBadge] || priorityBadge.medium}
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong>Subject:</strong> ${data.subject}
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong>From:</strong> ${data.fromName} (${data.fromEmail})
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong>User Role:</strong> ${data.userRole.charAt(0).toUpperCase() + data.userRole.slice(1)}
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong>Message:</strong>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #8B4513;">
                ${data.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #8B4513;">User Information</h3>
              <p><strong>Name:</strong> ${data.userInfo.name}</p>
              <p><strong>Email:</strong> ${data.userInfo.email}</p>
              <p><strong>Role:</strong> ${data.userInfo.role}</p>
              <p><strong>Member Since:</strong> ${new Date(data.userInfo.joinDate).toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support/${data.ticketId}" 
                 style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View & Respond to Ticket
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>This email was sent automatically from the MentorMatch support system.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Support Ticket #${data.ticketId}
      
      Priority: ${data.priority.toUpperCase()}
      Subject: ${data.subject}
      From: ${data.fromName} (${data.fromEmail})
      User Role: ${data.userRole}
      
      Message:
      ${data.message}
      
      User Information:
      - Name: ${data.userInfo.name}
      - Email: ${data.userInfo.email}
      - Role: ${data.userInfo.role}
      - Member Since: ${new Date(data.userInfo.joinDate).toLocaleDateString()}
      
      View ticket: ${process.env.NEXT_PUBLIC_APP_URL}/admin/support/${data.ticketId}
    `;

    await this.sendEmail(
      'admin@mentormatch.com',
      `[${data.priority.toUpperCase()}] Support Ticket: ${data.subject}`,
      html,
      text
    );
  }

  static async sendSupportConfirmationEmail(
    userEmail: string,
    userName: string,
    ticketId: string,
    subject: string
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Support Ticket Confirmation</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Support Ticket Received</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
            <h2 style="color: #8B4513; margin-top: 0;">Hi ${userName},</h2>
            
            <p>Thank you for contacting MentorMatch support. We've received your support ticket and our team will respond within 4 hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #8B4513;">
              <h3 style="margin-top: 0; color: #8B4513;">Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticketId}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Status:</strong> Open</p>
            </div>
            
            <p>You can track the status of your ticket by visiting the Help & Support section in your dashboard.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" 
                 style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Support Center
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <h3 style="color: #8B4513;">Need Immediate Help?</h3>
            <p>For urgent matters, you can also:</p>
            <ul>
              <li>Use our live chat (available 24/7)</li>
              <li>Call us at +1-555-MENTOR (Mon-Fri 9AM-6PM EST)</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Best regards,<br>The MentorMatch Support Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hi ${userName},
      
      Thank you for contacting MentorMatch support. We've received your support ticket and our team will respond within 4 hours.
      
      Ticket Details:
      - Ticket ID: #${ticketId}
      - Subject: ${subject}
      - Status: Open
      
      You can track the status of your ticket by visiting the Help & Support section in your dashboard.
      
      Visit Support Center: ${process.env.NEXT_PUBLIC_APP_URL}/help
      
      Need Immediate Help?
      For urgent matters, you can also:
      - Use our live chat (available 24/7)
      - Call us at +1-555-MENTOR (Mon-Fri 9AM-6PM EST)
      
      Best regards,
      The MentorMatch Support Team
    `;

    await this.sendEmail(
      userEmail,
      `Support Ticket Received - #${ticketId}`,
      html,
      text
    );
  }


   private static getVerificationEmailTemplate(verificationUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MentorMatch</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Verify Your Email Address</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B4513; margin-top: 0;">Hello${firstName ? ` ${firstName}` : ''}!</h2>
            <p>Thank you for signing up for MentorMatch. To complete your registration and start your mentoring journey, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background: #e9e9e9; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p><strong>Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with MentorMatch, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">Best regards,<br>The MentorMatch Team</p>
          </div>
        </body>
      </html>
    `;
  }

  private static getPasswordResetEmailTemplate(resetUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MentorMatch</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Reset Your Password</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B4513; margin-top: 0;">Hello${firstName ? ` ${firstName}` : ''}!</h2>
            <p>We received a request to reset your password for your MentorMatch account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background: #e9e9e9; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p><strong>Note:</strong> This password reset link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">Best regards,<br>The MentorMatch Team</p>
          </div>
        </body>
      </html>
    `;
  }

  static async sendOTPEmail(email: string, otp: string, firstName?: string, type: 'signup' | 'reset' = 'signup'): Promise<void> {
  const subject = type === 'reset' ? 'Password Reset Code - MentorMatch' : 'Verify Your MentorMatch Account';
  
  try {
    const transporter = await this.getTransporter();
    
    await transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject,
      html: this.getOTPEmailTemplate(otp, firstName, type),
      text: `Hello${firstName ? ` ${firstName}` : ''}!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe MentorMatch Team`,
    });
    
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification code');
  }
}

private static getOTPEmailTemplate(otp: string, firstName?: string, type: 'signup' | 'reset' = 'signup'): string {
  const title = type === 'reset' ? 'Password Reset Code' : 'Verify Your Email';
  const message = type === 'reset' 
    ? 'Use this code to reset your password:' 
    : 'Use this code to verify your email address:';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">MentorMatch</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">${title}</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center;">
          <h2 style="color: #8B4513; margin-top: 0;">Hello${firstName ? ` ${firstName}` : ''}!</h2>
          <p>${message}</p>
          <div style="background: #fff; border: 2px dashed #8B4513; border-radius: 10px; padding: 20px; margin: 30px 0; display: inline-block;">
            <div style="font-size: 36px; font-weight: bold; color: #8B4513; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 14px; color: #666;">Best regards,<br>The MentorMatch Team</p>
        </div>
      </body>
    </html>
  `;
}

  private static getWelcomeEmailTemplate(firstName: string, role: string): string {
    const roleSpecificContent = role === 'mentor' 
      ? "You're now part of our expert mentor community! Complete your profile to start connecting with students and earning competitive rates."
      : "Welcome to our learning community! You can now search for expert mentors and book your first session.";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MentorMatch</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MentorMatch!</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Your journey starts here</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #8B4513; margin-top: 0;">Hello ${firstName}!</h2>
            <p>Welcome to MentorMatch! We're excited to have you join our community.</p>
            <p>${roleSpecificContent}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.appUrl}/dashboard" style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
            </div>
            <p>If you have any questions, our support team is here to help!</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">Best regards,<br>The MentorMatch Team</p>
          </div>
        </body>
      </html>
    `;
  }
}
