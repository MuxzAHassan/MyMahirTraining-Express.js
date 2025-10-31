const express = require('express');
const router = express.Router();
const db = require('../../database');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Takleh masuk pfft. Takde token'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err) return res.status(403).json({
            success: false,
            message: 'salah token'
        });
        req.user = user;
        next();
    });
}

router.get('/', async (req, res) => {
    try{
        const[rows] = await db.query('SELECT * FROM users');
        res.json({
            success: true,
            message: 'Dapat retrieve users!!',
            data: rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat retreive users lol',
            error: err.message
        });
    }
});

router.get('/:id', async (req, res)=>{
    try{
        const [rows] = await db.query('SELECT id, name, email, phone, student_number, type FROM users WHERE id=?', [req.params.id]);
        if(rows.length == 0){
            return res.status(404).json({
                success: false,
                message: 'Tak jumpa student ni',
            });
        }
        res.json({
            success: true,
            message: 'Dapat retrieve student detail ni!',
            data: rows[0]
        })
    }catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat retreive student detail lol',
            error: err.message
        });
    }
})

router.post('/add', verifyToken, async(req,res)=>{
    const data = {...req.body, ...req.query};
    const {name, student_number, email, phone, type} = data;
    var errors = [];

    //validation untuk nama
    if(!name || name.trim() == '') {errors.push('Nama takleh kosong')};

    //validation untuk student no
    if (!student_number || !/^\d+$/.test( student_number )) {
        errors.push('student number wajib letakk');
    }
    //email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
        errors.push('email wajib letak gakk');
    }
    //phone number validation
    if (!/^\d+$/.test( phone )) {
        errors.push('Letak no phone pls');
    }
    //kalau error
    if(errors.length > 0){
        return res.status(404).json({
            success: false,
            message: 'X lepas validation do',
            errors
        });
    }

    try{
        const [result] = await db.query(
            'INSERT INTO users (name, student_number, email, phone, type) VALUES (?,?,?,?,?)',
            [name, student_number, email, phone, type]
        );
        res.status(201).json({
            message: 'BERJAYAA MASUKKAN DATA YEY',
            success: true,
            data: {
                id: result.insertId
            }
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat upload student detail lol',
            error: err.message
        });
    }
});

router.put('/update/:id', async(req, res)=>{
    const data = {...req.body, ...req.query};
    const {name, student_number, email, phone, type} = data;
    var errors = [];

    //validation untuk nama
    if(!name || name.trim() == '') {errors.push('Nama takleh kosong')};

    //validation untuk student no
    if (!student_number || !/^\d+$/.test( student_number )) {
        errors.push('student number wajib letakk');
    }
    //email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
        errors.push('email wajib letak gakk');
    }
    //phone number validation
    if (!/^\d+$/.test( phone )) {
        errors.push('Letak no phone pls');
    }
    //kalau error
    if(errors.length > 0){
        return res.status(404).json({
            success: false,
            message: 'X lepas validation do',
            errors
        });
    }
    try{
        const [result] = await db.query(
            'UPDATE users SET name =?, student_number = ?, email = ?, phone = ?, type = ? WHERE id = ?',
            [name, student_number, email, phone, type, req.params.id]
        );
        if(result.affectedRows==0){
            return res.status(404).json({
                success: false,
                message: 'Tak jumpe student niiii'
            });
        }
        res.status(200).json({
            message: 'BERJAYAA UPDATE DATA YEY',
            success: true,
            data: {
                id: result.insertId
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat update student detail lol',
            error: err.message
        });
    }


});

router.delete('/delete/:id', verifyToken, async(req, res)=>{

    try{
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',[req.params.id]
        );
        if(result.affectedRows == 0){
            return res.status(404).json({
                success: false,
                message: 'Tak jumpe, dah delete kot'
            });
        }
        res.status(200).json({
            message: 'DAH DELETE USER YEY',
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat delete student lol',
            error: err.message
        });
    }

});

module.exports = router;