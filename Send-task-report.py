import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email account settings
sender_email = "your_email@gmail.com"
sender_password = "your_app_password"
receiver_email = "receiver_email@example.com"

# Email subject and body
subject = "📋 Weekly Project Tasks Report"
body = """
Dear Team,
I hope this message finds you well.
Here are the delayed project tasks:
- Task 1: In Progress
- Task 2: Completed
- Task 3: Not Started
Please review and let me know if you have any questions.
Best regards,  
Project Management Office
"""

# Create the email message
message = MIMEMultipart()
message['From'] = sender_email
message['To'] = receiver_email
message['Subject'] = subject
message.attach(MIMEText(body, 'plain'))

# Send the email via Gmail SMTP server
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(sender_email, sender_password)
    server.sendmail(
        sender_email,
        receiver_email,
        message.as_string()
    )
    print(
        "✅ Email sent successfully!"
    )
    server.quit()
except Exception as e:
    print(
        f"❌ Failed to send email: {e}"
    )