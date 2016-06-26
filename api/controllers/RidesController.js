/**
 * RidesController
 *
 * @description :: Server-side logic for managing rides
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getRide : function(searchObj, cb){
        Rides.getRides(searchObj, function(err, rides){
            return cb(err, rides);
        });
    },

    saveRide : function(saveObj, cb){
        var data = saveObj;

        Rides.save(data, function(err, rides){
            return cb(err, rides);
        });
    },

    updateRide : function(searchObj, updateObj, cb){
        Rides.edit(searchObj, updateObj,function(err, rides){
            return cb(err, rides);
        });
    }
};

