function plot_heatmap(filename){

    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", filename, true);
    xhttp.send(); 
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            //document.getElementById("demo").innerHTML = this.responseText;
            var data = this.responseText;

            var values = data.split('\n');
            

            var header = values[0].replace(/\s+/g, " ").split(" ");
            console.log(header)
            var height = parseInt(header[1])
            var width = parseInt(header[3])
        
            console.log(width, height)
        
            var min = Infinity, max = -Infinity;
            
            var min_x, min_y;
            var max_x, max_y;
        
            var matrix = [];
            var log_matrix = [];
            for(i = 0; i < height; i++){
                matrix[i] = [];
                log_matrix[i] = [];
                for(j = 0; j < width; j++){
                    var indx =  ((height-1)-i)*(width) + j;
                    matrix[i][j] = parseFloat(values[indx+1])
                    log_matrix[i][j] = Math.log10(matrix[i][j]+1)
                    
                    if (matrix[i][j] > max){
                        max = matrix[i][j]
                        max_x = j
                        max_y = i
                    }
                    if (matrix[i][j] < min){
                        min = matrix[i][j]
                        min_x = j
                        min_y = i
                    }
        
                }
            }
            
        
            var n_ticks = 5;
        
            var tick_vals = [];
            var tick_text = [];
            var log_interval = (log_matrix[max_y][max_x] - log_matrix[min_y][min_x]) / n_ticks
            for(i = 0; i<(n_ticks+1); i++){
                tick_vals[i] = log_matrix[min_y][min_x] + log_interval*i 
                tick_text[i] = Math.pow(10,tick_vals[i]).toFixed(1)
                
                //console.log(tick_text[i], tick_vals[i])
            }
        
            var tick_vals_linear = [];
            var tick_text_linear = [];
            var interval = (matrix[max_y][max_x] - matrix[min_y][min_x]) / n_ticks
            for(i = 0; i<(n_ticks+1); i++){
                tick_vals_linear[i] = matrix[min_y][min_x] + interval*i 
                tick_text_linear[i] = (tick_vals_linear[i]).toFixed(1)
                
                //console.log(tick_text[i], tick_vals[i])
            }
        
            // Plot 
            var data = [
                {
                    z: log_matrix,
                    text: matrix,
                    type: 'heatmap',
                    hovertemplate: "%{text:.2f} cd/&#13217;<br>(x: %{x}, y: %{y})<extra></extra>",
                    showscale: true,
                    ncontours: 5,
                    colorbar:{
                            title: {
                                text: '&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;<b>(cd/&#13217;)</b>',
                                font: {
                                    family: 'Arial, Helvetica, sans-serif',
                                    size: 16,
                                    color: '#000000'
                                },
                                side: "bottom"
                                
                            },
                            y: 0.45,
                            x: 1.02,
                            xpad:0,
                            ypad:0,
                            tickvals: tick_vals,
                            ticktext: tick_text,
                            ticks: 'inside',
                            tickformat: ".1f",
                            tickfont:{
                                family: 'Courier New, monospace',
                                size: 16,
                                color: '#000000'
                            }
                        }
                    
                    
                }
            ];
        
            var button_layer_1_height = 1.2
            var button_layer_2_height = 0
            var annotation_offset = 0.1
        
        
            a_y_min = -30
            a_y_max = -30
            a_x_min = 5
            a_x_max = 5
        
            if (min_y > (height - 200)) {
                a_y_min = -1*a_y_min
            }
        
            if (min_x < 200 ) {
                a_x_min = -1*a_x_min
            }   
            if (max_y > (height - 200)) {
                a_y_max = -1*a_y_max
            }
            if (max_x < 200 ) {
                a_x_max = -1*a_x_max
            }   
        
            var extreme_annotations = [{
                x: min_x,
                y: min_y,
                xref: 'x',
                yref: 'y',
                text: "<b>" + min.toFixed(2) + "</b>",
                showarrow: true,
                font: {
                  family: 'Courier New, monospace',
                  size: 16,
                  color: '#ffffff',
                },
                align: 'center',
                arrowhead: 1,
                arrowsize: 2,
                arrowwidth: 1,
                arrowcolor: '#000000',
                ax: a_x_min,
                ay: a_y_min,
                //bordercolor: '#c7c7c7',
                //borderwidth: 2,
                //borderpad: 0,
                bgcolor: '#000000',
                //opacity: 0.8
              },
              {
                x: max_x,
                y: max_y,
                xref: 'x',
                yref: 'y',
                text: "<b>" + max.toFixed(2) + "</b>",
                showarrow: true,
                font: {
                  family: 'Courier New, monospace',
                  size: 16,
                  color: '#ffffff'
                },
                align: 'center',
                arrowhead: 1,
                arrowsize: 2,
                arrowwidth: 1,
                arrowcolor: '#000000',
                ax: a_x_max,
                ay: a_y_max,
                // bordercolor: '#c7c7c7',
                // borderwidth: 1,
                borderpad: 0,
                bgcolor: '#000000',
                //opacity: 0.8
              }]
        
            var layout = {
                //autosize: true,
                width: width,
                height: height,
                margin:{l:20, r:20, t:20, b:20, autoexpand:true},
                xaxis: {
                    visible:false,
                    constrain: 'domain'
                }, 
                yaxis: {
                    visible:false,
                    constrain: 'domain',
                    scaleanchor: 'x'
                },
                annotations: [],
                updatemenus: [
                    // log/linear Scale 
                    {
                        direction: 'down',
                        pad: {'r': 10, 't': 10},
                        showactive: true,
                        type: 'dropdown',
                        x: 1.02,
                        xanchor: 'left',
                        y: button_layer_1_height,
                        yanchor: 'top',
                        active: 1,
                        bgcolor: '#aaaaaa',
                        bordercolor: '#FFFFFF',
                        buttons: [
                            {
                                args: [{'z': [matrix], 
                                'colorbar.tickvals': [tick_vals_linear], 
                                'colorbar.ticktext': [tick_text_linear]}],
                                label: 'Linear',
                                method: 'restyle'
                            },
                            {
                                args: [{'z': [log_matrix], 
                                'colorbar.tickvals': [tick_vals], 
                                'colorbar.ticktext': [tick_text]}],
                                label: 'Logarithmic',
                                method: 'restyle'
                            }
                        ]
                    },
                    // Anotations       
                    {
                        direction: 'down',
                        pad: {'r': 10, 't': 10},
                        showactive: true,
                        type: 'dropdown',
                        x: 1,
                        xanchor: 'right',
                        y: button_layer_1_height,
                        yanchor: 'top',
                        active: 1,
                        bgcolor: '#aaaaaa',
                        bordercolor: '#FFFFFF',
                        buttons: [{
                            method: 'relayout',
                            args: [{'annotations': extreme_annotations.slice(0,2)}],
                            label: 'Show extreme points'
                        },{
                            method: 'relayout',
                            args: [{'annotations': []}],
                            label: 'Clean annotations'
                        }]   
                    },
                    // Color maps
                    {
                        direction: 'right',
                        pad: {'r': 10, 't': 10},
                        showactive: true,
                        type: 'dropdown',
                        x: 0.1,
                        xanchor: 'left',
                        y: button_layer_2_height,
                        yanchor: 'top',
                        active: 0,
                        bgcolor: '#aaaaaa',
                        bordercolor: '#FFFFFF',
                        buttons: [{
                            method: 'restyle',
                            args: ['colorscale', 'RdBu'],
                            label: 'RedBlue'
                        },{
                            method: 'restyle',
                            args: ['colorscale', 'Jet'],
                            label: 'Jet'
                        }, {
                            method: 'restyle',
                            args: ['colorscale', 'Hot'],
                            label: 'Hot'
                        }, {
                            method: 'restyle',
                            args: ['colorscale', 'Earth'],
                            label: 'Earth'
                        },            {
                            args: ['colorscale', 'Viridis'],
                            label: 'Viridis',
                            method: 'restyle'
                        },
                        {
                            args: ['colorscale', 'Electric'],
                            label:'Electric',
                            method:'restyle'
                        },
                        {
                            args: ['colorscale', 'Portland'],
                            label:'Portland',
                            method:'restyle'
                        },
                        {
                            args: ['colorscale', 'Rainbow'],
                            label:'Rainbow',
                            method:'restyle'
                        },
                        {
                            args: ['colorscale', 'Blackbody'],
                            label:'Blackbody',
                            method:'restyle'
                        },
            
                        {
                            args: ['colorscale', 'Cividis'],
                            label:'Cividis',
                            method:'restyle'
                        }
                    ]
                    },
                    // Type
                    {
                        direction: 'down',
                        pad: {'r': 10, 't': 10},
                        showactive: true,
                        type: 'dropdown',
                        x: 0.1,
                        xanchor: 'left',
                        y: button_layer_1_height,
                        showactive: true,
                        bgcolor: '#aaaaaa',
                        bordercolor: '#FFFFFF',
                        yanchor: 'top',
                        buttons: [
                            {
                                args: ['type', 'heatmap'],
                                label:'Heatmap',
                                method:'restyle'
                            },
                            {
                                args: ['type', 'contour'],
                                label:'Contour',
                                method:'restyle'
                            }
                        ],
                        
                    }
                ]
        
              };
        
           
            var myPlot = document.getElementById('heatmap');
              
            var config = {responsive: true}
            Plotly.newPlot('heatmap', data, layout, config)
        
             // Add click event annotation
            myPlot.on('plotly_click', function(data){
                var pts = '';
                var a_x = -30, a_y = -30;
                for(var i=0; i < data.points.length; i++){
                    annotate_text = data.points[i].text
            
                    
                    if (data.points[i].y > (height - 100)) {
                        a_y = -1*a_y
                    }
                    if (data.points[i].x < 100 ) {
                        a_x = -1*a_x
                    }      
        
                    annotation = {
                      text: annotate_text,
                      font: {
                        family: 'Arial',
                        size: 14,
                        color: '#ffffff'
                      },
                      x: data.points[i].x,
                      y: parseFloat(data.points[i].y.toPrecision(4)),
                      ax: a_x,
                      ay: a_y,
                      arrowcolor: '#000000',
                      bgcolor: '#000000',
                      //opacity: 0.8
                    }
        
                    annotations = myPlot.layout.annotations.slice() || [];
                    annotations.push(annotation);
                    Plotly.relayout('heatmap',{annotations: annotations})
                }
            });
        //document.getElementById("spiner").style.display = "none";
        document.getElementById("spiner").innerHTML = '';
            
        }
        
        
        

}
}
