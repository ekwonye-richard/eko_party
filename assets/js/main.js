var ekoApp = angular.module('ekoApp', ['ui.router', 'ngSanitize']);

ekoApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

            .state('home', {
                url: '/home',
                templateUrl: 'assets/pages/home.html'
            })

            .state('trending', {
                url: '/trending',
                templateUrl: 'assets/pages/trending.html'
            })

            .state('clubs', {
                url: '/clubs',
                templateUrl: 'assets/pages/clubs.html'
            })

            .state('ft-clb-details', {
                url: '/clubs/featured/details',
                templateUrl: 'assets/pages/ft-clb-details.html'
            })

            .state('clb-details', {
                url: '/clubs/details',
                templateUrl: 'assets/pages/clb-details.html'
            })

            .state('cafes', {
                url: '/cafes',
                templateUrl: 'assets/pages/cafes.html'
            })

            .state('ft-cafe-details', {
                url: '/cafes/featured/details',
                templateUrl: 'assets/pages/ft-cafe-details.html'
            })

            .state('cafe-details', {
                url: '/cafes/details',
                templateUrl: 'assets/pages/cafe-details.html'
            })

            .state('beach', {
                url: '/beaches',
                templateUrl: 'assets/pages/beach.html'
            })

            .state('bch-details', {
                url: '/beaches/details',
                templateUrl: 'assets/pages/bch-details.html'
            })

            .state('cinemas', {
                url: '/cinemas',
                templateUrl: 'assets/pages/cinemas.html'
            })

            .state('cin-details', {
                url: '/cinemas/details',
                templateUrl: 'assets/pages/cin-details.html'
            })

            .state('search', {
                url: '/search',
                templateUrl: 'assets/pages/search.html'
            })

            .state('sch-details', {
                url: '/search/details',
                templateUrl: 'assets/pages/sch-details.html'
            })

            ;

});

ekoApp.run(
        ['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;

                $rootScope
                        .$on('$stateChangeStart',
                                function (event, toState, toParams, fromState, fromParams) {
                                    $("#temp").html("");
                                    $(".loading").removeClass("hidden");
                                });

                $rootScope
                        .$on('$stateChangeSuccess',
                                function (event, toState, toParams, fromState, fromParams) {
                                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                                    $(".loading").addClass("hidden");
                                    $rootScope.previousState_name = fromState.name;
                                    $rootScope.previousState_params = fromParams;
                                });

                $rootScope.back = function () {
                    $state.go($rootScope.previousState_name, $rootScope.previousState_params);
                };

            }
        ]
        );


ekoApp.service('Map', function ($q) {

    var lagos = new google.maps.LatLng(6.5243793, 3.379205700000057);

    this.init = function () {
        var options = {
            center: lagos,
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: true
        }
        this.map = new google.maps.Map(
                document.getElementById("map"), options
                );
        this.places = new google.maps.places.PlacesService(this.map);
    }

    this.specMap = function (lat, lng) {

        var specPlace = new google.maps.LatLng(lat, lng);

        var options = {
            center: specPlace,
            zoom: 14,
            disableDefaultUI: true,
            zoomControl: true
        }

        this.map = new google.maps.Map(
                document.getElementById("c-map"), options
                );
        this.places = new google.maps.places.PlacesService(this.map);
    }

    this.search = function (str) {
        var d = $q.defer();
        this.places.textSearch({location: lagos, radius: '500', query: str}, function (results, status) {
            if (status == 'OK') {

                var res = [];

                for (var i = 0; i < results.length; i++) {
                    res.push(results[i]);
                }
                d.resolve(res);
            }
            else
                d.reject(status);
        });
        return d.promise;
    };

    this.matrix = function (origin, destination) {
        var d = $q.defer();

        var service = new google.maps.DistanceMatrixService;

        service.getDistanceMatrix({
            origins: origin,
            destinations: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function (response, status) {

            if (status == 'OK') {
                d.resolve(response.rows[0].elements);
            }
            else
                d.reject(status);
        });
        return d.promise;

    };


    this.addMarker = function (res) {
        if (this.marker)
            this.marker.setMap(null);
        this.marker = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP
        });
        this.map.setCenter(res.geometry.location);
    };

    this.hideModal = function () {
        $('.ui.basic.modal')
                .modal('hide')
                ;
    };

    this.showModal = function () {
        $('.ui.cl-data.modal')
                .modal('show')
                ;
    };
});



