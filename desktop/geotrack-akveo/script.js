function loadGoogleMap() {
    let mapOptions = {
        center: new google.maps.LatLng(53.55, 27.33),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }
    let map = new google.maps.Map(document.getElementById("map"), mapOptions);
}