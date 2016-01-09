
/***********************************************************************************************************************




      ======================================
      
       Google Drive Daily Changes Notifier 
      
      ======================================
      
      
      Written by James Marcogliese on 24/12/2015
      
      This is a standalone Google Apps script that after being run once, 
      sends a daily email to your inbox showing any files that have been 
      changed in your Drive during the day. The script in run in Google's 
      cloud enviroment so there is nothing to install.
      
      
      - - -   - -   - - -        
      H O W   T O   U S E
      - - -   - -   - - - 
      
      1. Enable the Google Drive API
         a. In the Apps Script editor, click Resources > Advanced Google Services.
         b. Locate Drive API in the dialog and click the corresponding toggle (v2), setting it to on.
         c. Click the Google Developers Console link.
         d. Enter "Drive API" into the search box and click on the corresponding entry in the results.
         e. Click the Enable API button.
         f. Return to the Apps Script editor and click the OK button on the Advanced Google Services dialog.
      
      2. Go to the Run menu above and choose Start. Run. You'll recieve an email confirming success.
      
      3. That's it! Daily Changes are emailed to you every day at midnight. If you ever wish to stop the emails,
         Go to the Run menu above and choose Remove. 
      
      
      contact  :  james.marcogliese@gmail.com
      GitHub   :  https://github.com/JamesMarcogliese/Drive-Updates
      
      
      

*************************************************************************************************************************/
























function Start() {
  // Trigger to run script at sometime between 11PM-Midnight
    ScriptApp.newTrigger("script")
   .timeBased()
   .atHour(23)
   .everyDays(1) 
   .create(); 
  
  var email = Session.getActiveUser().getEmail();     
  var subject = 'Drive-Changes has been Installed!';
  var html = "<p style='text-align:left'><strong><a style='font-size:160%;text-decoration:none;color:#49B3F5;'>Drive-Changes</a></strong></p>";
  html += "<p>You are getting this email because you have accessed and granted permission to Drive-Changes.</p><h3><strong>What is Drive-Changes?</strong></h3>";
  html += "<div>Drive-Changes is a standalone Google Apps script that after being run once, sends a daily email at midnight to your inbox showing any files that have been "; 
  html += "changed in your Drive during the day. The script in run in Google&#39;s cloud enviroment so there is nothing to i<span style='font-size:12px;'>nstall.</span></div>";
  html += "<h3><strong>How can I uninstall Drive-Changes</strong><strong><span style='font-family: Arial;'>?</span></strong></h3><div>";
  html += "Return to the Apps Script editor, go to the Run menu at the top and choose Remove. Run. That&#39;s it!</div><div>&nbsp;</div>";
  MailApp.sendEmail(email, subject, "", {htmlBody: html});   
}

function Remove(){
  // Removes Trigger
  var triggers = ScriptApp.getProjectTriggers();
  for ( var i in triggers ) {
    ScriptApp.deleteTrigger(triggers[i]); 
  }
  var email = Session.getActiveUser().getEmail();     
  var subject = 'Drive-Changes has been Uninstalled!';
  var html = "<p style='text-align:left'><strong><a style='font-size:160%;text-decoration:none;color:#49B3F5;'>Drive-Changes</a></strong></p>";
  html += "<p>You are getting this email because you have uninstalled Drive-Changes.</p>";
  MailApp.sendEmail(email, subject, "", {htmlBody: html});   
}

function script() {  
  // Gets all changes.
  function retrieveAllChanges(){
    var result = [];
    function retrievePageOfChanges(request){
      result = result.concat(request.items);
      var nextPageToken = request.nextPageToken;
      if (nextPageToken){
      request = Drive.Changes.list({
        "pageToken": nextPageToken
      });
      retrievePageOfChanges(request);
      } else {
        return;
      }
    }
    var initialRequest = Drive.Changes.list();
    retrievePageOfChanges(initialRequest, []); 
    return result;
  }
  // Gets all daily changes from the entire list of changes.
  function retrieveAllDailyChanges(){
    var file, owners, modifiedBy, changeType, url;
    var fileRecord = [];
    var itemRequest = [];
  
    itemRequest = retrieveAllChanges();
    itemRequest.reverse();
    
    for (var i = 0; i < countProperties(itemRequest); i++){
      if (itemRequest[i].deleted){
        continue;
      } else if (itemRequest[i].file.modifiedDate.substring(0, 10) >= getFormattedDate()){
        if (itemRequest[i].file.labels.trashed){
          changeType = "Trashed";
        } else {
          changeType = "Modified";
        }
        file = itemRequest[i].file.title;
        owners = itemRequest[i].file.ownerNames.toString();
        modifiedBy = itemRequest[i].file.lastModifyingUserName;
        url = itemRequest[i].file.alternateLink;
        fileRecord.push([file, owners, modifiedBy, changeType, url]);
      } else {
        break;
      }
    }
  return fileRecord;
  }
  // Used to count records.
  function countProperties(obj){
    var count = 0;
    for(var prop in obj){
      if(obj.hasOwnProperty(prop))
        ++count;
      }
      return count;
  }
  // Fills HTML table with data and sends email.
  function sendEmail(changes){
    var email = Session.getActiveUser().getEmail();     
    var subject = 'Drive Changes for ' + getFormattedDate();     
    var headings = [["File/Folder Name", "Owner", "Last Modified By", "Change Type", "Link To File"]];
    var html = "<p style='text-align:center'><strong><a style='font-size:160%;text-decoration:none;color:#49B3F5;'>File Changes Report for Google Drive</a></strong></p>";
    html += "<p>This daily report lists file and folder changes for the day.</p><br>";
    if (changes.length != 0){
      html += "<table border='1' cellpadding='5' cellspacing='0'><tr><td><b>" + headings[0].join("</b></td><td><b>") + "</b></td></tr>";
      for (var i = 0; i < changes.length; i++){  //Fill the table.
        html += "<tr><td>" + changes[i].join("</td><td>") + "</td></tr>";
      }
    } else {
      html += "No changes for today!";
    }
    MailApp.sendEmail(email, subject, "", {htmlBody: html});     
  }
  //Returns a formatted date
  function getFormattedDate(){
    var date = new Date();
    var yyyy = date.getFullYear().toString();                                    
    var mm = (date.getMonth()+1).toString();   
    var dd  = date.getDate().toString();                                     
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
  }
   //Calls functions to get changes and send email
  try {
   var fileRecord = retrieveAllDailyChanges();
  } catch(err) {
    Logger.log("Error retrieving changes:" + err);
  }
   sendEmail(fileRecord);
}