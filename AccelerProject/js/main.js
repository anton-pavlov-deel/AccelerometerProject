var X_data = [
		{
			label: 'Actual X',
			data: []
		},
		{
			label: 'Record X',
			data: []
		}
];

var Y_data = [
		{
			label: 'Actual Y',
			data: []
		},
		{
			label: 'Record Y',
			data: []
		}
];

var Z_data = [
		{
			label: 'Actual Z',
			data: []
		},
		{
			label: 'Record Z',
			data: []
		}
];

var X_store = [[]];
var Y_store = [[]];
var Z_store = [[]];
var X_record = [[]];
var Y_record = [[]];
var Z_record = [[]];
var options = {xaxis : {min : -15, max : 15}, yaxis : {max : 20, min : -20}};
var time = 0;
var deltaTime = 0.1;
var record = false;
var showRecord = false;
var recordPointer = 0;

//$("#mainWindow").css("width", window.outerWdth);
//$("#mainWindow").css("height", window.outerHeight);

var p = $.plot($("#placeholderX"), X_data, options);
var p = $.plot($("#placeholderY"), Y_data, options);
var p = $.plot($("#placeholderZ"), Z_data, options);

// Linear Acceleration initialization
if (tizen.systeminfo.getCapability("http://tizen.org/feature/sensor.proximity")) alert("Proximity enable");
else alert("no");
if (tizen.systeminfo.getCapability("http://tizen.org/feature/sensor.gravity")) alert("Gravity enable");
else alert("no");
if (tizen.systeminfo.getCapability("http://tizen.org/feature/sensor.accelerometer")) alert("Accelerometer enable");
else alert("no");
var sensorList = tizen.sensorservice.getAvailableSensors();
for (var i in sensorList) {console.log(sensorList[i]);}
var linearAcc = tizen.sensorservice.getDefaultSensor(sensorList[0]);
linearAcc.getSensorHardwareInfo(hwInfoCB, function(){});
linearAcc.start(onsuccessCB, onerrorCB);

function hwInfoCB(hwInfo) {
	console.log('name: ' + hwInfo.name);
    console.log('type: ' + hwInfo.type);
    console.log('vendor: ' + hwInfo.vendor);
    console.log('minValue: ' + hwInfo.minValue);
    console.log('maxValue: ' + hwInfo.maxValue);
    console.log('resolution: ' + hwInfo.resolution);
    console.log('minInterval: ' + hwInfo.minInterval);
    console.log('maxBatchCount: ' + hwInfo.maxBatchCount);
}

function onerrorCB () {
	console.log("Gravity sensor raise ERROR");
}

function onsuccessCB () {
	console.log("Gravity sensor succesfully loaded!");
	linearAcc.setChangeListener(function(sensorData) {
		var x = -sensorData.x;
		var y = -sensorData.y;
		var z = sensorData.z;
		
		X_data[0].data.push([time, x]);
		Y_data[0].data.push([time, y]);
		Z_data[0].data.push([time, z]);
		
		if (record) {
			X_store[0].push([time, x]);
			Y_store[0].push([time, y]);
			Z_store[0].push([time, z]);
		}
		
		if (showRecord) {
			if (recordPointer == X_record[0].length) {
				recordPointer = 0;
				showRecord = false;
			} else {
				X_data[1].data.push(X_record[0][recordPointer]);
				Y_data[1].data.push(Y_record[0][recordPointer]);
				Z_data[1].data.push(Z_record[0][recordPointer]);
				recordPointer += 1;
			}
		}
		
		if (X_data[0].data.length > 70) {
			X_data[0].data.shift();
			Y_data[0].data.shift();
			Z_data[0].data.shift();
			if (X_data[1].length) {
				X_data[1].data.shift();
				Y_data[1].data.shift();
				Z_data[1].data.shift();
			}
		}
		
		options = {
			xaxis : {
				min : -8 + time, 
				max : 8 + time
			}, 
			yaxis : {
				min : -15, 
				max : 15
			}
		};
		
		time += deltaTime;
		var p = $.plot($("#placeholderX"), X_data, options);
		var p = $.plot($("#placeholderY"), Y_data, options);
		var p = $.plot($("#placeholderZ"), Z_data, options);
	}, deltaTime*1000, 0);
}

$("#recordButton").click(function(){
	if ($("#recordButton").val() == "Start") {
		time = 0;
		X_data[0].data = [];
		Y_data[0].data = [];
		Z_data[0].data = [];
		record = true;
		showRecord = false;
		$("#showButton").prop("disabled", true);
		$("#recordButton").attr("value", "Stop");
	} else {
		time = 0;
		X_data[0].data = [];
		Y_data[0].data = [];
		Z_data[0].data = [];
		X_record = X_store;
		Y_record = Y_store;
		Z_record = Z_store;
		X_store = [[]];
		Y_store = [[]];
		Z_store = [[]];
		record = false;
		$("#saveButton").prop("disabled", false);
		$("#showButton").prop("disabled", false);
		$("#recordButton").attr("value", "Start");
	}
});

$("#showButton").click(function(){
	time = 0;
	X_data[0].data = [];
	Y_data[0].data = [];
	Z_data[0].data = [];
	X_data[1].data = [];
	Y_data[1].data = [];
	Z_data[1].data = [];
	recordPointer = 0;
	showRecord = true;
});

$("#loadButton").click(function(){
	var xhr = new XMLHttpRequest();

	var name = prompt("Enter a name of record", "");
	
	var params = 'name=' + encodeURIComponent(name);

	xhr.open("GET", 'http:/localhost:3000/api/record/submit?' + params, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 500) {
			alert("Not found with this name: " + name);
		} else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            alert(xhr.responseText);
        } else {
        	alert("UNKNOWN ERROR");
        }
    };

	xhr.send();
});

$("#saveButton").click(function(){
	var xhr = new XMLHttpRequest();

	var name = prompt("Enter a name:", "");
	var description = prompt("Enter a description:", "");
	
	var params = 'name=' + encodeURIComponent(name) +
	  '&X_data=' + encodeURIComponent(JSON.stringify(X_record)) +
	  '&Y_data=' + encodeURIComponent(JSON.stringify(X_record)) +
	  '&Z_data=' + encodeURIComponent(JSON.stringify(X_record)) +
	  '&description=' + encodeURIComponent(description);
	  

	xhr.open("POST", 'http:/localhost:3000/api/record/submit?' + params, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log(xhr.responseText);
        };
    };

	xhr.send();
});