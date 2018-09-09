geobyip = {
    options: {
        isFirstLoad: true,
        countryIso: "",
        saveUserIpAgrUrl: "/Home/SaveUserIpAgreement"
    },
    init: function () {
        var self = this;

        var isoFromCookie = as.sys.getCookie("CountryISO");
        var countryISOFirstLoad = as.sys.getCookie("CountryISOFirstLoad") == "false" ? false : true;
        if (self.isNullOrWhitespace(isoFromCookie) || (self.options.isFirstLoad && countryISOFirstLoad)) {
            self.getLocation();
        }

        $(document).on("click", ".btn-cookie-agree", function () {
            var dataToSave = $(".location-countries option:selected").attr("data-iso");
            as.sys.setCookie("CountryISO", dataToSave.toLowerCase(), 30);
            as.sys.setCookie("CountryISOFirstLoad", false, 30);
            self.optionssFirstLoad = false;
            var url = geobyip.options.saveUserIpAgrUrl;
            geobyip.saveUserIpAgreement(url);

            location.reload();

        });
    },
    saveUserIpAgreement: function (url) {
        as.sys.ajaxSend(url, false, function (data) {
            if (!data.res) {
                as.sys.bootstrapAlert(data.msg || "Возникли ошибки при выполнении операции!", { type: 'danger' });
            }
        });
    },
    getLocation: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {

                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                geobyip.getCountryISO(lat, lng)

            }, function (error) {
                var defLat = 0;
                var defLng = 0;
                geobyip.getCountryISO(defLat, defLng)
            });
        }
    },
    getCountryISO: function (lat, lng) {
        var geocoder = new google.maps.Geocoder();
        var position = new google.maps.LatLng(lat, lng);
        if (lat == 0 && lng == 0) {
            $(".location-countries option[data-iso='" + lat + "']").attr("selected", "selected");
            $("#geobyip").modal("show");
        }
        else {
            geocoder.geocode({ 'latLng': position }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        var loc = geobyip.getCountry(results);

                        $(".location-countries option[data-iso='" + loc + "']").attr("selected", "selected");
                        $("#geobyip").modal("show");
                    }
                }
            });
        }
    },
    getCountry: function (results) {
        for (var i = 0; i < results[0].address_components.length; i++) {
            var shortname = results[0].address_components[i].short_name;
            var longname = results[0].address_components[i].long_name;
            var type = results[0].address_components[i].types;
            if (type.indexOf("country") != -1) {
                if (!geobyip.isNullOrWhitespace(shortname)) {
                    return shortname;
                }
                else {
                    return longname;
                }
            }
        }
    },
    isNullOrWhitespace: function (text) {
        if (text == null) {
            return true;
        }
        return text.replace(/\s/gi, '').length < 1;
    }
}
