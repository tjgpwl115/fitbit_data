var url = window.location.href;
//getting the access token from url
var access_token = url.split("#")[1].split("=")[1].split("&")[0];
// get the userid
var userId = url.split("#")[1].split("=")[2].split("&")[0];

var heart_value = new Array();
var heart_time = new Array();
var step_value = new Array();
var step_time = new Array();
var calories_value = new Array();

var xhr = new XMLHttpRequest();
var xhr1 = new XMLHttpRequest();
var xhr2 = new XMLHttpRequest();
var xhr3 = new XMLHttpRequest();

var j;
var database = firebase.database();
var ref = database.ref('Fitbit');
var d = new Date();
var currentdate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
var currentTime = d.getHours() + ":00";


$(document).ready(function() {
  $('button#input_date').click(function() {
    var day = $('input#day').val();

    // 활동 데이터 파일
    xhr.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/date/' + day + '.json');
    //xhr.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/steps/date/2019-11-05/1d.json');
    //xhr1.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/calories/date/2019-11-05/2019-11-05.json');
    xhr.setRequestHeader("Authorization", 'Bearer ' + access_token);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var json = xhr.responseText;
        obj = JSON.parse(json);
        var str = "칼로리 소모량 : " + obj["summary"]["caloriesOut"] + "kcal</br>";
        str += "걸음수 : " + obj["summary"]["steps"] + "걸음</br>";
        str += "이동거리 : " + obj["summary"]["distances"][0]["distance"] + "km</br>";
        str += "평균심박수 : " + obj["summary"]["restingHeartRate"] + "bpm</br>";
        document.getElementById("activities").innerHTML = str;

        ref.child(currentdate).child("서혜지").child("활동량").child(currentTime)
          .set({
            calories: obj["summary"]["caloriesOut"],
            distance: obj["summary"]["distances"][0]["distance"],
            steps: obj["summary"]["steps"],
            heartrate: obj["summary"]["restingHeartRate"]
          });
      }
    };

    xhr.send();

    // 걸음수 데이터 파일
    xhr2.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/steps/date/' + day + '/1w.json');
    xhr2.setRequestHeader("Authorization", 'Bearer ' + access_token);
    xhr2.onload = function() {
      if (xhr2.status === 200) {
        var json2 = xhr2.responseText;
        console.log("걸음" + json2);
        obj2 = JSON.parse(json2);
        StepsFunction(obj2["activities-steps"]);

      }
    }
    xhr2.send();

    xhr3.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/calories/date/' + day + '/1w.json');
    xhr3.setRequestHeader("Authorization", 'Bearer ' + access_token);
    xhr3.onload = function() {
      if (xhr3.status === 200) {
        var json3 = xhr3.responseText;
        obj3 = JSON.parse(json3);
        StepsFunction(obj3["activities-calories"]);
      }
    }
    xhr3.send();


    $('button#input_time').click(function() {
      var s_time = $('input#start_time').val();
      var e_time = $('input#end_time').val();
      // 심박수 데이터 파일
      xhr1.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/heart/date/' + day + '/1d/1min/time/' + s_time + '/' + e_time + '.json');
      xhr1.setRequestHeader("Authorization", 'Bearer ' + access_token);
      xhr1.onload = function() {
        if (xhr1.status === 200) {
          var json1 = xhr1.responseText;
          console.log(json1);
          obj1 = JSON.parse(json1);
          HeartFunction(obj1["activities-heart-intraday"]["dataset"]);
        }
      }
      xhr1.send();
    });
  });
});

// 심박수 데이터 파

//함수
function HeartFunction(arr) {
  var out = "";
  var i;
  for (i = 0; i < arr.length - 1; i++) {
    heart_value[i] = obj1["activities-heart-intraday"]["dataset"][i]["value"];
    heart_time[i] = obj1["activities-heart-intraday"]["dataset"][i]["time"];

    var time = obj1["activities-heart-intraday"]["dataset"][i]["time"];
    ref.child(currentdate).child("서혜지").child("심박수").child(time).set({
      heartrate: obj1["activities-heart-intraday"]["dataset"][i]["value"]
    });

  }

  var jsonObject = {
    data: {
      'heartrate': heart_value
    },
    keys: heart_time
  }

  console.log(jsonObject.keys);

  var chart = c3.generate({
    bindto: "#chart",
    data: {
      json: jsonObject.data
    },
    axis: {
      x: {
        type: 'category',
        categories: jsonObject.keys
      }
    }
  });
}


function StepsFunction(arr) {
  var out = "";
  var j;
  for (j = 0; j < arr.length; j++) {
    step_value[j] = obj2["activities-steps"][j]["value"];
    step_time[j] = obj2["activities-steps"][j]["dateTime"];
    calories_value[j] = obj3["activities-calories"][j]["value"];
  }

  var jsonObject1 = {
    data: {
      'steps': step_value,
      'calories': calories_value
    },
    keys: step_time
  }

  console.log(jsonObject1.keys);

  var chart1 = c3.generate({
    bindto: "#chart1",
    data: {
      json: jsonObject1.data,
      type: 'bar'
    },
    axis: {
      x: {
        type: 'category',
        categories: jsonObject1.keys
      }
    }
  });
}
