import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Users } from '../api/users.js';
import { Messages } from '../api/messages.js';

import './body.html';

Template.page.onCreated(function pageOnCreated() {
    this.currUser = new ReactiveVar('');
    this.errorMsg = new ReactiveVar('');
    this.selectedUser = new ReactiveVar('');
});

Template.page.helpers({
    currUser() {
        return Template.instance().currUser.get();
    },
    errorMsg() {
        return Template.instance().errorMsg.get();
    },
    otherUsers() {
        return Users.find({username: {$ne: Template.instance().currUser.get()}});
    },
    sharedMsgs() {
        let selectedUser = Template.instance().selectedUser.get();
        let currUser = Template.instance().currUser.get();
        let search = Messages.find( {
            $and : [
                { $or : [ { sender : selectedUser}, { sender : currUser } ] },
                { $or : [ { receiver : selectedUser}, {receiver : currUser} ] }
            ]
        }).fetch();
        return search;
    },
});

Template.page.events({
    'click input[type=submit]' (e) {
        e.preventDefault();
        let input = $('#formText').val();
        if (input === '') {
            Template.instance().errorMsg.set('Error: Please enter a username');
        } else {
            //text input not empty
            query = Users.findOne({username: input});
            if ($(e.target).prop('id') === 'login') {
                if (typeof query === 'undefined') {
                    Template.instance().errorMsg.set('Error: Username does not exist');
                }   
                else {
                    Template.instance().errorMsg.set('');
                    // update login status
                    Template.instance().currUser.set(input);
                }
            }
            else if ($(e.target).prop('id') === 'createAcct') {
               if (typeof query !== 'undefined') {
                   Template.instance().errorMsg.set('Error: Username already exists');
               } else {
                   Template.instance().errorMsg.set('');
                   // insert username into collection
                   Users.insert({username: input});
                   // update login status
                   Template.instance().currUser.set(input);
               }
            }
        }
    },
    'click #logoutBtn' (e) {
        e.preventDefault();
        Template.instance().currUser.set('');
    },
    'change #userDropdown' (e) {
        e.preventDefault();
        Template.instance().selectedUser.set($('#userDropdown').find(':selected').text())
    },
    'keydown #newMsgForm' (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            return false;
        }
    },
    'click #submitMsgBtn' (e) {
        e.preventDefault();
        let newMsg = $('#newMsgText').val();
        if (Template.instance().selectedUser.get() !== '' && newMsg != '') {
            let newMsg = $('#newMsgText').val();
            Messages.insert({
                sender: Template.instance().currUser.get(),
                receiver: Template.instance().selectedUser.get(),
                text: newMsg,
                createdAt: new Date()
            });  
        }
    },
    'click .deleteBtn' (e) {
        e.preventDefault();
        Meteor.call('messages.remove', this._id);
    },
});
