# Automating Task Reports

This project automates the process of sending email reports for delayed tasks. It includes two main scripts:

1. **Google Apps Script** for automating task reports via Google Sheets.
2. **Python Script** for sending delayed task reports using Gmail SMTP.

---

### 1. **Google Apps Script**

This script checks for delayed tasks in a Google Sheet and automatically sends an email with the details of those tasks.

### 2. **Python Script**

This script sends an email via Gmail with a list of delayed tasks. It uses Gmail's SMTP server and requires an app password for secure access.

---

### Setup Instructions

1. **Google Apps Script:**
   - Open your Google Sheets document.
   - Go to **Extensions > Apps Script**.
   - Paste the provided Google Apps Script code.
   - Set up a trigger to run the script periodically (e.g., daily or weekly).

2. **Python Script:**
   - Install Python on your system.
   - Make sure you have the necessary Python libraries installed: `smtplib`, `email`.
   - Replace the email credentials in the script with your own.
   - Run the Python script using a terminal or command line.

---

### Requirements

- Google Apps Script: A Google Sheets account.
- Python Script: A Gmail account with an **App Password** enabled for SMTP access.

---

### Benefits

- Save time by automating task reports.
- Improve team communication and task tracking.
- Stay on top of delayed tasks with automatic notifications.

---

### Notes

- Make sure to replace placeholder email addresses and passwords with your actual credentials.
- Use **Google App Passwords** for better security when working with Gmail.

---

### Conclusion

This project can help streamline your task reporting process by automating email notifications for delayed tasks, improving project visibility and efficiency.
