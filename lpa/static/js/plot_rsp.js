function plot_rsp(filename){

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //document.getElementById("demo").innerHTML = this.responseText;
      var file = this.responseText;

      var coeffs_arr = [];
      var coeffs = file.split('\n');

      var aux;
      for(i = 0; i < coeffs.length; i++){
        coeffs_arr[i] = coeffs[i].split(' ');
      }
      var Y = [];
      var X = [];
      // Compute the Y from samples of x, for each channel r,g,b;
      for(K = 0; K < coeffs.length; K++){
        Y[K] = [];
        X[K] = [];
        var n = parseInt(coeffs_arr[K][0]);
        var y = 0.0;
        for(x = 0, k = 0; x <= 1; x+=0.01, k++){
          for(i = 1; i <= (n+1); i++){
             y = y + parseFloat(coeffs_arr[K][i])*Math.pow(x, (n+1-i));
          }
          X[K][k] = x;
          Y[K][k] = y;
        }

        //Normalize the result to stay between 0 and 1;
        var y_min = Math.min(...Y[K]);
        var y_max = Math.max(...Y[K]);

        for(i = 0; i < Y[K].length; i++){
          Y[K][i] = (Y[K][i] - y_min) / (y_max - y_min);
        }

      }
        //document.getElementById("demo").innerHTML = coeffs_arr[0];

        var d3 = Plotly.d3;
        var WIDTH_IN_PERCENT_OF_PARENT = 100, HEIGHT_IN_PERCENT_OF_PARENT = 100;
        var gd3 = d3.select("div[id='curve']")
          .style({
          width: WIDTH_IN_PERCENT_OF_PARENT + '%',
          'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',
          height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
          'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
        });

        var curve = gd3.node();

        //Draw curve using plotly.js
        var trace1 = {
          x: X[0],
          y: Y[0],
          name: 'Red',
          mode: 'lines',
          line: {
            color: 'rgb(255, 0, 0)'
          }
        };

        var trace2 = {
          x: X[1],
          y: Y[1],
          name: 'Green',
          mode: 'lines',
          line: {
            color: 'rgb(0, 255, 0)'
          }
        };

        var trace3 = {
          x: X[2],
          y: Y[2],
          name: 'Blue',
          mode: 'lines',
          line: {
            color: 'rgb(0, 0, 255)'
          }
        };

      var data = [ trace1, trace2, trace3 ];

      var layout = {
        title:'Response Curve',
        xaxis: {
          range: [0, 1],
          autorange: false
        }/*,
        yaxis: {
          range: [0, 1],
          autorange: false
        } */
      };

      //Plotly.newPlot('curve', data, layout);
      Plotly.plot(curve, data, layout);

      window.onresize = function() {
        Plotly.Plots.resize(curve);
      };

    }
  };
  xhttp.open("GET", filename, true);
  xhttp.send();

}
