$( document ).ready(function() {
    $("input#searchloc").geocomplete({
        details: "form#locDetails"
        //map: "#my_map"
    });

    var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    var locations = [
        ['loan 1', -33.890542, 151.274856, 'address 1', 'http://www.philippetersen.co.uk/images/car-icon.png?1400146158'],
        ['loan 2', -33.923036, 151.259052, 'address 2', 'http://www.philippetersen.co.uk/images/car-icon.png?1400146158'],
        ['loan 3', -34.028249, 151.157507, 'address 3', ''],
        ['loan 4', -33.80010128657071, 151.28747820854187, 'http://www.philippetersen.co.uk/images/car-icon.png?1400146158'],
        ['loan 5', -33.950198, 151.259302, 'address 5', 'http://www.philippetersen.co.uk/images/car-icon.png?1400146158']
    ];

    function initialize() {

        var myOptions = {
            center: new google.maps.LatLng(33.890542, 151.274856),
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP

        };
        var map = new google.maps.Map(document.getElementById("my_map"),
            myOptions);

        setMarkers(map,locations)

    }

    function setMarkers(map,locations){

        var marker, i

        for (i = 0; i < locations.length; i++)
        {

            var loan = locations[i][0]
            var lat = locations[i][1]
            var long = locations[i][2]
            var add =  locations[i][3]
            var iconpath =  locations[i][4]

            latlngset = new google.maps.LatLng(lat, long);
            var marker = new google.maps.Marker({
                map: map,
                title: loan ,
                position: latlngset,
                icon: iconpath
            });
            map.setCenter(marker.getPosition())


            var content = "Loan Number: " + loan +  '</h3>' + "Address: " + add;
            //var content = "";

            var infowindow = new google.maps.InfoWindow()

            google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){
                return function() {
                    infowindow.setContent(content);
                    infowindow.open(map,marker);
                };
            })(marker,content,infowindow));

        }
    }

    //initialize();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            var mylat = position.coords.latitude, mylong = position.coords.longitude;
            var latlng = new google.maps.LatLng(mylat, mylong);
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        console.log(results[1].formatted_address);
                        $("input#searchloc").val(results[1].formatted_address);
                        //$("input#searchloc").trigger("geocode");
                    }
                }
            });


            getNearByLocations({"lat" : mylat, "lon" : mylong}, function(err, result){
                if(!err){
                    locations = result;
                    initialize();
                    $('.loader').hide();
                }else{
                    console.log('Error', err);
                }
            });

        });
    } else {
        error('Geo Location is not supported');
    }

    $('.searchBtn').click(function(e){
        // e.preventDefault();
        var lat = $('input#lat').val();
        var lon = $('input#lng').val();
        getNearByLocations({"lat" : lat, "lon" : lon}, function(err, result){
            if(!err){
                locations = result;
                initialize();
                $('.loader').hide();
            }else{
                console.log('Error', err);
            }
        });
    });

});

function getNearByLocations(reqdata, cb){
    $.ajax({
        url: "/nearByCabs",
        method: "POST",
        data: JSON.stringify(reqdata),
        contentType: 'application/json',
        processData: false,
        success: function (data, textStatus, jqXHR) {
            return cb(null, data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            return cb(err);
        }
    });
}