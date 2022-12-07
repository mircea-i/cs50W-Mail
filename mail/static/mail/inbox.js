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
      element.dataset.id = email.id;
      element.addEventListener('click', () => {view_mail(email.id)});
      
        // console.log(email.id);
      

      // Set proper background for each email div
      if (email.read === true) {
        element.classList.add('read');
      }
      else {
        element.classList.add('unread');
      }

      // Add the timestamp to the row
      const time = document.createElement('div');
      time.classList.add('col-sm-auto');
      time.innerHTML = email.timestamp;
      element.appendChild(time);

      // Add the sender to the row if in inbox
      if (mailbox === 'inbox') {
        const sender = document.createElement('div');
        sender.classList.add('col-sm-auto');
        sender.innerHTML = email.sender;
        element.appendChild(sender);
      }

      // Add the recipient to the row if in send
      if (mailbox === 'sent') {
        const sender = document.createElement('div');
        sender.classList.add('col-sm-auto');
        sender.innerHTML = email.recipients;
        element.appendChild(sender);
      }
      

      // Add the subject to the row
      const content = document.createElement('div');
      content.classList.add('col-lg');
      content.innerHTML = email.subject;
      element.appendChild(content);

      document.querySelector('#emails-view').appendChild(element);  
  })
    console.log(emails)
  })

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
        element.classList.add('row', 'border', 'border-2', 'rounded', 'p-2', 'm-2');
        
        const sender = document.createElement('div');
        sender.classList.add('col');
        sender.innerHTML = `From: ${email.sender}`;
        element.appendChild(sender);

        const recipient = document.createElement('div');
        recipient.classList.add('col');
        recipient.innerHTML = `To: ${email.recipients}`;
        element.appendChild(recipient);

        const time = document.createElement('div');
        time.classList.add('col');
        time.innerHTML = `At: ${email.timestamp}`;
        element.appendChild(time);

        const body = document.createElement('div');
        body.classList.add('row', 'border', 'border-2', 'rounded', 'p-2', 'm-2');
        body.innerHTML = `Message: ${email.body}`;
    
      // Check if email is archived

        if (email.archived === false) {
          archive = document.createElement('button');
          archive.classList.add('btn-primary');
          archive.innerHTML = 'Move to archive';
        }

      document.querySelector('#email-view').appendChild(element);
      document.querySelector('#email-view').appendChild(body);
      document.querySelector('#email-view').appendChild(archive);
      })
  
  }
  
}
    