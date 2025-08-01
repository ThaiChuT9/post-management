const eventEmitter = require('events');
const e = require('express');
const emitter = new eventEmitter();

emitter.on('post:created', (post) => {
    console.log(`[EVENT] New post created: ${post.title}`);
});
emitter.on('post:updated', (post) => {
    console.log(`[EVENT] Post updated: ${post.title}`);
});
emitter.on('post:deleted', (postId) => {
    console.log(`[EVENT] Post deleted with ID: ${postId}`);
});
module.exports = emitter;