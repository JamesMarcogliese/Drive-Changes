
/***********************************************************************************************************************




      ======================================
      
       Google Drive Daily Changes Notifier 
      
      ======================================
      
      
      Written by James Marcogliese on 24/12/2015
      
      
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
      
      2. Go to the Run menu above and choose Start.
      
      3. That's it! Daily Changes are emailed to you every day at midnight. 
      
      
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
}

function script() {  
  //Gets all changes.
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
      if (itemRequest[i].file.modifiedDate.substring(0, 10) >= getFormattedDate()){
        if(itemRequest[i].deleted){
          changeType = "Deleted";
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
   var fileRecord = retrieveAllDailyChanges();
   sendEmail(fileRecord);
}

