var myApp = angular.module('myApp');

myApp.controller('billboardController', 
	['$scope', '$http', '$location', '$routeParams',
	function($scope, $http, $location, $routeParams){
		$scope.getAllSongs = function() {
			$http.get('/api/billboards').then(function(response) {
				$scope.allSongs = response.data;
				console.log($scope.allSongs);
			});
		}
	}]);
