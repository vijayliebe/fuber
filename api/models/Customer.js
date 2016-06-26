/**
* Customer.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  },

    getCustomer : function(searchObj, cb){
        Customer.find(searchObj).exec(function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    },

    save : function(reqObj, cb){
        Customer.create(reqObj, function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    },

    edit : function(searchObj, reqObj, cb){
        Customer.update(searchObj, reqObj,  function(err, result){
            if(!err){
                return cb(null, result);
            }else{
                return cb(err);
            }
        })
    }
};

