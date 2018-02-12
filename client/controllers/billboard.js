var myApp = angular.module('myApp');

myApp.controller('billboardController', 
	['$scope', '$http', '$location', '$routeParams',
	function($scope, $http, $location, $routeParams){
		$scope.getAllSongs = function() {
			$http.get('/api/billboards').then(function(response) {
				$scope.allSongs = response.data.slice().reverse();
				console.log($scope.allSongs);
				$scope.playlist = "https://www.youtube.com/watch_videos?video_ids=";
				
				for(i = 0; i < $scope.allSongs.length; i++) {
					$scope.playlist += $scope.allSongs[i].url + ",";
				}
				console.log($scope.playlist);
			});
		}
	}]);
