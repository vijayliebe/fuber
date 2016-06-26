/**
 * CabController
 *
 * @description :: Server-side logic for managing cabs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    getCabProfile : function(req, res){
        var searchObj = {"email" : req.body.email};
        Cab.getCab(searchObj, function(err, cab){
            if(!err){
                res.json(cab[0]);
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        });
    },

    saveCabProfile : function(req, res){
        var data = req.body;
        data = schema.filterCabData(data);

        var location = data.location, lat, lon;
        if(location.lat && location.lon){
            lat = location.lat; lon = location.lon;
        }else{
            res.status(400).json(   );
        }

        data.location = {
            "type": "Point",
            "coordinates": [lat,lon]
        }

        Cab.save(data, function(err, cab){
            if(!err){
                res.json(cab);
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        });
    },

    nearByCabs : function(req, res){
        var lat = Number(req.body.lat), lon = Number(req.body.lon);
        //var searchObj = {"location" : {$near:[lat, lon]}};
        var searchObj = {"status" : {$ne : "busy"}, "location" : {$near:{$geometry:{type:"Point", coordinates:[lat , lon]}, $maxDistance:500}}};

        Cab.getCab(searchObj, function(err, cabLocations){
            if(!err){
                var locations = [];

                _.each(cabLocations, function(cabLoc){
                    var coordinate = cabLoc.location.coordinates,
                        lat = coordinate[0],
                        lon = coordinate[1];
                    var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
                    var pushObj = [cabLoc.name, lat, lon, cabLoc.email, 'http://www.philippetersen.co.uk/images/car-icon.png?1400146158'];
                    locations.push(pushObj);
                });

                locations.push(['User', lat, lon, 'Customer', '']);
                if(req.socket.id){
                    setInterval(function(){
                        sails.sockets.emit(req.socket.id, 'nearbycabs', locations);
                    }, 10000);
                }else{
                    res.json(locations);
                }
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        });
    },

    nearByCabsTest : function(req, res){
        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
        var locations = [
            ['loan 1', -33.890542, 151.274856, 'address 1', iconBase+'parking_lot_maps.png'],
            ['loan 2', -33.923036, 151.259052, 'address 2', iconBase+'library_maps.png'],
            ['loan 3', -34.028249, 151.157507, 'address 3', 'http://www.philippetersen.co.uk/images/car-icon.png?1400146158'],
            ['loan 4', -33.80010128657071, 151.28747820854187, iconBase+'address 4', 'info-i_maps.png'],
            ['loan 5', -33.950198, 151.259302, 'address 5', iconBase+'car_maps.png']
        ];

        setInterval(function(){
            sails.sockets.emit(req.socket.id, 'nearbycabs', locations);
        }, 10000);
    },

    updateCabLocation : function(req, res){
        var data = req.body,
            email = data.email,
            lat = data.lat,
            lon = data.lon;

        var searchObj = {"email" : email};
        var updateObj = {"location" : {
            "type": "Point",
            "coordinates": [lat,lon]
            }};

        Cab.edit(searchObj, updateObj, function(err, cab){
            if(!err){
                res.json(cab);
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        });
    },

    startRide : function(req, res){
        //Assuming cab-driver has received booking detail either through socket connection or GCM
        var rideId = req.body.rideId;

        var searchObj = {
            "id" : rideId
        };

        var updateObj = {
            "startTime" : new Date(),
            "ridestatus" : "started"
        };

        sails.controllers.rides.getRide(searchObj, function(err, ride){
            if(!err){
                if(ride && ride[0] && ride[0].ridestatus === "inprogress"){
                    sails.controllers.rides.updateRide(searchObj, updateObj, function(err, ride){
                        if(!err){
                            res.json(ride);
                        }else{
                            sails.config.globals.logger.error(err);
                            res.negotiate(err);
                        }
                    })
                }else{
                    res.negotiate({"status" : 400, "message" : "Either ride has been started or completed"});
                }
            }else{
                sails.config.globals.logger.error(err);
                res.negotiate(err);
            }
        })


    },

    endRide : function(req, res){
         var rideId = req.body.rideId,
             lat = req.body.lat,
             lon = req.body.lon,
             endTime = new Date();

          async.waterfall([
              //get ride details
              function(callback){
                  var searchObj = {
                    "id" : rideId
                  };
                  sails.controllers.rides.getRide(searchObj, function(err, ride){
                      callback(err, ride[0]);
                  })
              },

              //calculate distance travelled
              function(ride, callback){
                  console.log('ride---', ride);
                  if(!(ride) || (ride && ride.ridestatus === "completed")){
                      return callback({"status" : 400, "message" : "Either Ride is complted or not started"});
                  }
                 var startLoc = ride.startLocation;
                  console.log(startLoc[0], startLoc[1], lat, lon);
                 var dist = getDistanceFromLatLonInKm(startLoc[0], startLoc[1], lat, lon);
                    console.log('dist---', dist);
                    callback(null, ride, dist);
              },

              //calculate amount
              function(ride, distance, callback){
                var pink;
                if(ride.cabType === "pink") pink = true;
                var timeMin = timeDiff(ride.startTime, endTime);

                var amt = totalAmount(pink, distance, timeMin);
                callback(null, ride, distance, amt, timeMin);
              },

              //update ride with endlocation
              function(ride, distance, amt, timeMin, callback){
                  var searchObj = {
                      "id" : rideId
                  };

                  var updateObj = {
                      "endLocation" : [lat, lon],
                      "endTime" : endTime,
                      "distance" : distance,
                      "amt" :amt,
                      "timeInMin" :timeMin,
                      "ridestatus" : "completed"
                  };
                  sails.controllers.rides.updateRide(searchObj, updateObj, function(err, ride){
                      callback(err, ride[0]);
                  })
              },

              //update cab-driver status and position
              function(ride, callback){
                  console.log('Inside update cab-driver status and position');
                  var searchObj = {"email" : ride.cabEmail};
                  var updateObj = {
                      "status" : "free",
                      "location" : {
                                        "type": "Point",
                                        "coordinates": [lat,lon]
                                    }
                  };
                  console.log(JSON.stringify(searchObj), JSON.stringify(updateObj));
                  Cab.edit(searchObj, updateObj, function(err, cab){
                     callback(err, ride);
                  });
              }
          ], function(err, ride){
              if(err){
                  sails.config.globals.logger.error(err);
                  return res.negotiate(err);
              }

              return res.json(ride);
          });

    }


    };

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}


function totalAmount(pink, d, m){
    var total = 0,
        ratePerMin = 1,
        ratePerKm = 2,
        ratePinkCar  = 5;

    if(pink)
        total = total + ratePinkCar;

    total = total + (m*ratePerMin);
    total = total + (d*ratePerKm);

    return total;
}

function timeDiff(startTime, endTime){
    var timeDiff = Math.abs(endTime.getTime() - startTime.getTime());
    var diffMins = Math.ceil(timeDiff / (1000 * 60));

    return diffMins;
}