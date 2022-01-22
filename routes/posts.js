const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: './public/images' })
const db = require('monk')('127.0.0.1:27017/nodeblog');

//Gets a post with a specific id and renders the show view
router.get('/show/:id', function (req, res, next) {
    const posts = db.get('posts');

    posts.findById(req.params.id, function (err, post) {
        res.render('show', {
            'post': post
        });
    });
});

//get add page
router.get('/add', function (req, res, next) {
    const categories = db.get('categories');

    categories.find({}, {}, function (err, categories) {
        res.render('addpost', {
            title: 'Add Post',
            categories: categories
        });
    });
});

router.post('/add', upload.single('mainimage'), function (req, res, next) {
    // Get Form Values
    const title = req.body.title;
    const category = req.body.category;
    const body = req.body.body;
    const author = req.body.author;
    const date = new Date();

    // Check Image Upload
    let mainimage;
    if (req.file) {
        mainimage = req.file.filename
    } else {
        mainimage = 'noimage.jpg';
    }
 
    // Form Validation
    req.checkBody('title', 'Title field is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check Errors
    const errors = req.validationErrors();

    if (errors) {
        const categories = db.get('categories');
        categories.find({}, {}, function (err, categories) {
            res.render('addpost', {
                title: 'Add Post',
                categories: categories,
                errors: errors
            });
        });
    } else {
        const posts = db.get('posts');
        posts.insert({
            "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "mainimage": mainimage
        }, function (err, post) {
            if (err) {
                res.send(err);
            } else {
                req.flash('success', 'Post Added');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

//Gets a post with a specific id and renders the show view
router.post('/addcomment', function (req, res, next) {
    // Get Form Values
    const postid = req.body.postid;
    const name = req.body.name;
    const email = req.body.email;
    const body = req.body.body;
    const commentdate = new Date();

    // Form Validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required but never displayed').notEmpty();
    req.checkBody('email', 'Email is not formatted properly').isEmail();
    req.checkBody('body', 'Body field is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if (errors) {
        const posts = db.get('posts');
        posts.findById(postid, function (err, post) {
            res.render('show', {
                'post': post,
                'errors': errors
            });
        });
    } else {
        const comment = {
            "name": name,
            "email": email,
            "body": body,
            "commentdate": commentdate
        };

        const posts = db.get('posts');

        posts.update({ "_id": postid }, { $push: { "comments": comment } },
            function (err, doc) {
                if (err) {
                    throw err;
                } else {
                    req.flash('success', 'Comment Added');
                    res.location('/posts/show/' + postid);
                    res.redirect('/posts/show/' + postid);
                }
            });
    }
});


module.exports = router;
