// const Blog = require('../models/blog');

// // Some where in routes.js

// // create a blog
// app.post('/new-route', function(){
// 	const blog = req.body.blog; // the data coming from front end
// 	const newBlog = new Blog(blog);
// 	newBlog.save();
// })

// // fins all blogs
// app.get('/get-blogs', function(err, blogs){
// 	if(err) return console.log(err);
	
// 	res.send(blogs);
// })

// // To find multiple documents
// SomeSchema.find({someKey: 'the value' }, function( err, results) { 
// 	// handle the err
// 	//do something with result
// })

// // To find only one document
// SomeSchema.findOne({someKey: 'the value' }, function( err, results) { 
// 	// handle the err
// 	//do something with result
// })

// // To update document
// SomeSchema.update({
// 	someKey: 'the value' 
// }, {
// 	$set: {
// 		someOtherKey
// 	}
// }, {new: true}, // this is to make sure we get the updated document
// function( err, newresult) { 
// 	// handle the err
// 	//do something with newresult
// })

// // To remove document
// SomeSchema.remove({someKey: 'the value' }, function( err, results) { 
// 	// handle the err
// 	//do something with result
// })