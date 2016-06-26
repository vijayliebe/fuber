/**
 * Created by vijaykumar on 25/06/16.
 */

module.exports = {

    filterCabData : function (data, cb) {
        var allowedKeys = {
            "name" : true,
            "email" : true,
            "mob" : true,
            "location" : true,
            "type" : true
        };

        return filterData(_.clone(data), allowedKeys);
    },

    filterCustomerData : function (data, cb) {
        var allowedKeys = {
            "name" : true,
            "email" : true,
            "mob" : true
        };

        return filterData(_.clone(data), allowedKeys);
    },

    filterRideData : function (data, cb) {
        var allowedKeys = {
            "cabEmail" : true,
            "cabId" : true,
            "customerEmail" : true,
            "customerId" : true,
            "startLocation" : true,
            "endLocation" : true
        };

        return filterData(_.clone(data), allowedKeys);
    }

}

var filterData = function(data, allowedKeys){
    _.each(data, function(v, k){
        if(!(k in allowedKeys)){
            delete data[k];
        }
    });

    return data;
}
