'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
  application: {
    type: String,
    default: '',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  status:{
    type: Number,
    default: 0
  },
  showInProject:{
    type: Boolean,
    default: true
  }
});

mongoose.model('Application', ApplicationSchema);
