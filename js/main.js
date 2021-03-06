'use strict';

/* Controllers */

angular.module('app')
    .controller('AppCtrl', ['$scope', '$window', '$timeout', '$rootScope', 'authServices', '$sessionStorage', '$state', 'toaster', 'webServices', 'webNotification', '$location', '$modal', 'isMobile', '$sce',
        function($scope, $window, $timeout, $rootScope, authServices, $sessionStorage, $state, toaster, webServices, webNotification, $location, $modal, isMobile, $sce, $modalInstance) {

            // config
            $scope.app = {
                name: 'Fast Deal',
                version: '1.0',
                // for chart colors
                color: {
                    primary: '#7266ba',
                    info: '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger: '#f05050',
                    light: '#e8eff0',
                    dark: '#3a3f51',
                    black: '#000000'
                },
                settings: {
                    themeID: 1,
                    navbarHeaderColor: 'bg-warning',
                    navbarCollapseColor: 'bg-white-only',
                    asideColor: 'bg-warning',
                    headerFixed: true,
                    asideFixed: true,
                    asideFolded: true,
                    asideDock: false,
                    container: false
                }
            }

            $rootScope.pickerdateOptions = {
                formatYear: 'yyyy',
                startingDay: 0,
                class: 'datepicker',
                showWeeks:false,
                minMode :'day'
            };
            


            $rootScope.height_to_reduce = 100;
            $rootScope.loadingMsg = 'Loading please Wait....';
            $rootScope.year = new Date().getFullYear();
            $rootScope.IMGURL = angular.copy(app.imageurl);
            $rootScope.imgextensions = angular.copy(app.imgextensions);
            $rootScope.pagelimits = angular.copy(app.pagelimits);
            $rootScope.noauthroutes = angular.copy(app.noauthroutes);
            $rootScope.isMobile = isMobile.phone;
            $rootScope.latlong = angular.copy(app.constantlatlong);
            $rootScope.maxUploadsize = angular.copy(app.maxUploadsize);
            $rootScope.validextensions = angular.copy(app.validextensions);
            $rootScope.maxUploadFiles = angular.copy(app.maxUploadFiles);
            $rootScope.validfileextensions = angular.copy(app.validfileextensions);
            $rootScope.tbptypes = angular.copy(app.tbptypes);
            $rootScope.kaizentypes = angular.copy(app.kaizentypes);

            $rootScope.dummyarray = [1,2,3,4,5,6,7,8,9,10];
            
            $rootScope.fixHelper = function(e, ui) {
                ui.children().each(function() {
                    $(this).width($(this).width());
                });
                return ui;
            };

            $rootScope.setSliderConfig = function() {
                $rootScope.slickConfig = {
                    enabled: true,
                    autoplay: false,
                    draggable: false,
                    slidesToShow: $rootScope.slidecount,
                    slidesToScroll: $rootScope.scrollslides,
                };
            }

            $rootScope.getfileCounts = function(files,type){
                return files.filter((obj) => obj.filetype === type).length;
            }

            $rootScope.getVideoUrl = function(url) {
                return $sce.trustAsResourceUrl($rootScope.IMGURL + url);
            };

            $scope.pop = function() {
                toaster.pop($scope.toaster.type, $scope.toaster.title, $scope.toaster.text);
            };

            $rootScope.clock = "loading clock...";
            $rootScope.tickInterval = 1000;

            var tick = function() {
                $rootScope.clock = Date.now()
                $timeout(tick, $rootScope.tickInterval);
            }

            $rootScope.convertDate = function(date) {
                return Date.parse(date);
            }

            $timeout(tick, $scope.tickInterval);

            $rootScope.logout = function() {
                authServices.logout();
            }

            $rootScope.getUserInfo = function() {
                webServices.get('getauthenticateduser').then(function(getData) {
                    if (getData.status == 200) {
                        $rootScope.user = $sessionStorage.user = getData.data;
                        localStorage.user = JSON.stringify($sessionStorage.user);
                        $state.go('app.dashboard');
                    } else {
                        $rootScope.logout();
                    }
                });
            }

            $rootScope.goback = function() {
                history.back();
            }
            
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                
                $rootScope.loading = true;
                $rootScope.currentState = toState.name;
                $rootScope.previousState = fromState.name;
                $rootScope.screenWidth = window.innerWidth * window.devicePixelRatio;
                $rootScope.screenHeight = window.innerHeight;
                if ($rootScope.noauthroutes.includes($rootScope.currentState)) {
                    if (authServices.isLoggedIn()) {
                        $rootScope.getUserInfo();
                        $timeout(function() {
                            $state.go('app.home');
                        }, 500);
                    }
                }else{
                    $rootScope.getUserInfo();
                    if (!authServices.isLoggedIn()) {
                        $timeout(function() {
                            $state.go('access.signin');
                        }, 500);
                    }
                }
                
            });

            $rootScope.$on("showErrors", function(event, errors)  {
                angular.forEach(errors, function(data, no) {
                    $scope.toaster = {type: 'error',title: 'Oops',text: data};
                    $scope.pop();
                });
            });

            $rootScope.$on("showSuccessMsg", function(event, msg)  {
                $scope.toaster = {type: 'success',title: 'Success',text: msg};
                $scope.pop();
            });

            $rootScope.$on("showErrorMsg", function(event, msg)  {
                $scope.toaster = {type: 'error',title: 'Oops',text: msg};
                $scope.pop();
            });

            $rootScope.setUserInfo = function(){
                if (authServices.isLoggedIn()) {
                    $rootScope.getUserInfo();
                } else {
                    authServices.logout();
                }
            }

            $rootScope.getUserInfo = function() {
                $rootScope.errors = [];
                webServices.get('getauthenticateduser').then(function(getData) {
                    console.log(getData)
                    if (getData.status == 200) {
                        $rootScope.user = $sessionStorage.user = getData.data;
                        localStorage.user = JSON.stringify($sessionStorage.user);
                    } else if (getData.status == 401) {
                        $rootScope.errors.push(getData.data.message);
                        $rootScope.$emit("showerrors", $rootScope.errors);
                        $rootScope.logout();
                    } else {
                        $rootScope.logout();
                    }
                });
            }

            $rootScope.$on("showISError", function(event, errors)  {
                $scope.toaster = {type: 'error',title: 'Oops',text: 'Some internal server error.. Please check...'};
                $scope.pop();
            });

            $rootScope.checkPermission= function()
            {
                if($rootScope.user.role == 2){
                    if(!$rootScope.subuserviews.includes($rootScope.stateurl)){
                        $state.go('app.404');
                    }
                }
            }

        }
    ]);