ekoApp.controller('MainCtrl', function ($scope, $state, $http, Map) {

    
    $scope.curLat = "6.5243793";
    $scope.curLng = "3.379205700000057";
    $scope.geoLoc = 0;
    $scope.error = "";

    $scope.mapOptions = {
        center: new google.maps.LatLng($scope.lat, $scope.lng),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.showPosition = function (position) {
        $scope.curLat = position.coords.latitude;
        $scope.curLng = position.coords.longitude;
        $scope.accuracy = position.coords.accuracy;
        $scope.$apply();

    }

    $scope.showError = function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                $scope.error = "User denied the request for Geolocation."
                break;
            case error.POSITION_UNAVAILABLE:
                $scope.error = "Location information is unavailable."
                break;
            case error.TIMEOUT:
                $scope.error = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                $scope.error = "An unknown error occurred."
                break;
        }
        $scope.$apply();
    }

    $scope.getLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
            $scope.geoLoc = 1;
        }
        else {
            $scope.error = "Geolocation is not supported by this browser.";
        }
    }

    $scope.getLocation();


    $scope.format = 'h:mm a';
    
    $http.get('assets/dt/01ad2.json').success(function (data) {
        $scope.trends = data;
    });

    $http.get('assets/dt/clubs.json').success(function (data) {
        $scope.ftClubs = data;
    });

    $http.get('assets/dt/cafes.json').success(function (data) {
        $scope.ftCafes = data;
    });

    $http.get('http://api.openweathermap.org/data/2.5/weather?lat=6.5243793&lon=3.379205700000057&units=metric&appid=cad454bc9f01941a7e2e183cf1bab624').success(function (data) {
        $scope.weather = data;
    });

    $http.get('http://api.timezonedb.com/?lat=6.5243793&lng=3.379205700000057&format=json&key=4YQT631TRM44').success(function (data) {
        $scope.curTime = data;
    });

    $scope.upcomingEvents = function (obj) {
        var date = new Date();
        var eventDate = Date.parse(obj.evDate);
        return eventDate >= date;
    };

    


    Map.init();

    $scope.place = {};

    $scope.ftClub = function (clData, mtData) {
        $scope.clb = clData;
        $scope.lat = clData.geometry.location.lat;
        $scope.lng = clData.geometry.location.lng;
        $scope.mat = mtData;
        $state.go('ft-clb-details');
    }

    $scope.clubData = function (clData, mtData) {
        $scope.clb = clData;
        $scope.lat = clData.geometry.location.lat();
        $scope.lng = clData.geometry.location.lng();
        $scope.mat = mtData;
        $state.go('clb-details');
    }

    $scope.ftCafe = function (brData, mtData) {
        $scope.cafe = brData;
        $scope.lat = brData.geometry.location.lat;
        $scope.lng = brData.geometry.location.lng;
        $scope.mat = mtData;
        $state.go('ft-cafe-details');
    }

    $scope.cafeData = function (brData, mtData) {
        $scope.cafe = brData;
        $scope.lat = brData.geometry.location.lat();
        $scope.lng = brData.geometry.location.lng();
        $scope.mat = mtData;
        $state.go('cafe-details');
    }

    $scope.cinemaData = function (cinData, mtData) {
        $scope.cin = cinData;
        $scope.lat = cinData.geometry.location.lat();
        $scope.lng = cinData.geometry.location.lng();
        $scope.mat = mtData;
        $state.go('cin-details');
    }

    $scope.beachData = function (bchData, mtData) {
        $scope.bch = bchData;
        $scope.lat = bchData.geometry.location.lat();
        $scope.lng = bchData.geometry.location.lng();
        $scope.mat = mtData;
        $state.go('bch-details');
    }

    $scope.srchData = function (schData, mtData) {
        $scope.sch = schData;
        $scope.lat = schData.geometry.location.lat();
        $scope.lng = schData.geometry.location.lng();
        $scope.mat = mtData;
        $state.go('sch-details');
    }

    $state.transitionTo("home");
    $scope.search = function () {

        Map.hideModal();

        $state.transitionTo("search", {
            //
        }, {
            reload: true,
            notify: true
        });
    }

});


