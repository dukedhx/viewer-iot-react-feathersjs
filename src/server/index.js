const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  constructor() {
    this.messages = [];
  }

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data) {
    // The new message is the data merged with a unique identifier
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      data
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Host static files from the current folder
app.use('/',express.static('build'))
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register an in-memory messages service
app.use('/messages', new MessageService());
// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(process.env.port||3030).on('listening', () =>
  console.log('Feathers server listening on '+(process.env.port||3030))
);

const extIds = ['8602','4F81','3BB4','409E','871','1146']  // mock model component references by their in-editor IDs, replace with your own - can fetch from Forge's services
const readings=Array(3).fill(null).map(()=>{ const index = Math.floor(Math.random()*extIds.length)-1; const id=extIds[index>-1?index:0]; extIds.splice(index,1);  return id })  // randomly pick three model components for sensor locations - replace your own feed


setInterval(() => app.service('messages').create(readings.reduce((o,e)=>Object.assign(o,{[e]:Math.floor(Math.random()*100)}),{})), 2000); // Mock data generator - replace with your own real sensor data feed (try any mqtt node client etc.)
