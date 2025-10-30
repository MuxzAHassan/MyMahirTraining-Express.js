const express = require('express');
const router = express.Router();
const db = require('../../database');
const { render } = require('ejs');

//Student List Page
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM users');
        const students = result;

        res.render('students/students_view', {
            title: 'Student Management System',
            content: 'Manage and View details of the Students.',
            students
        });

    } catch (err) {
        console.error(err);
    }
});

function renderFormPage(res, error = null, student = null) {
    const isUpdate = !!student;
    res.render('students/student_form', {
        title: 'Student Management',
        content: isUpdate ? 'Update Student':'Add New Student',
        error,
        student,
        formAction: isUpdate ? `/students/update/${student.id}?_method=PUT`:'/students/add'
    });
};

//Update student Form
router.get('/update/:id',async (req, res) => {
    try{
        const [rows] = await db.query('SELECT * FROM users WHERE id=?',[req.params.id]);
        if(rows.length === 0) return res.status(404).send('Student not found');
        const student = rows[0];
        renderFormPage(res, null, student);
    } catch(err){
        console.error(err);
        res.status(500).send('DB QUERY FAILED, PLEASE CHECK YOUR DB');
    }
});

function runValidation(res, name, student_number, email, phone) {

    if (!name || name.trim() === '') {
        return renderFormPage(res, 'Name cannot be empty.');
    }
    //student number must be a number
    if (!student_number || !/^\d+$/.test( student_number )) {
        return renderFormPage(res, 'Student Number is required and must be a valid number.');
    }
    //email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
        return renderFormPage(res, 'Email is required and must be in email format.');
    }
    //phone number validation
    if (!/^\d+$/.test( phone )) {
        return renderFormPage(res, 'Phone must be in number format.');
    }
}

router.put('/update/:id', async (req, res) => {
    const {name, student_number, email, phone} = req.body;

    // Validation
    runValidation(res, name, student_number, email, phone);

    try {
        const [result] = await db.query(
            'UPDATE users SET name=?, student_number=?, email=?, phone=? WHERE id=?',
            [name, student_number, email, phone, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send('Student not found');
        }
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        return renderFormPage(res, 'DATABASE ERROR. PLEASE CHECK AT THE DB LOG.');
    }
});


router.get('/add', (req, res) => renderFormPage(res));

router.post('/add', async (req, res) => {
    const { name, student_number, email, phone } = req.body;
    // Validation
    runValidation(res, name, student_number, email, phone);

    try {
        await db.query(
            'INSERT INTO users (name, student_number, email, phone, type) VALUES (?, ?, ?, ?, ?)',
            [name, student_number, email, phone, 'student']
        );
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        renderFormPage(res, 'DATABASE ERROR. PLEASE CHECK AT THE DB LOG.');
    }
});

module.exports = router;