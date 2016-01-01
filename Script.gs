
/*************************************************




      ======================================
      
       Google Drive Daily Changes Notifier 
      
      ======================================
      
      
      Written by James Marcogliese on 24/12/2015
      
      
      - - -   - -   - - -        
      H O W   T O   U S E
      - - -   - -   - - - 
      
      1. Enable the 
      2. Go to the Run menu above and choose Start
      

      Tutorial : 
      
      
      contact  :  james.marcogliese@gmail.com
      GitHub   :  https://github.com/JamesMarcogliese/Drive-Updates
      
      
      

***************************************************/

function Start() {
 var fileChanges = retrieveAllChanges();
 
 Logger.log(data);
  
}

function retrieveAllChanges(){
  var file, owners, modifiedBy, changeType, url;
  var fileRecord = [];
  var itemRequest = Drive.Changes.list.items;
  var currentFormattedDate = getFormattedDate();
  
  for (i = 0; i < itemRequest.length; i++)  {
    if (itemRequest[i].modificationDate.substring(0, 10) == currentFormattedDate){
      if(itemRequest[i].deleted){
        changeType = "Deleted";
      } else {
        changeType = "Modified";
      }
      file = itemRequest[i].file.title;
      owners = itemRequest[i].file.ownerNames.toString();
      modifiedBy = itemRequest[i].file.lastModifyingUserName;
      url = itemRequest[i].file.alternateLink;
      fileRecord.push({
        "file": file, 
        "owners": owners, 
        "modifiedBy": modifiedBy, 
        "changeType": changeType, 
        "url": url
      });
       }
       }
       return fileRecord;
}

function formatTable(){
}

function sendEmail() {
  // Get the email address of the active user - that's you.
  var email = Session.getActiveUser().getEmail();
  
  // Get the name of the document to use as an email subject line.
  var today = new Date();
  today.toLocaleFormat('%d-%b-%Y'); 
  var subject = 'Drive Changes for ' + today;
  
  // Fill email with formatted table.
  var body = 'Link to your doc: ' + url; 
  
  // Send yourself an email with a link to the document.
  GmailApp.sendEmail(email, subject, body);
}

function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    return str;
}