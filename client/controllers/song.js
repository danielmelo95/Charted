var myApp = angular.module('myApp');

myApp.controller('songController', 
	['$scope', '$http', '$location', '$routeParams',
	function($scope, $http, $location, $routeParams){
		$scope.getAllSongs = function() {
			$http.get('/api/Song').then(function(response) {
				$scope.allSongs = response.data;
				console.log($scope.allSongs);
			});
		}

		$scope.getSong = function(){
			var id = $routeParams.id;
			$http.get('api/Song/' + id).then(function(response){
				$scope.song = response.data;
			});
		}

		$scope.addSong = function() {
			$http.post('api/Song', $scope.newSong).then(function(response){
				//window.location.href = '#!/';
				window.location.reload();
			});
		}

		$scope.editSong = function(song){
			$http.put('api/Song/' + song._id, $scope.song).then(function(response){
				//window.location.reload();								
			});
		}

		$scope.deletePermanentlySong = function(id, song){
			$http.delete('api/Song/deleted/' + id).then(function(response){
				window.location.reload();				
			});
		}

	}]);
