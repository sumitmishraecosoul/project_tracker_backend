const nodemailer = require('nodemailer');
const User = require('../models/User');
const Brand = require('../models/Brand');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // Configure email transporter (using Gmail as example)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'your-app-password'
        }
      });
      
      console.log('Email service initialized');
    } catch (error) {
      console.error('Error initializing email service:', error);
    }
  }

  /**
   * Send mention email notification
   * @param {Object} mentionData - Mention data
   * @returns {Promise<boolean>} Success status
   */
  async sendMentionEmail(mentionData) {
    try {
      const { mentionedUser, mentionedBy, comment, task, project, brand } = mentionData;
      
      const subject = `You were mentioned in ${task.title}`;
      const html = this.generateMentionEmailHtml(mentionedUser, mentionedBy, comment, task, project, brand);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@projecttracker.com',
        to: mentionedUser.email,
        subject: subject,
        html: html
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Mention email sent to ${mentionedUser.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending mention email:', error);
      return false;
    }
  }

  /**
   * Send comment email notification
   * @param {Object} commentData - Comment data
   * @returns {Promise<boolean>} Success status
   */
  async sendCommentEmail(commentData) {
    try {
      const { recipient, commenter, comment, task, project, brand } = commentData;
      
      const subject = `New comment on ${task.title}`;
      const html = this.generateCommentEmailHtml(recipient, commenter, comment, task, project, brand);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@projecttracker.com',
        to: recipient.email,
        subject: subject,
        html: html
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Comment email sent to ${recipient.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending comment email:', error);
      return false;
    }
  }

  /**
   * Send reply email notification
   * @param {Object} replyData - Reply data
   * @returns {Promise<boolean>} Success status
   */
  async sendReplyEmail(replyData) {
    try {
      const { recipient, replier, reply, parentComment, task, project, brand } = replyData;
      
      const subject = `Reply to your comment on ${task.title}`;
      const html = this.generateReplyEmailHtml(recipient, replier, reply, parentComment, task, project, brand);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@projecttracker.com',
        to: recipient.email,
        subject: subject,
        html: html
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Reply email sent to ${recipient.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending reply email:', error);
      return false;
    }
  }

  /**
   * Send activity email notification
   * @param {Object} activityData - Activity data
   * @returns {Promise<boolean>} Success status
   */
  async sendActivityEmail(activityData) {
    try {
      const { recipient, activity, task, project, brand } = activityData;
      
      const subject = `Activity update: ${task.title}`;
      const html = this.generateActivityEmailHtml(recipient, activity, task, project, brand);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@projecttracker.com',
        to: recipient.email,
        subject: subject,
        html: html
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Activity email sent to ${recipient.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending activity email:', error);
      return false;
    }
  }

  /**
   * Generate mention email HTML
   * @param {Object} mentionedUser - Mentioned user
   * @param {Object} mentionedBy - User who mentioned
   * @param {Object} comment - Comment object
   * @param {Object} task - Task object
   * @param {Object} project - Project object
   * @param {Object} brand - Brand object
   * @returns {string} HTML content
   */
  generateMentionEmailHtml(mentionedUser, mentionedBy, comment, task, project, brand) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>You were mentioned</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .comment { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>You were mentioned in a comment</h2>
            <p><strong>${mentionedBy.name}</strong> mentioned you in a comment on <strong>${task.title}</strong></p>
          </div>
          
          <div class="content">
            <h3>Task: ${task.title}</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Brand:</strong> ${brand.name}</p>
            
            <div class="comment">
              <p><strong>Comment by ${mentionedBy.name}:</strong></p>
              <p>${comment.content}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}" class="button">View Task</a>
          </div>
          
          <div class="footer">
            <p>This email was sent because you were mentioned in a comment. You can manage your notification preferences in your account settings.</p>
            <p>&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate comment email HTML
   * @param {Object} recipient - Recipient user
   * @param {Object} commenter - Commenter user
   * @param {Object} comment - Comment object
   * @param {Object} task - Task object
   * @param {Object} project - Project object
   * @param {Object} brand - Brand object
   * @returns {string} HTML content
   */
  generateCommentEmailHtml(recipient, commenter, comment, task, project, brand) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New comment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .comment { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New comment added</h2>
            <p><strong>${commenter.name}</strong> added a comment to <strong>${task.title}</strong></p>
          </div>
          
          <div class="content">
            <h3>Task: ${task.title}</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Brand:</strong> ${brand.name}</p>
            
            <div class="comment">
              <p><strong>Comment by ${commenter.name}:</strong></p>
              <p>${comment.content}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}" class="button">View Task</a>
          </div>
          
          <div class="footer">
            <p>This email was sent because you are subscribed to updates on this task. You can manage your notification preferences in your account settings.</p>
            <p>&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate reply email HTML
   * @param {Object} recipient - Recipient user
   * @param {Object} replier - Replier user
   * @param {Object} reply - Reply object
   * @param {Object} parentComment - Parent comment object
   * @param {Object} task - Task object
   * @param {Object} project - Project object
   * @param {Object} brand - Brand object
   * @returns {string} HTML content
   */
  generateReplyEmailHtml(recipient, replier, reply, parentComment, task, project, brand) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reply to your comment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .comment { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .reply { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Reply to your comment</h2>
            <p><strong>${replier.name}</strong> replied to your comment on <strong>${task.title}</strong></p>
          </div>
          
          <div class="content">
            <h3>Task: ${task.title}</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Brand:</strong> ${brand.name}</p>
            
            <div class="comment">
              <p><strong>Your original comment:</strong></p>
              <p>${parentComment.content}</p>
            </div>
            
            <div class="reply">
              <p><strong>Reply by ${replier.name}:</strong></p>
              <p>${reply.content}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}" class="button">View Task</a>
          </div>
          
          <div class="footer">
            <p>This email was sent because someone replied to your comment. You can manage your notification preferences in your account settings.</p>
            <p>&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate activity email HTML
   * @param {Object} recipient - Recipient user
   * @param {Object} activity - Activity object
   * @param {Object} task - Task object
   * @param {Object} project - Project object
   * @param {Object} brand - Brand object
   * @returns {string} HTML content
   */
  generateActivityEmailHtml(recipient, activity, task, project, brand) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Activity update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .activity { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Activity update</h2>
            <p>There was a new activity on <strong>${task.title}</strong></p>
          </div>
          
          <div class="content">
            <h3>Task: ${task.title}</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Brand:</strong> ${brand.name}</p>
            
            <div class="activity">
              <p><strong>Activity:</strong> ${activity.description}</p>
              <p><strong>By:</strong> ${activity.user.name}</p>
              <p><strong>Time:</strong> ${new Date(activity.createdAt).toLocaleString()}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}" class="button">View Task</a>
          </div>
          
          <div class="footer">
            <p>This email was sent because you are subscribed to updates on this task. You can manage your notification preferences in your account settings.</p>
            <p>&copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email configuration
   * @returns {Promise<boolean>} Success status
   */
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        console.error('Email transporter not initialized');
        return false;
      }
      
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }

  /**
   * Get email service statistics
   * @returns {Object} Service statistics
   */
  getServiceStatistics() {
    return {
      isConfigured: this.transporter !== null,
      service: 'gmail',
      from: process.env.EMAIL_FROM || 'noreply@projecttracker.com'
    };
  }
}

module.exports = new EmailService();
