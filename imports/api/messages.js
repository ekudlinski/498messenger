import { Mongo } from 'meteor/mongo';

export const Messages = new Mongo.Collection('messages');

Meteor.methods({
    'messages.remove'(id) {
        Messages.remove({
            _id: id,
        })
    },
})
