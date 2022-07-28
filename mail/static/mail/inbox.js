document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add event listener to submit button on email form
  document.querySelector('#send-email').addEventListener('click', send_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send GET request to get emails
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    Object.values(emails).forEach(email => {
      //console.log(email.subject);
      
      // Create HTML structure for emails
      const emailSubject = document.createElement('div')
      emailSubject.innerHTML = email.subject;
      const emailSender = document.createElement('div')
      emailSender.innerHTML = email.sender;
      const emailTimeStamp = document.createElement('div')
      emailTimeStamp.innerHTML = email.timestamp;

      // Change class name based on whether read/unread
      const emailParent = document.createElement('div');
      if (email.read === true){
        emailParent.className = 'email-read';
      }
      else {
        emailParent.className = 'email-unread';
      }
      
      // Add email to DOM and add event listener for displaying email
      emailParent.append(emailSender, emailSubject, emailTimeStamp);
      emailParent.addEventListener('click', () => load_email(email.id))
      document.querySelector('#emails-view').append(emailParent);

    });
  });
}

function send_email(event) {
  // Prevent redirection of form
  event.preventDefault();

  // Get values from form
  let recipients = document.getElementById('compose-recipients').value
  if (recipients.includes(',')){
    recipients = recipients.split(',')
  }
  let subject = document.getElementById('compose-subject').value;
  let body = document.getElementById('compose-body').value;
  
  // Send POST request to /emails to send
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
  
  // Load user's sent mailbox
  load_mailbox('sent');
}

function load_email(id) {
  // Hide mailbox section and show detailed view section in HTML
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';

  // Send a GET request to /emails/<emails_id>
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
    //console.log(email);
    //create sections in html to populate rather than creating new
    const sender = document.createElement('div')
    sender.innerHTML = email.sender;
    const recipients = document.createElement('div')
    recipients.innerHTML = email.recipients;
    const subject = document.createElement('div')
    subject.innerHTML = email.subject;
    const timeStamp = document.createElement('div')
    timeStamp.innerHTML = email.timestamp;
    const body = document.createElement('div')
    body.innerHTML = email.body;
    const parent = document.createElement('div');
    parent.append(sender, recipients, subject, timeStamp, body);
    document.querySelector('#detail-view').append(parent);
    
  });

  // Send a PUT request to mark email as read
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
  
}