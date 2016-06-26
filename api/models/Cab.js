/**
* Cab.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  },

    getCab : function(searchObj, cb, limit){
        limit = limit ? limit : 10;
        Cab.find(searchObj).limit(limit).exec(function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    },

    save : function(reqObj, cb){
        Cab.create(reqObj, function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    },

    edit : function(searchObj, reqObj, cb){
        Cab.update(searchObj, reqObj,  function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    }
};

