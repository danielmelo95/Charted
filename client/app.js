var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider){
	$routeProvider.when("/billboard", {
		controller: "billboardController",
		templateUrl: "views/overview-billboard.html",
	})
	.when("/officialcharts", {
		controller: "officialchartsController",
		templateUrl: "views/overview-officialcharts.html",
	})
	.when("/intro", {
		controller: "introController",
		templateUrl: "views/intro.html",
	})
	.when("/", {
		controller: "introController",
		templateUrl: "views/intro.html",
	})
});
