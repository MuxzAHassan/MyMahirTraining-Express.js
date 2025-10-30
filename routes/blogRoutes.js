const express = require('express');
const router = express.Router();


router.get("/hello", (req, res) => res.send(`Hello from Blog Routes!`));
router.get("/:id", (req, res) => res.send(`Currently viewing blog post with ID: ${req.params.id}`));

module.exports = router;