'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
  projectName: {
    type: String,
    default: '',
    required: 'Please fill project name',
    trim: true
  },
  description: {
    type: String,
    default: '',
    required: 'Please fill project name',
    trim: true
  },
  open : {
    type: Boolean,
    default: true
  },
  leaders: {
    type: [{ type : Schema.ObjectId, ref: 'User' }],
    default: []
  },
  members: {
    type: [{ type : Schema.ObjectId, ref: 'User' }],
    default: []
  },
  applications: {
    type: [{ type : Schema.ObjectId, ref: 'Application' }],
    default: []
  },
  upvotes: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: {
      month: Number,
      year: Number
    }
  },
  endDate: {
    type: {
      month: Number,
      year: Number
    }
  },
  skills: {
    type: [String]
  },
  stack: {
    type: [String]
  },
  location: {
    type: String
  },
  user:{
    type: Schema.ObjectId,
    ref: 'User'
  },
  numberOfApplications:{
    type: Number,
    default: 0
  }
});

mongoose.model('Project', ProjectSchema);