ekoApp.controller('PlaceCtrl', function ($scope, Map) {

    if (!$scope.searchPlace)
    {
        $scope.searchPlace = " ";
    }

    $scope.apiError = false;
    Map.search($scope.searchPlace)
            .then(
                    function (res) { // success
                        $scope.srchRes = res;

                        $scope.srchCords = [];

                        angular.forEach($scope.srchRes, function (value, index) {
                            $scope.srchCords.push({lat: value.geometry.location.lat(), lng: value.geometry.location.lng()});
                        });

                        $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

                        Map.matrix($scope.origin, $scope.srchCords)
                                .then(
                                        function (res) { // success
                                            angular.forEach(res, function (result, index) {
                                                result.index = index;
                                            });
                                            $scope.srchDist = res;
                                        },
                                        function () { // error

                                        }
                                );
                    },
                    function (status) { // error
                        $scope.apiError = true;
                        $scope.apiStatus = status;
                    }
            );
});


ekoApp.controller('ClubCtrl', function ($scope, Map) {

    $scope.apiError = false;

    $scope.ftClubCords = [];

    angular.forEach($scope.ftClubs, function (value, index) {
        $scope.ftClubCords.push({lat: value.geometry.location.lat, lng: value.geometry.location.lng});
    });

    $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

    Map.matrix($scope.origin, $scope.ftClubCords)
            .then(
                    function (res) { // success
                        angular.forEach(res, function (result, index) {
                            result.index = index;
                        });
                        $scope.ftClubDist = res;
                    },
                    function () { // error

                    }
            );

    this.query = "night club in lagos";

    if (!$scope.clubs) {

        Map.search(this.query)
                .then(
                        function (res) { // success
                            $scope.clubs = res;

                            $scope.clubCords = [];

                            angular.forEach($scope.clubs, function (value, index) {
                                $scope.clubCords.push({lat: value.geometry.location.lat(), lng: value.geometry.location.lng()});
                            });

                            $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

                            Map.matrix($scope.origin, $scope.clubCords)
                                    .then(
                                            function (res) { // success
                                                angular.forEach(res, function (result, index) {
                                                    result.index = index;
                                                });
                                                $scope.clubDist = res;
                                            },
                                            function () { // error

                                            }
                                    );

                        },
                        function (status) { // error
                            $scope.apiError = true;
                            $scope.apiStatus = status;
                        }
                );
    }

});

ekoApp.controller('CafeCtrl', function ($scope, Map) {

    $scope.apiError = false;

    $scope.ftCafeCords = [];

    angular.forEach($scope.ftCafes, function (value, index) {
        $scope.ftCafeCords.push({lat: value.geometry.location.lat, lng: value.geometry.location.lng});
    });

    $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

    Map.matrix($scope.origin, $scope.ftCafeCords)
            .then(
                    function (res) { // success
                        angular.forEach(res, function (result, index) {
                            result.index = index;
                        });
                        $scope.ftCafeDist = res;
                    },
                    function () { // error

                    }
            );

    this.query = "cafe food in lagos";

    if (!$scope.cafes) {

        Map.search(this.query)
                .then(
                        function (res) { // success
                            $scope.cafes = res;

                            $scope.cafeCords = [];

                            angular.forEach($scope.cafes, function (value, index) {
                                $scope.cafeCords.push({lat: value.geometry.location.lat(), lng: value.geometry.location.lng()});
                            });

                            $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

                            Map.matrix($scope.origin, $scope.cafeCords)
                                    .then(
                                            function (res) { // success
                                                angular.forEach(res, function (result, index) {
                                                    result.index = index;
                                                });
                                                $scope.cafeDist = res;
                                            },
                                            function () { // error

                                            }
                                    );

                        },
                        function (status) { // error
                            $scope.apiError = true;
                            $scope.apiStatus = status;
                        }
                );
    }

});



