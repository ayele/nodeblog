const express = require('express');
const router = express.Router();
const db = require('monk')('127.0.0.1/nodeblog');

//Displays posts from the db sorted by date created
router.get('/', function(req, res, next) {
  const posts = db.get('posts');

  posts.find({}, {sort:{date:-1}}, function(err, posts){
    res.render('index', {
      title: 'Home',
      posts: posts});
  });
});

module.exports = router;
