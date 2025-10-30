const express = require('express');
const router = express.Router();

const contacts = [
    {id:1, name: 'Muaz', phone: '0123456789'},
    {id:2, name: 'Abu', phone: '0123456789'},
    {id:3, name: 'Hassan', phone: '0123456789'},
];

router.get('/', (req, res) => {
    res.render('contact/contacts', {
        title: 'My Contact List',
        content: 'Manage & View Contact Details',
        contacts
    });
});

function renderFormPage(res, error = null, contact = null) {
    const isUpdate = !!contact;
    res.render('contact/contact_form', {   
        title: isUpdate? 'Update Contact':'Add New Contact',
        content: isUpdate? 'Update the details of this contact':'Fill the form to add a new contact',
        error,
        contact,
        formAction: isUpdate? `/contacts/update/${contact.id}?_method=PUT`:'/contacts/add'
    });
}

//Update Contact Form
router.get('/update/:id', (req, res) => {
    const contact = contacts.find( c => c.id == req.params.id);
    if(!contact)
        return res.status(404).send('Contact not found')
    renderFormPage(res, null, contact);
});

//Handle Update Contact
router.put( '/update/:id', (req, res) => {
  const { name, phone } = req.body;
  const contact = contacts.find( c => c.id == req.params.id );
  if ( !contact ) return res.status( 404 ).send( 'Contact not found' );

  // Validation
  if ( !name || name.trim() === '' ) {
    return renderFormPage( res, 'Name cannot be empty.', contact );
  }
  if ( !phone || !/^\d+$/.test( phone )) {
    return renderFormPage( res, 'Phone number must contain numbers only and cannot be empty.', contact );
  }

  // Update Values And Redirect Back
  contact.name = name;
  contact.phone = phone;
  res.redirect( '/contacts' );
});


router.get('/add', (req, res) => renderFormPage(res));

router.post('/add', (req, res) => {
    const {name, phone} = req.body;

    const newContact = {
        id: contacts.length + 1,
        name: name,
        phone: phone
    };
    contacts.push(newContact);
    res.redirect('/contacts');
});

// Contact Details
router.get( '/:id', (req, res) => {
  const contact = contacts.find( c => c.id == req.params.id );

  if ( !contact ) {
    return res.status( 404 ).send( 'Contact not found' );
  }

  res.render( 'contact/contact_details', {
    title: 'Contact Details',
    content: 'View detailed information about this contact.', 
    contact
  });
});

//Handle Contact Delete
router.post('/delete/:id', (req, res) => {
    const id = parseInt (req.params.id);
    const index = contacts.findIndex(c => c.id === id);

    if(index === -1){
        return res.status(404).send('Contact not found');
    }

    //Remove from array and redirect back
    contacts.splice(index, 1);
    res.redirect('/contacts');
});



module.exports = router;