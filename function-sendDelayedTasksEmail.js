function sendDelayedTasksEmail() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    let delayedTasks = "";
    const today = new Date();
  
    for (let i = 1; i < data.length; i++) {
      const task = data[i][0];
      const owner = data[i][1];
      const status = data[i][2];
      const dueDate = new Date(data[i][3]);
  
      // Check if the task is not completed and the due date has passed
      if (status.toLowerCase() !== "completed" && dueDate < today) {
        delayedTasks += `• ${task} (Owner: ${owner}, Due: ${dueDate.toDateString()}, Status: ${status})\n`;
      }
    }
  
    // If there are no delayed tasks, log a message and stop the function
    if (delayedTasks === "") {
      Logger.log("No delayed tasks today.");
      return;
    }
  
    const subject = "📌 Delayed Tasks Report";
    const body = `Hello,\n\nThe following tasks are delayed:\n\n${delayedTasks}\n\nBest regards,\nYour Automation Bot`;
  
    // Send the email with the delayed tasks
    MailApp.sendEmail({
      to: "youremail@example.com", // ← Replace this with your own email
      subject: subject,
      body: body
    });
  
    Logger.log("✅ Email sent.");
  }
  