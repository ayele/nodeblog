const express = require('express');
const router = express.Router();
const db = require('monk')('127.0.0.1:27017/nodeblog');

router.get('/show/:category', function (req, res, next) {
    const posts = db.get('posts');
    posts.find({ category: req.params.category }, {}, function (err, posts) {
        res.render('index', {
            'title': req.params.category,
            'posts': posts
        });
    });
});

//get add page
router.get('/add', function (req, res, next) {
    res.render('addcategory', { title: 'Add Category' });
});

router.post('/add', function (req, res, next) {
    // Get Form Values
    const name = req.body.name;

    // Form Validation
    req.checkBody('name', 'Name field is required').notEmpty();

    // Check Errors
    const errors = req.validationErrors();

    if (errors) {
        res.render('addcategory', {
            "errors": errors,
        });
    } else {
        const db = req.db;
        const categories = db.get('categories');
        categories.insert({ "name": name },
            function (err, category){
                if (err) {
                    res.send(err);
                } else {
                    req.flash('success', 'Category Added');
                    res.location('/');
                    res.redirect('/');
                }
            });
    }
});

module.exports = router;
