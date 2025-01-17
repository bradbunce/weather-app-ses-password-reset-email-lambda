const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.REGION });

exports.handler = async (event) => {
  // Log the incoming event for debugging
  console.log('Incoming event:', JSON.stringify(event, null, 2));

  try {
    // Validate input
    if (!event.email || !event.resetToken) {
      console.error('Missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing email or reset token' })
      };
    }

    // Construct reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${event.resetToken}`;

    // Email parameters
    const params = {
      Source: process.env.SENDER_EMAIL, // Verified SES email
      Destination: { 
        ToAddresses: [event.email] 
      },
      Message: {
        Subject: { 
          Data: 'Password Reset Request for Weather App' 
        },
        Body: {
          Html: { 
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Password Reset Request</h2>
                  <p>You have requested to reset your password for the Weather App.</p>
                  <p>Click the button below to reset your password:</p>
                  <a href="${resetLink}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                  ">Reset Password</a>
                  <p>If you did not request a password reset, please ignore this email.</p>
                  <p>This link will expire in 1 hour.</p>
                </body>
              </html>
            `
          },
          Text: { 
            Data: `
Password Reset Request for Weather App

Click the following link to reset your password:
${resetLink}

If you did not request a password reset, please ignore this email.

This link will expire in 1 hour.
            `
          }
        }
      }
    };

    // Send email
    const result = await ses.sendEmail(params).promise();

    console.log('Email sent successfully', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Password reset email sent successfully',
        messageId: result.MessageId
      })
    };

  } catch (error) {
    console.error('Error sending password reset email:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send password reset email',
        details: error.message 
      })
    };
  }
};