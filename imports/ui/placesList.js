import { Accommodation } from "../api/accommodation-methods.js";

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { HistoryLocation } from "../api/resa-methods";

Template.places_list.onCreated(function(){

    //places are displayed dependently on the date of the day
    //here is the filter
    this.subscribe('places');
    this.subscribe('history');
    this.subscribe('usersPublication');

    var filterActualDate = new Date();
    var filterActualMonth = filterActualDate.getMonth()+1;
    var filterActualDay = filterActualDate.toDateString().substr(8,2);
    console.log(`actual date : ${filterActualDay}`)

    //global var
    filterQuery = {}
    var tmpKey = `availability.${filterActualMonth}.${filterActualDay}`
    filterQuery[tmpKey] = filterActualDate.toDateString()

})

Template.places_list.helpers({
    'places':function() {

        let startToday = new Date();
        startToday.setHours(0,0,0,0);

        let endToday = new Date();
        endToday.setHours(23,59,59,999);
 
        let reservedAccommodationsForToday = HistoryLocation.find(
            {$and : [
                {resa_status:"reserved"},
                {date_resa : {$gte: startToday, $lt: endToday}}
            ]},
            {fields : {
                place_id:1
            }}
        ).fetch();

        console.log(reservedAccommodationsForToday)
        
        // Every accommodation filtered by the date of today
        let placesForToday = Accommodation.find(
            {$and :[
                filterQuery,
            ]}).fetch();

        // Filter places with reservations data and associate accommodation with reservation
        let placesReservedToday = placesForToday.filter(item => {
            return reservedAccommodationsForToday.some( element => {
              return element.place_id === item._id;
            })
          });

        // Remove reserved accommodations
        let placesAvailableToday = placesForToday.filter(item => {
            return placesReservedToday.every(element => {
                return element._id !== item._id;
            })
        });

        //if no reservation exists
        if(placesAvailableToday==0){
            console.log("all Places")
            return placesForToday;
        }
        else{
            console.log("only available");      
            return placesAvailableToday;
            
        }
    }
 });

// Permet d'afficher les noms des users de chaque adresse
Template.places_list_item.helpers({
    'firstname': function(){
        let hostId = this.host_id;
        let number = Meteor.users.findOne(
            {_id:hostId},
        );
        let hostname = number.firstname;
        return hostname;
    },
    'lastname': function(){
        let hostId = this.host_id;
        let number = Meteor.users.findOne(
            {_id:hostId},
        );
        let lastname = number.lastname;
        return lastname;
        },
    // C'est normale que ça ne s'affiche pas car les mails et les phoneNumbers sont pas dans la base de données des accueillants
    // 'mail': function(){
    //     Meteor.subscribe('places')
    //     let hostId = this.host_id;
    //     let number = Meteor.users.findOne(
    //         {_id:hostId},
    //     );
    //     let mail = number.;
    //     return mail;
    // },
    
    'phone': function(){
         let hostId = this.host_id;
         let number = Meteor.users.findOne(
             {_id:hostId},
         );
         let phone = number.phoneNumber;
         return phone; 
     } 
})