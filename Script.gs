
/*************************************************************************




      ======================================
      
       Google Drive Daily Changes Notifier 
      
      ======================================
      
      
      Written by James Marcogliese on 24/12/2015
      
      
      - - -   - -   - - -        
      H O W   T O   U S E
      - - -   - -   - - - 
      
      1. Enable the Google Drive API
      
      2. Go to the Run menu above and choose Start
      
      
      contact  :  james.marcogliese@gmail.com
      GitHub   :  https://github.com/JamesMarcogliese/Drive-Updates
      
      
      

***************************************************************************/

function Start() {
 var fileRecord = retrieveAllDailyChanges();
 fileRecord = condenseFileRecord(fileRecord);
 sendEmail(fileRecord);
}

function condenseFileRecord(fileRecord){
  fileRecord.sort(sortFunction);
    
  return fileRecord;
}

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

function retrieveAllDailyChanges(){
  var file, owners, modifiedBy, changeType, url;
  var fileRecord = [];
  var itemRequest = [];
  
  itemRequest = retrieveAllChanges();
  itemRequest.reverse();
  for (var i = 0; i < countProperties(itemRequest); i++){
    if (itemRequest[i].file.modifiedDate.substring(0, 10) == getFormattedDate()){
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

function countProperties(obj){
    var count = 0;

    for(var prop in obj){
        if(obj.hasOwnProperty(prop))
            ++count;
    }
    return count;
}

function sortFunction(a, b){
  if (a[0] === b[0]){
    return 0;
  }
  else {
    return (a[0] < b[0]) ? -1 : 1;
  }
}

function sendEmail(changes){
  // Get the email address of the active user - that's you.
  var email = Session.getActiveUser().getEmail();
  // Get the name of the document to use as an email subject line.
  var subject = 'Drive Changes for ' + getFormattedDate();
  var headings = [["File/Folder Name", "Owners", "Modified By", "Change Type", "URL"]];
  var html = "<p style='text-align:center'><strong><a style='font-size:160%;text-decoration:none;color:#49B3F5;'>File Changes Report for Google Drive</a></strong></p>";
  html += "<p>This daily report lists file and folder changes for the day.</p><br>";
  html += "<table border='1' cellpadding='5' cellspacing='0'><tr><td><b>" + headings[0].join("</b></td><td><b>") + "</b></td></tr>";
  //Fill the table.
  for (var i = 0; i < changes.length; i++){
    html += "<tr><td>" + changes[i].join("</td><td>") + "</td></tr>";
  }
  // Send yourself an email with the information.
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