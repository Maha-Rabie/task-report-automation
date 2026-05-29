# 📋 Task Report Automation

Automatically detect delayed tasks and send email notifications to your team — no manual chasing required. This project provides two independent scripts that solve the same problem through different platforms: one runs inside Google Sheets using Apps Script, the other runs anywhere Python is installed using Gmail SMTP.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [File Structure](#file-structure)
- [Script 1 — Google Apps Script](#script-1--google-apps-script)
  - [What it does](#what-it-does)
  - [Expected Sheet Format](#expected-sheet-format)
  - [Setup & Deployment](#setup--deployment)
  - [Scheduling with Triggers](#scheduling-with-triggers)
  - [Sample Email Output](#sample-email-output-apps-script)
- [Script 2 — Python SMTP Script](#script-2--python-smtp-script)
  - [What it does](#what-it-does-1)
  - [Configuration](#configuration)
  - [Getting a Gmail App Password](#getting-a-gmail-app-password)
  - [Running the Script](#running-the-script)
  - [Sample Email Output](#sample-email-output-python)
- [Requirements](#requirements)
- [Security Notes](#security-notes)

---

## Overview

Delayed tasks are a common blind spot in project management. This automation eliminates the need to manually scan spreadsheets or send status-update reminders. Both scripts share the same goal:

> **Scan a list of tasks → identify any that are overdue and not completed → send an email report.**

The two scripts are complementary and can be used independently or together:

| | Google Apps Script | Python Script |
|---|---|---|
| **Where it runs** | Inside Google Sheets | Any machine with Python |
| **Scheduling** | Google's built-in time-based triggers | Cron job, Task Scheduler, or manual |
| **Data source** | Reads directly from the spreadsheet | Hardcoded task list (customisable) |
| **Email service** | Google's `MailApp` (no credentials needed) | Gmail SMTP with App Password |
| **Best for** | Teams already using Google Workspace | Standalone automation or non-Google environments |

---

## How It Works

```
Google Sheet / task list
         │
         ▼
   Check each task:
   Is status ≠ "completed"
   AND due date < today?
         │
    ┌────┴────┐
   YES        NO
    │          │
    ▼          └─── Skip
Collect in
delayed list
    │
    ▼
Any delayed tasks?
    │
  ┌─┴──┐
 YES    NO
  │      │
  ▼      └─── Log "No delayed tasks" → Stop
Send email
with formatted
task list
```

---

## File Structure

```
task-report-automation/
├── function-sendDelayedTasksEmail.js   ← Google Apps Script (runs in Google Sheets)
├── Send-task-report.py                 ← Python SMTP script (runs locally or on a server)
└── README.md
```

---

## Script 1 — Google Apps Script

**File:** `function-sendDelayedTasksEmail.js`

### What it does

The function `sendDelayedTasksEmail()` reads every row in the active Google Sheet, checks whether each task is overdue (due date has passed and status is not `"completed"`), assembles a plain-text report of all delayed tasks, and sends it via Google's `MailApp` service. If no tasks are delayed, it logs a message and exits silently without sending any email.

**Logic walkthrough:**

```javascript
function sendDelayedTasksEmail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = sheet.getDataRange().getValues();  // read all rows

  let delayedTasks = "";
  const today = new Date();

  for (let i = 1; i < data.length; i++) {   // skip header row (i=0)
    const task    = data[i][0];   // column A
    const owner   = data[i][1];   // column B
    const status  = data[i][2];   // column C
    const dueDate = new Date(data[i][3]);   // column D

    // overdue = not completed AND due date is in the past
    if (status.toLowerCase() !== "completed" && dueDate < today) {
      delayedTasks += `• ${task} (Owner: ${owner}, Due: ${dueDate.toDateString()}, Status: ${status})\n`;
    }
  }

  if (delayedTasks === "") {
    Logger.log("No delayed tasks today.");
    return;                         // nothing to report — exit cleanly
  }

  MailApp.sendEmail({
    to: "youremail@example.com",
    subject: "📌 Delayed Tasks Report",
    body: `Hello,\n\nThe following tasks are delayed:\n\n${delayedTasks}\n\nBest regards,\nYour Automation Bot`
  });

  Logger.log("✅ Email sent.");
}
```

### Expected Sheet Format

The script reads columns A through D, starting from **row 2** (row 1 is treated as a header):

| Column | Field | Example |
|---|---|---|
| A | Task name | `Update project documentation` |
| B | Owner | `Ahmed` |
| C | Status | `In Progress` / `Not Started` / `Completed` |
| D | Due date | `2024-12-01` |

A task is flagged as delayed when **both** conditions are true:
- Column C (status) is anything other than `"completed"` (case-insensitive)
- Column D (due date) is earlier than today's date

### Setup & Deployment

1. Open your Google Sheets document containing the task list.
2. Go to **Extensions → Apps Script**.
3. Delete any existing placeholder code in the editor.
4. Paste the contents of `function-sendDelayedTasksEmail.js`.
5. On **line 32**, replace `"youremail@example.com"` with the actual recipient email address:
   ```javascript
   to: "your-team@example.com",
   ```
6. Click **Save** (floppy disk icon or `Ctrl+S`).
7. Click **Run** to execute it once manually and confirm it works. Grant the required permissions when prompted (the script needs access to Sheets and Gmail on your behalf).
8. Check **View → Logs** to see whether it logged `"✅ Email sent."` or `"No delayed tasks today."`.

### Scheduling with Triggers

To run the report automatically on a schedule:

1. In the Apps Script editor, click the **clock icon** (Triggers) in the left sidebar, or go to **Edit → Current project's triggers**.
2. Click **+ Add Trigger** (bottom right).
3. Configure:
   - **Function to run:** `sendDelayedTasksEmail`
   - **Event source:** Time-driven
   - **Time-based trigger:** Day timer → choose a time (e.g. 8:00–9:00 AM)
4. Click **Save**.

The script will now run automatically every day at the chosen time and email the delayed task report if any overdue tasks exist.

### Sample Email Output (Apps Script)

```
Subject: 📌 Delayed Tasks Report

Hello,

The following tasks are delayed:

• Update project documentation (Owner: Ahmed, Due: Mon Nov 25 2024, Status: In Progress)
• Submit budget review (Owner: Sara, Due: Fri Nov 29 2024, Status: Not Started)

Best regards,
Your Automation Bot
```

---

## Script 2 — Python SMTP Script

**File:** `Send-task-report.py`

### What it does

This script composes a plain-text email with a weekly task status report and sends it through Gmail's SMTP server using TLS encryption. It uses Python's built-in `smtplib` and `email` libraries — no third-party packages required.

**Logic walkthrough:**

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 1. Configure credentials and recipient
sender_email    = "your_email@gmail.com"
sender_password = "your_app_password"      # Gmail App Password, not your account password
receiver_email  = "receiver_email@example.com"

# 2. Build the email message
message = MIMEMultipart()
message['From']    = sender_email
message['To']      = receiver_email
message['Subject'] = "📋 Weekly Project Tasks Report"
message.attach(MIMEText(body, 'plain'))

# 3. Connect to Gmail SMTP and send
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()                          # upgrade to encrypted connection
server.login(sender_email, sender_password)
server.sendmail(sender_email, receiver_email, message.as_string())
server.quit()
```

### Configuration

Open `Send-task-report.py` and update these three lines before running:

```python
sender_email    = "your_email@gmail.com"          # your Gmail address
sender_password = "your_app_password"              # 16-character App Password
receiver_email  = "receiver_email@example.com"    # report recipient
```

To customise the task list, edit the `body` variable:

```python
body = """
Dear Team,
Here are the delayed project tasks:
- Task 1: In Progress
- Task 2: Completed
- Task 3: Not Started
...
"""
```

### Getting a Gmail App Password

Regular Gmail passwords will not work when SMTP access is enabled — Google requires an **App Password**:

1. Go to your Google Account at [myaccount.google.com](https://myaccount.google.com).
2. Navigate to **Security → How you sign in to Google → 2-Step Verification** and ensure it is enabled.
3. Return to **Security** and search for **App Passwords** (or go directly to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Select app: **Mail** → Select device: **Other (custom name)** → type `Task Report Bot` → click **Generate**.
5. Copy the 16-character password shown and paste it into `sender_password` in the script.

### Running the Script

No installation needed beyond Python itself — `smtplib` and `email` are part of the Python standard library.

```bash
# Run directly
python Send-task-report.py

# Expected output on success:
✅ Email sent successfully!

# Output on failure (wrong password, network issue, etc.):
❌ Failed to send email: <error details>
```

To run it on a schedule:

**Linux / macOS (cron):**
```bash
# Open crontab
crontab -e

# Add this line to run every Monday at 8 AM
0 8 * * 1 python /path/to/Send-task-report.py
```

**Windows (Task Scheduler):**
1. Open **Task Scheduler → Create Basic Task**.
2. Set trigger to **Weekly → Monday → 08:00**.
3. Set action to **Start a program → python.exe** with argument `C:\path\to\Send-task-report.py`.

### Sample Email Output (Python)

```
Subject: 📋 Weekly Project Tasks Report

Dear Team,
I hope this message finds you well.
Here are the delayed project tasks:
- Task 1: In Progress
- Task 2: Completed
- Task 3: Not Started
Please review and let me know if you have any questions.
Best regards,
Project Management Office
```

---

## Requirements

**Google Apps Script:**
- A Google account with access to Google Sheets
- No additional software or libraries needed

**Python Script:**
- Python 3.x (no external packages — uses standard library only)
- A Gmail account with 2-Step Verification enabled
- A Gmail App Password (see [Getting a Gmail App Password](#getting-a-gmail-app-password))

---

## Security Notes

- **Never commit real credentials** — keep `sender_email` and `sender_password` out of version control. Use environment variables or a `.env` file for production use:
  ```python
  import os
  sender_password = os.environ.get("GMAIL_APP_PASSWORD")
  ```
- **Use App Passwords, not your Gmail account password** — App Passwords are revocable and scoped to a single app, limiting exposure if compromised.
- **The Apps Script version requires no credentials** — `MailApp` sends on behalf of the Google account that owns the script, with no passwords stored anywhere in the code.

---

## License

This project is part of the **Maha-Rabie** repository. See the root repository for license details.
