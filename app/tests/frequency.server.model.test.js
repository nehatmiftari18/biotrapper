'use strict';

/**
 * Module dependencies.
 */
var should = require('should');
	//mongoose = require('mongoose');
	//User = mongoose.model('User');

/////////////////////////////////////////////
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
//mockgoose(mongoose);

var repeatController = require('./../controllers/init.server.controller.js');
var Repeat = mongoose.model('Repeat');

afterEach(function(done) {
  //mockgoose(mongoose).then(function() {

      //Reset the database after every test.
      //mockgoose.reset();



      // Repeat.create({
      // _id: ObjectId,
      // name: "Daily",
      // ranges: 1
      // }, function(err, model) {
      //     done(err);
      // });

done();

  //});
});

before(function(done) {
    //mockgoose(mongoose).then(function() {


      // var db = mongoose.connect(config.db.uri, config.db.options, function(err) {

      // 	if (err) {
      // 		// console.error(chalk.red('Could not connect to MongoDB!'));
      // 		// console.log(chalk.red(err));
      // 	}
      //   done(err);
      //
      // });


      done();
        //console.log(config.db.uri);
        // mongoose.connect(config.db.uri, function(err) {
        //     done(err);
        // });
    //});
});

// afterEach(function(done) {
//     //Reset the database after every test.
//     //mockgoose.reset();
//     done();
// });


describe('Repeats lookup data', function() {
  it('should exist and have 6 entries', function(done) {
    repeatController.initRepeats(function() {
      Repeat.count({}, function(err, count) {
        count.should.be.eql(6);
        done(err);
      });
    });
  });
});


describe('Repeats init', function() {
  it('should not error', function(done) {
    repeatController.initRepeats(function() {
      done();
    });
  });
});




describe('Daily repeat', function() {
    it('should exist just once', function(done) {
        Repeat.find({name: 'Daily'}).exec(function(err, docs) {
          // docs.forEach(function(doc){
          //   console.log(doc.name);
          // });

          should.exist(docs);
          docs.length.should.be.eql(1);
          done(err);
        });
    });
    it('should have one range', function(done) {
        Repeat.find({name: 'Daily'}).exec(function(err, docs) {
          var daily = docs[0];
          // daily.should.exist();
          daily.ranges.should.be.eql(1);
          done(err);
        });
    });
});