ekoApp.controller('CinCtrl', function ($scope, Map, $http) {

    this.query = "cinemas movie theatre";
    $scope.apiError = false;

    if (!$scope.cinemas) {
        Map.search(this.query)
                .then(
                        function (res) { // success
                            $scope.cinemas = res;

                            $scope.cinCords = [];

                            angular.forEach($scope.cinemas, function (value, index) {
                                $scope.cinCords.push({lat: value.geometry.location.lat(), lng: value.geometry.location.lng()});
                            });

                            $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

                            Map.matrix($scope.origin, $scope.cinCords)
                                    .then(
                                            function (res) { // success
                                                angular.forEach(res, function (result, index) {
                                                    result.index = index;
                                                });
                                                $scope.cinDist = res;
                                            },
                                            function () { // error

                                            }
                                    );

                        },
                        function (status) { // error
                            $scope.apiError = true;
                            $scope.apiStatus = status;
                        }
                );
    }
});

ekoApp.controller('BchCtrl', function ($scope, Map, $http) {

    this.query = "beaches";
    $scope.apiError = false;

    if (!$scope.beaches) {
        Map.search(this.query)
                .then(
                        function (res) { // success
                            $scope.beaches = res;

                            $scope.bchCords = [];

                            angular.forEach($scope.beaches, function (value, index) {
                                $scope.bchCords.push({lat: value.geometry.location.lat(), lng: value.geometry.location.lng()});
                            });

                            $scope.origin = [{lat: $scope.curLat, lng: $scope.curLng}];

                            Map.matrix($scope.origin, $scope.bchCords)
                                    .then(
                                            function (res) { // success
                                                angular.forEach(res, function (result, index) {
                                                    result.index = index;
                                                });
                                                $scope.bchDist = res;
                                            },
                                            function () { // error

                                            }
                                    );

                        },
                        function (status) { // error
                            $scope.apiError = true;
                            $scope.apiStatus = status;
                        }
                );
    }
});


ekoApp.controller('SpecCtrlClub', function ($scope, $state, Map) {

    if ($scope.clb) {
        Map.specMap($scope.clb);
        Map.addMarker($scope.clb);
    }

    else {
        $state.go('clubs');
    }
});

ekoApp.controller('SpecCtrlBch', function ($scope, $state, Map) {

    if ($scope.bch) {
        Map.specMap($scope.bch);
        Map.addMarker($scope.bch);
    }

    else {
        $state.go('beach');
    }
});

ekoApp.controller('SpecCtrlSch', function ($scope, $state, Map) {

    if ($scope.sch) {
        Map.specMap($scope.sch);
        Map.addMarker($scope.sch);
    }

    else {
        $state.go('home');
    }
});

ekoApp.controller('SpecCtrlCin', function ($scope, $state, Map) {

    if ($scope.cin) {
        Map.specMap($scope.cin);
        Map.addMarker($scope.cin);
    }

    else {
        $state.go('cinemas');
    }
});


ekoApp.controller('SpecCtrlCafe', function ($scope, $state, Map) {

    if ($scope.cafe) {
        Map.specMap($scope.cafe);
        Map.addMarker($scope.cafe);
    }

    else {
        $state.go('cafes');
    }
});

ekoApp.filter('undScr', function () {
    return function (text) {

        return text.replace(/_/g, ' ');

    };
})


ekoApp.directive("myCurrentTime", function (dateFilter) {
    return function (scope, element, attrs) {
        var format;

        scope.$watch(attrs.myCurrentTime, function (value) {
            format = value;
            updateTime();
        });

        function updateTime() {
            var dt = moment.tz("Africa/Algiers").format('h:mm a');
            element.text(dt);
        }

        function updateLater() {
            setTimeout(function () {
                updateTime(); // update DOM
                updateLater(); // schedule another update
            }, 1000);
        }

        updateLater();
    }
});