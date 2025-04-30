# Task Report Automation with Google Apps Script

This project automates the task report process using **Google Sheets** and **Google Apps Script**.

## Features
- Identifies overdue tasks from a Google Sheet.
- Sends daily email reports with the delayed tasks automatically.
- Uses Google Apps Script triggers to run without manual execution.

## Setup Instructions

### 1. Create a Google Sheet with the following columns:
- **Task** (Task name)
- **Owner** (Task owner)
- **Status** (Status of the task, e.g. In Progress, Completed)
- **Due Date** (Date by which the task should be completed)

### 2. Copy the script from `email_report.gs` into your Google Apps Script editor and connect it to your Google Sheet.

### 3. Set up a time-driven trigger to send the email report automatically every day.

### 4. Customize the script with your email details and Google Sheet ID.

## How It Works

The script runs daily to check for delayed tasks and sends an email listing them to the specified address.

### Links
- [GitHub Repository](https://github.com/YourUsername/task-report-automation)
- [LinkedIn Post](#)

---

## License
This project is licensed under the MIT License.
