const express = require('express');
const router = express.Router();
const db = require('../../database');
const bcrypt = require('bcrypt');
require ('dotenv').config();
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res)=>{
    const data = {...req.body, ...req.query};
    const {email, password} = data;

    try{
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? AND type = ?', [email, 'BOSS']
        );
        if(rows.length == 0){
            return res.status(401).json({
                success: false,
                message: 'Email/password x betul lol'
            })
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.hash_password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: 'Email/password x betul lol',
            })
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email},
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );

        res.json({
            success: true,
            message: 'Nice lepas login',
            token,
            data: admin
        })

    } catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat login lol',
            error: err.message
        });
    }
});

router.post('/register', async (req, res)=>{
    const data = {...req.body, ...req.query};
    const {name, email, password} = data;
    var errors =[];

    //validation untuk nama
    if(!name || name.trim() == '') {errors.push('Nama takleh kosong')};

    //email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
        errors.push('email wajib letak gakk');
    }

    //password validation
    if (!password || !/^.{8,}$/.test( password )) {
        errors.push('password wajib letak at least 8 character');
    }
    if(errors.length>0){
        return res.status(400).json({
            success: false,
            message: 'Ada error!',
            errors
        });
    }

    try{
        const[existingUser] = await db.query(
            'SELECT * FROM users WHERE email =?', [email]
        );
        if(existingUser>0){
            return res.status(400).json({
                success: false,
                message: 'Email dah ada'
            })
        }
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, hash_password, type) VALUES(?,?,?,?)', [name, email, hash, 'BOSS']
        )
        res.status(201).json({
            success: true,
            message: 'Dah Register yey',
            data: {id: result.insertId}
        });
    } catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'X dapat register user lol',
            error: err.message
        });
    }

});

module.exports = router;