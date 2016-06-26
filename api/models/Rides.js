/**
* Rides.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  },

    getRides : function(searchObj, cb){
        Rides.find(searchObj).exec(function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    },

    save : function(reqObj, cb){
        Rides.create(reqObj, function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    },

    edit : function(searchObj, reqObj, cb){
        Rides.update(searchObj, reqObj,  function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    }
};

