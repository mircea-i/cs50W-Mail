document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function send_email() {
  
  // Put the values where needed and post the email to Django
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => 

    // Loop emails
    {emails.forEach(email => {

      // Make a rounded row div for each email
      const element = document.createElement('div');
      element.classList.add('row', 'border', 'border-2', 'rounded', 'p-2', 'm-2');

      // When clicked go to view_email
      element.addEventListener('click', () => {view_mail(email.id)});

      // Set proper background for each email div
      if (email.read === true) {
        element.classList.add('read');
      }
      else {
        element.classList.add('unread');
      }

      // Insert data into each div
      element.innerHTML = `
        <div class='col-sm-auto'>${email.timestamp}</div>
        <div class='col-sm-auto'>${email.sender}</div>
        <div class='col-lg'>${email.subject}</div>`

      // Append each div to #emails-view
      document.querySelector('#emails-view').appendChild(element);  
    })
  })
}
    
function view_mail(id) {

  // Show the current email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Clear the view
  document.querySelector('#email-view').innerHTML = '';

  // Mark the email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Get current email data and display it    
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      const element = document.createElement('div');
      element.classList.add('border', 'border-2', 'rounded', 'p-2', 'm-2');
      
      element.innerHTML = `
      <div>From: ${email.sender}</div>
      <div>To: ${email.recipients}</div>
      <div>Subject: ${email.subject}</div>
      <div>Date: ${email.timestamp}</div>
      <div>Message: ${email.body}</div>
      `
      document.querySelector('#email-view').appendChild(element);

      // Check if user is not sender
      console.log(email.sender);
      if (!(document.querySelector('#user-email').value === email.sender)){

        // Handle the archiving
        const archive_button = document.createElement('button');
        archive_button.classList.add('btn-primary');

        // Add apropriate text to button
        if (!email.archived) {
          archive_button.innerHTML = 'Move to archive';
        }
        else {
          archive_button.innerHTML = 'Move to inbox';
        }

        // Add listener to button and button to parent
        archive_button.addEventListener('click', () => {archive_email(email.id, email.archived)});
        document.querySelector('#email-view').appendChild(archive_button);

        // Handle the reply
        const reply_button = document.createElement('button');
        reply_button.classList.add('btn-primary');
        reply_button.innerHTML = 'Reply';
        reply_button.addEventListener('click', () => {reply_email(email.id)});
        document.querySelector('#email-view').appendChild(reply_button);
      }  
    })
  }
    
  
function archive_email(id , parameter) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !parameter
      }) 
    })
  //load_mailbox('inbox');
  location.reload();
  }  


function reply_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;

    // Handle re at the beginning of the subject
    if (email.subject.slice(0,3).toLowercase !== 're:') {
      document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = email.subject;
    }
    
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })
}