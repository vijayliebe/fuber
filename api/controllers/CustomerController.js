/**
 * CustomerController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getProfile : function(req, res){
        var searchObj = {"email" : req.body.email};
        Customer.getCustomer(searchObj, function(err, customer){
            if(!err){
                res.json(customer);
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        });
    },

    saveProfile : function(req, res){
        var data = req.body;
            data = schema.filterCustomerData(data);
        Customer.save(data, function(err, customer){
            if(!err){
                res.json(customer);
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        });
    },

    bookCab : function(req, res){
        var data = req.body,
            useremail=data.email,
            userlat = Number(data.lat),
            userlon = Number(data.lon);
        //var searchObj = {"location" : {$near:[lat, lon]}};
        var searchObj = {"status" : {$ne : "busy"}, "location" : {$near:{$geometry: {type:"Point", coordinates:[userlat , userlon]}, $maxDistance:500}}};

        async.waterfall([
            //checking if existing rides
            function(callback){
                var searchCabObj = {"customerEmail" : useremail, "ridestatus" : {$in : ["inprogress", "started"]}};
                sails.controllers.rides.getRide(searchCabObj, function(err, ride){
                    if(!err){
                        if(ride.length === 0){
                            callback(err, ride);
                        }else{
                            callback({"status" : 400, "message" : "Cab is already booked"});
                        }
                    }else{
                        callback(err);
                    }

                })
            },

            //customer details
            function(ride, callback){
                var searchCustObj = {"email" : useremail};
                Customer.getCustomer(searchCustObj, function(err, customer){
                    callback(err, customer[0]);
                });
            },

            //near by cabs
            function(customer, callback){
                Cab.getCab(searchObj, function(err, cabs){
                    if(!err){
                        if(cabs.length !== 0){
                            callback(null, customer, cabs[0]);
                        }else{
                            callback({"status" : 400, "message" : "No cab found"});
                        }
                    }else{
                        callback(err);
                    }
                });
            },

            //save ride details
            function(customer, cab, callback){
                var saveObj = {
                    "cabEmail" : cab.email,
                    "cabId" : cab.id,
                    "cabType" : cab.type,
                    "customerEmail" : customer.email,
                    "customerId" : customer.id,
                    "startLocation" : [userlat, userlon],
                    "endLocation" : [],
                    "bookedTime" : new Date(),
                    "ridestatus" : "inprogress"
                };
                sails.controllers.rides.saveRide(saveObj, function(err, ride){
                    callback(err, ride);
                })
            },

            //update cab-driver status
            function(ride, callback){
                var searchObj = {"email" : ride.cabEmail};
                var updateObj = {
                    "status" : "busy"
                };

                Cab.edit(searchObj, updateObj, function(err, cab){
                    callback(err, ride);
                });
            }
            //need to notify cab driver of this ride - either socket connection or GCM can be used
        ], function(err, ride){
            if(err){
                sails.config.globals.logger.error(err);
                return res.negotiate(err);
            }
            return res.json(ride);
        });
    }
};

