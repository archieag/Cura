angular.module('starter.controllers', ['ngCordova','nvd3'])

.controller('DashCtrl', function($scope, $ionicPlatform, $ionicModal, $cordovaVibration) {
  $scope.alarmInterval = undefined;

  $ionicModal.fromTemplateUrl('contact-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
}).then(function(modal) {
    $scope.modal = modal
})  


$scope.openModal = function() {
    $scope.modal.show()
}

$scope.closeModal = function() {
    $scope.modal.hide();
};

$scope.$on('$destroy', function() {
    $scope.modal.remove();
});

$scope.doAlarm = function(){
  $scope.alarmInterval = setInterval(function(){ 
    $cordovaVibration.vibrate(100) 
}, 1000);

  $scope.openModal();
}

$scope.stopAlarm = function(){
    $scope.closeModal();
    clearInterval($scope.alarmInterval);
}
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
}
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('FriendsCtrl', function($scope, $cordovaContacts, Friends) {
  $scope.friends = Friends.all();
  $scope.addContact = function(){
    $cordovaContacts.pickContact().then(function (contact){
      alert(JSON.stringify(contact))      
      $scope.friends.push(contact);
  })
}
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('VisualCtrl', function($scope, $stateParams, Visuals) {
  $scope.visuals = [{values:Visuals.all(), key:'Test Wave', color: '#ff7f0e'}];
  $scope.vOption = {
    chart: {
        type: 'lineChart',
        height: 450,
        margin : {
            top: 20,
            right: 20,
            bottom: 40,
            left: 55
        },
        x: function(d){ return d.x; },
        y: function(d){ return d.y; },
        useInteractiveGuideline: true,
        dispatch: {
            stateChange: function(e){ console.log("stateChange"); },
            changeState: function(e){ console.log("changeState"); },
            tooltipShow: function(e){ console.log("tooltipShow"); },
            tooltipHide: function(e){ console.log("tooltipHide"); }
        },
        xAxis: {
            axisLabel: 'Time (ms)'
        },
        yAxis: {
            axisLabel: 'Voltage (v)',
            tickFormat: function(d){
                return d3.format('.02f')(d);
            },
            axisLabelDistance: 30
        },
        callback: function(chart){
            console.log("!!! lineChart callback !!!");
        }
    },
    title: {
        enable: true,
        text: 'Line Chart Sample 1'
    },
    subtitle: {
        enable: true,
        text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
        css: {
            'text-align': 'center',
            'margin': '10px 13px 0px 7px'
        }
    },
    caption: {
        enable: true,
        html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>',
        css: {
            'text-align': 'justify',
            'margin': '10px 13px 0px 7px'
        }
    }
};
})

.controller('MedicationsCtrl', function($scope, $stateParams, $ionicModal, $cordovaLocalNotification, Medications){
  $scope.medications = Medications.all();

  $ionicModal.fromTemplateUrl('templates/medication-add-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
}).then(function(modal) {
    $scope.modal = modal
})  

$scope.newMedication = {};


$scope.openModal = function() {
    $scope.modal.show()
}

$scope.closeModal = function() {
    $scope.modal.hide();
};

$scope.$on('$destroy', function() {
    $scope.modal.remove();
});

$scope.update = function(newMedication) {

    var newId = $scope.medications.length;
    var newMed = angular.copy(newMedication);
    newMed.id = newId;
    $scope.medications.push(newMed);
    $scope.closeModal()

    console.log($scope.medications)


    var alarmTime = new Date();
    alarmTime.setSeconds(alarmTime.getSeconds() + 15);
    Medications.sync($scope.medications);
    console.log(Medications.all())
    // $cordovaLocalNotification.add({
    //     id: "1234",
    //     date: alarmTime,
    //     message: "This is a message",
    //     title: "This is a title",
    //     autoCancel: true,
    //     sound: null
    // }).then(function () {
    //     alert("The notification has been set");
    // });




};

$scope.reset = function() {
    $scope.user = angular.copy({});
};




})

.controller('MedicationDetailCtrl', function($scope, $stateParams, Medications) {

  $scope.medication = {};
  console.log("DETAIL CTRL");
  $scope.medication = Medications.get($stateParams.medicationId);
  console.log(Medications.all())
})

.controller('HomeCtrl', function($scope, $http, $timeout) {
    var url = "http://128.2.83.208:8001/api/v1/homeautomation/ha_user/";
    $scope.switches = [];
    $scope.thermostat;

    $http.get(url).success(function(devices){
        for (id in devices){
            var device = devices[id];
            if (device.signal_type === "switch"){
                $scope.switches.push({ name: device.tag_id, isOn: device.required_value === "1" ? true : false});
            } else if (device.signal_type === "thermo"){
                var temp = parseInt(device.required_value, 16)/2;
                $scope.thermostat = {name: device.tag_id, temp: temp, isHeating: device.mode === "hot" ? true : false};
            }
        }
    });

    // Temp String Format
    $scope.tempMode = function(){
        if($scope.thermostat){
            return $scope.thermostat.isHeating?"Heating":"Cooling";
        }
        return "";
    }
    $scope.switchToggle = function(switchData){
/*        console.log(JSON.stringify({
            user_name: "ha_user",
            tag_id: switchData.name,
            signal_type: "switch",
            required_value: "1",
            current_value: "0",
            mode:null
        }));*/
        $http.put(url, {
            user_name:"ha_user",
            tag_id:switchData.name,
            signal_type:"switch",
            current_value:"0",
            required_value: switchData.isOn ? "1": "0",
            mode:"null"
        });
    }

    $scope.thermoModeChange = function(){
        var temp  = $scope.thermostat.temp*2;

        $http.put(url, {
            user_name:"ha_user",
            tag_id:$scope.thermostat.name,
            signal_type:"thermo",
            current_value:"0",
            required_value: temp.toString(16),
            mode: $scope.thermostat.isHeating ? "hot": "cold",
        });
    }

    var timeoutId = null;
    $scope.thermoTempChange = function(){
        if(timeoutId !== null) {
            return;
        }
        timeoutId = $timeout( function() {
            $timeout.cancel(timeoutId);
            timeoutId = null;
            var temp  = $scope.thermostat.temp*2;
            $http.put(url, {
                user_name:"ha_user",
                tag_id:$scope.thermostat.name,
                signal_type:"thermo",
                current_value:"0",
                required_value: temp.toString(16),
                mode: $scope.thermostat.isHeating ? "hot": "cold",
            });
        }, 2000); 

    }
});
