import nodemailer from 'nodemailer';

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
