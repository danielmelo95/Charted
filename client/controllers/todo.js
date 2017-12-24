var myApp = angular.module('myApp');

myApp.controller('toDoListController', 
	['$scope', '$http', '$location', '$routeParams',
	function($scope, $http, $location, $routeParams){
		$scope.selectedScreen = null;
		$scope.selectedScreenIndex = null;
		$scope.views = [{
			id: 1,
			select: "all",
			tasks: [] 
		}, {
			id: 2,
			select: "completed",
			tasks: [] 
		}, {
			id: 3,
			select: "inprogress",
			tasks: [] 
		}, {
			id: 4,
			select: "removed",
			tasks: []
		}, {
			id: 5,
			select: "work",
			tasks: [] 
		}, {
			id: 6,
			select: "personal",
			tasks: [] 
		}, {
			id: 7,
			select: "school",
			tasks: [] 
		}, {
			id: 8,
			select: "watch later",
			tasks: [] 
		}];
		
		$scope.getAllTasks = function() {
			$http.get('/api/toDoList').then(function(response) {
				$scope.allTasks = response.data;
				var createdDates = {}, completedDates = {};				
				for (i = 0; i < $scope.allTasks.length; i++) {
					var taskCreatedDate = $scope.allTasks[i].create_date;
					taskDay = taskCreatedDate.slice(8, 10);
					taskMonth = taskCreatedDate.slice(5, 7) - 1;
					taskYear = taskCreatedDate.slice(0, 4);
					taskHourAndMinuteAndSecond = taskCreatedDate.slice(11, 19);

					createdDates[ taskDay + taskMonth + taskYear] = new Date(taskYear + "-" + taskMonth + "-" + taskDay );
					var taskCompletedDate = $scope.allTasks[i].completed_date;
					if (taskCompletedDate) {
						taskDay = taskCompletedDate.slice(8, 10);
						taskMonth = taskCompletedDate.slice(5, 7) - 1;
						taskYear = taskCompletedDate.slice(0, 4);
						completedDates[taskDay + taskMonth + taskYear] = new Date(taskYear + "-" + taskMonth + "-" + taskDay );
					}
					$scope.allTasks[i].create_date = taskDay + "." + taskMonth + "." + taskYear + " " + taskHourAndMinuteAndSecond;
				}
				$scope.calendarInit(createdDates, completedDates);

				for(i = $scope.allTasks.length - 1; i > 0; i--) {
					if($scope.views[0].select == "all") {
						$scope.views[0].tasks.push($scope.allTasks[i]);
					}
					if($scope.views[1].select == "completed") {
						if($scope.allTasks[i].state == "completed") {
							$scope.views[1].tasks.push($scope.allTasks[i]);
						}
					}
					if($scope.views[2].select == "inprogress") {
						if($scope.allTasks[i].state == "inprogress") {
							$scope.views[2].tasks.push($scope.allTasks[i]);
						}
					}
					if($scope.views[3].select == "removed") {
						if($scope.allTasks[i].state == "removed") {
							$scope.views[3].tasks.push($scope.allTasks[i]);
						}
					}
					if($scope.views[4].select == "work") {
						if($scope.allTasks[i].type == "work") {
							$scope.views[4].tasks.push($scope.allTasks[i]);
						}
					}
					if($scope.views[5].select == "personal") {
						if($scope.allTasks[i].type == "personal") {
							$scope.views[5].tasks.push($scope.allTasks[i]);
						}
					}
					if($scope.views[6].select == "school") {
						if($scope.allTasks[i].type == "school") {
							$scope.views[6].tasks.push($scope.allTasks[i]);
						}
					}
					if($scope.views[7].select == "watch later") {
						if($scope.allTasks[i].type == "watch later") {
							$scope.views[7].tasks.push($scope.allTasks[i]);
						}
					}
				}
				/*var selector = document.getElementById("selector");
						selector.options[1].selected = "selected";
						console.log(selector.options[1].selected);
						console.log(selector.options[1].selected);
					$scope.selectedScreenIndex = $scope.views[0].id;
						$scope.select();*/
					
					$scope.selectedScreenIndex = $scope.views[0];
						$scope.select();
					
						
			});
					
		}

		$scope.getTask = function(){
			var id = $routeParams.id;
			$http.get('api/toDoList/' + id).then(function(response){
				$scope.task = response.data;
			});
		}

		$scope.addTask = function() {
			$http.post('api/toDoList', $scope.newTask).then(function(response){
				//window.location.href = '#!/';
				window.location.reload();
			});
		}

		$scope.editTask = function(task){
			$http.put('api/toDoList/' + task._id, $scope.task).then(function(response){
				window.location.reload();								
			});
		}

		$scope.completeTask = function(id, task){
			if (task.state != "completed") {
				task.state = "completed";
				$http.put('api/toDoList/completed/' + task._id, task).then(function(response){
				});
			}
			else {
				task.state = "inprogress";				
				$http.put('api/toDoList/inprogress/' + task._id, task).then(function(response){
				});
			}
		}

		$scope.removeTask = function(id, task){
			if (task.state != "removed") {
				task.state = "removed";
				$http.put('api/toDoList/removed/' + task._id, task).then(function(response){
				});
			}
			else {
				task.state = "inprogress";				
				$http.put('api/toDoList/inprogress/' + task._id, task).then(function(response){
				});
			}
		}

		$scope.deletePermanentlyTask = function(id, task){
			$http.delete('api/toDoList/deleted/' + id).then(function(response){
				window.location.reload();				
			});
		}
		
		$scope.isLast = function(check) {
							console.log($scope.selectedScreenIndex);
			
			if(check == true){
				var li = document.getElementsByTagName("LI");
				var i;
				if (typeof $scope.allTasks != undefined){
					for (i = 7; i < li.length; i++) {		
						switch(li[i].children[1].children[1].innerHTML){
							case "work":
								li[i].classList.add("work");  
								li[i].children[1].classList.add("work-content");
								break;
							case "personal":
								li[i].classList.add("personal");  
								li[i].children[1].classList.add("personal-content");
								break;
							case "school":
								li[i].classList.add("school");  
								li[i].children[1].classList.add("school-content");
								break;
							case "watch later":
								li[i].classList.add("watchLater");  
								li[i].children[1].classList.add("watchLater-content");
								org_html = li[i].children[1].children[0].innerHTML;
								new_html = "<a href=" + $scope.allTasks[$scope.allTasks.length - i + 5].description + ">" + $scope.allTasks[$scope.allTasks.length - i + 5].description  + "</a>";
								li[i].children[1].children[0].innerHTML = new_html;
								break;
						}

						switch(li[i].children[1].children[2].innerHTML){
							case "completed":
								//li[i].classList.add("completed");  
								li[i].children[0].children[0].style.display = "inline"; 
								break;
							case "removed":
								// li[i].classList.add("removed"); 
								// li[i].children[1].classList.add("removed-content");
								li[i].children[0].children[1].style.display = "inline"; 							
								break;
							case "inprogress":
								li[i].children[0].children[2].style.display = "inline"; 							
								break;
						}

						if(li[i].children[1].children[4].innerHTML == "") {
							li[i].children[1].children[4].innerHTML = "not completed";
						}
						if (i >= 17) {
							li[i].style.display = "none";                
						}
					}
				}
			}

			// for pagination WIP
			$scope.selectedTasksLength = Math.ceil($scope.selectedItem.tasks.length / $scope.pageSize);
		};

		$scope.select = function() {
			console.log($scope.selectedScreenIndex)
			if ($scope.selectedScreenIndex == null) {
				$scope.selectedItem = [];
				$scope.currentPage = 0;
				$scope.selectedTasksLength = 1;
				return;
			}
			$scope.views.forEach(function(item){
				if (item.id == $scope.selectedScreenIndex.id){
					$scope.selectedItem = item;
					if ($scope.selectedItem.tasks.length == 0) {
						$scope.selectedTasksLength = 1;
					}
				}
				$scope.currentPage = 0;
			});
		}
		

		/*$scope.selector = function(a) {
			  
			var li = document.getElementsByTagName("LI");
			var selected_option = $('#selector option:selected');
			console.log(selected_option[0].value);
			var numberOfTasks = 0;
			for (i = 5; i < li.length; i++) {		
				console.log(li[i].children[1].children[2].innerHTML + "=="+ selected_option[0].value);
				if(li[i].children[1].children[2].innerHTML == selected_option[0].value) {
					numberOfTasks++;
					console.log("dicks");
				}
			}			
			console.log(numberOfTasks);
			setTimeout(function() {
    			$scope.$apply(function() {
					$scope.numberOfTasks = numberOfTasks;
				})
			  }, 1000);
		};*/

		$scope.url = "/def";
		
		$scope.editModalForm = function(taskId) {
			var li = document.getElementsByTagName("LI");
			var i;
    		for (i = 0; i < $scope.allTasks.length; i++) {
				if($scope.allTasks[i]._id == taskId) {
						$scope.url = i;
				}
			}		
		};

		$scope.calendarInit = function(createdDates, completedDates) {
			$("#dt").datepicker({
				beforeShowDay: function( date ) {
					var currentDate = date.getDate() + "" + date.getMonth() + "" + date.getFullYear();
					var highlightCreatedDates = createdDates[currentDate];
					var highlightCompletedDates = completedDates[currentDate]

					if (highlightCreatedDates && highlightCompletedDates) {
						return [true, "createdDate completedDate", 'Tooltip text'];
					} 
					else if (highlightCreatedDates) {
						return [true, "createdDate", 'Tooltip text'];
						
					}
					else if (highlightCompletedDates) {
						return [true, "completedDate", 'Tooltip text'];					
					}
					else {
						return [true, '', ''];
					}
				},

				onSelect: function(dateText, inst) {
					var date = $(this).val();
					var time = $('#time').val();
					var month = date.slice(0, 2);
					var day = date.slice(3, 5);
					var year = date.slice(6, 10);        
					var li = document.getElementsByTagName("LI");
					var i;

					for (i = 7; i < li.length; i++) {
						var taskDate = li[i].children[1].children[3].innerHTML;
						taskDay = taskDate.slice(8, 10);
						taskMonth = taskDate.slice(5, 7);
						taskYear = taskDate.slice(0, 4);
						if (day == taskDay && month == taskMonth && year == taskYear) {
							li[i].style.display = "block";
						}
						else {
							li[i].style.display = "none";                
						}
					}
				}    
			});
		}

		/*$scope.selectorChange = function() {
			var li = document.getElementsByTagName("LI");
   	 		var j = 6;
			for(i = $scope.allTasks.length - 1; i > 0; i--) {
				if ($scope.item == "inprogress") {
					if($scope.allTasks[i].state == "inprogress") {
						console.log($scope.allTasks[i].title);
						li[j++].children[0].children[2].innerHTML = $scope.allTasks[i].title;
						li[j++].children[1].children[2].innerHTML = $scope.allTasks[i].title;
						
					}
				}
			}
		}*/

	// for pagination WIP
	$scope.currentPage = 0;
	$scope.pageSize = 10;

	}]);

// for pagination WIP
myApp.filter('startFrom', function() {
    return function(input, start) {
		start = +start; //parse to int
		if (typeof input == "undefined") {
			return;
		}
        return input.slice(start);
    }
});
