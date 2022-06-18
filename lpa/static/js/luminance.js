var luminance_arr = [];

function load_luminance(filename){

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", filename, true);
  xhttp.send();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //document.getElementById("demo").innerHTML = this.responseText;
      var file = this.responseText;
      luminance_arr = file.split('\n');

    };
  };
}

function arrayMax(arr) {
  var len = arr.length;
  var max = +Infinity;
  var idx =0;
  while (len--) {
    if (parseFloat(arr[len]) < max) {
      max = parseFloat(arr[len]);
      idx = len;
    }
  }
  return [max, idx];
};



function getLumi(x, y, max_y, max_x ){
  console.log(arrayMax(luminance_arr).toString());
  var indx = y*max_x + x; // ((max_y-1)-y)*(max_x) + x;
  console.log(indx.toString());

  return luminance_arr[indx+1];
  //return luminance_arr[ y*(max_x) + x ];
  //return (max_y-1-y)*(max_x) + x;
}
