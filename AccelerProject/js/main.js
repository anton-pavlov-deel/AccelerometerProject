var X_data = [[]];
var Y_data = [[]];
var Z_data = [[]];
var options = {xaxis : {min : -15, max : 15}, yaxis : {max : 20, min : -20}};
var time = 0;
var deltaTime = 0.1;
var p = $.plot($("#placeholderX"), X_data, options);
var p = $.plot($("#placeholderY"), Y_data, options);
var p = $.plot($("#placeholderZ"), Z_data, options);

var sensorList = tizen.sensorservice.getAvailableSensors();
for (var i in sensorList) console.log(sensorList[i]);
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
		
		X_data[0].push([time, x]);
		Y_data[0].push([time, y]);
		Z_data[0].push([time, z]);
		if (X_data[0].length > 81) {
			X_data[0].shift();
			Y_data[0].shift();
			Z_data[0].shift();
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