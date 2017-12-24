var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider){
	$routeProvider.when("/billboard", {
		controller: "songController",
		templateUrl: "views/overview-billboard.html",
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
