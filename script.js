var margin = { top: 50, right: 0, bottom: 100, left: 150 },
    width = 650 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 10),
    buckets = 10,
    colors = ["#60B660","#42B881","#6AC1A5","#ACDCA6","#E6F49D","#F6F9AE","#FDDF90","#ff8c66","#ff6633","#e63900"], // alternatively colorbrewer.YlGnBu[9]
    yLabel = ["floor_0", "floor_1", "floor_2", "floor_3", "floor_4", "floor_5", "floor_6", "floor_7", "floor_8"],
    xLabel = ['CTRL_BUS', 'DATA_BUS', 'LUT', "*PU"],
    xsubLabel = ["Main", "Passthru","Main","Passthru","LUT_0","LUT_1","CAPU","CSPU","DAPU","DDPU"],
    ysubLabel = ['half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1', 'half_0', 'half_1'];

var colorScale = d3.scale.quantile()
    .domain([0, 100])
    .range(colors);



d3.select('#home').on('click', init);
function buildtheHTML(build_array, instances) {
  var outer_html = '';
  var inner_a = '';
  for(var i = 0; i < instances.length; i++) {
    outer_html += "<li id=" + instances[i] + ">";
  }
  d3.select('#instances')
      .html(outer_html);

  for(var i = 0; i < instances.length; i++) {
    var current_array = build_array[instances[i]];
    inner_a = "<a href='#instance" + (i+1) + "Submenu' data-toggle='collapse' aria-expanded='false'>" + instances[i] + "</a></li>";
    var inner_ul = '';
    if(current_array.length != 0) {
      inner_ul += "<ul class='collapse list-unstyled' id='instance" + (i+1) + "Submenu'>";
    }
    d3.select('#'+instances[i]).html(inner_a + inner_ul);
  }

  for(var i = 0; i < instances.length; i++) {
    var current_array = build_array[instances[i]];
    if(current_array.length != 0) { 
      var inner_li = '';
      for(var j = 0; j < current_array.length; j++) {
        inner_li += '<li><a href="#" id="' + instances[i] + '-' + current_array[j] + '" onclick="heatmapChart(\'' + instances[i] + '\', \'' + current_array[j] + '\')">' + current_array[j] + '</a></li>';
      }
      d3.select('#instance' + (i+1) + 'Submenu').html(inner_li);
    }
  }
}
function init() {
  d3.selectAll('#sidebar ul li a').attr('aria-expanded', 'false');
  d3.selectAll('#sidebar ul li ul').attr('class', 'collapse list-unstyled');
  d3.select('#chart-details').style('display', 'none');
  d3.select('#chart').style('display', 'none');
  d3.json('data.json', function(d) {
    var build_array = [];
    var instances = Object.keys(d.FSL);
    for(var i = 0; i < instances.length; i++) {
      var profiles = Object.keys(d.FSL[instances[i]]);
      build_array[instances[i]] = profiles;
    }
    buildtheHTML(build_array, instances);
  }); 
};
init();
var heatmapChart = function(instance, profile) {
  d3.selectAll('#sidebar ul li a').classed('active', false);
  d3.select('#chart').html('');
  d3.select('#chart').style('display', 'block');
  d3.select('#chart-details').style('display', 'none');
  d3.select('#'+instance+'-'+profile).classed('active', true);

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right + 50)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yLabels = svg.selectAll(".yLabel")
      .data(yLabel)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", -50)
        .attr("y", function (d, i) { return i * gridSize + 80; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.7 + ")")
        .attr("class", "yLabel mono label axis axis-workweek");

  var ysubLabels = svg.selectAll(".ysubLabel")
      .data(ysubLabel)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("class", "mono sub")
        .attr("x", 10)
        .attr("y", function (d, i) { return i * gridSize/2 + 80; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 3 + ")");


  svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 250))
    .attr("text-anchor", "middle")  
    .style("font-size", "19px")
    .style("font-weight", "Bold")
    .style("font-color", "#999")
    .attr("id", "chart-heading")  
    .text("");


  var xLabels = svg.selectAll(".xLabel")
      .data(xLabel)
      .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(xLabel, i) { return i * 2 * gridSize +50; })
        .attr("y", 50)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", "xLabel mono label axis axis-worktime")
        

  var xsubLabels = svg.selectAll(".xsubLabel")
      .data(xsubLabel)
      .enter().append("text")
        .text(function(d) { return d; })
        .attr("class", "mono sub")
        .attr("x", function(d, i) { return i * gridSize +20; })
        .attr("y", 70)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)");
      
  // Prep the tooltip bits, initial display is hidden
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) {
      return "<span style='color:#333'>Available:" + (100 - d.value) + "%</span>";
    })

  d3.select('#chart-heading').text(instance+'_'+profile);
  d3.select('#ins_val').text(instance);
  d3.select('#pro_val').text(profile);
  d3.json('data.json', function(d) {
    var instances = Object.keys(d.FSL);
    var xValues, pu_values;

    // Adding x-axis label based on the given json
    function get_floor_values(current_instance) {
      var xValues = [], pu_values = [];
      var current_profile = Object.values(current_instance);
      var floors = Object.keys(current_instance);
      for(var j = 0; j < current_profile.length; j++) {
        var current_floor = Object.values(current_profile[j]);
        var half_floors = Object.keys(current_profile[j]);
        for(var k = 0; k < current_floor.length; k++) {
          var current_half_floor = Object.values(current_floor[k]);
          var current_xLabel = [], current_pu_values = [];

          function add(a, b) {
              return a + b;
          }
          for (var i = 0; i < current_half_floor.length; i++) {
            var current_floor_pu_values;
            if(i == 0) {
              (Object.values(current_half_floor[i].CTRL)).forEach(function(val) {
                current_xLabel.push(val);
              });
              (Object.values(current_half_floor[i].DATA)).forEach(function(val) {
                current_xLabel.push(val);
              });
            }
            else if(i == 1) {
              (Object.values(current_half_floor[i])).forEach(function(val) {
                current_xLabel.push(val);
              });
            }
            else {
              current_floor_pu_values = Object.values(current_half_floor[i]);
              //console.log(current_pu_values);
              var sum = (current_floor_pu_values).reduce(add, 0);
              var avg = sum/current_floor_pu_values.length;
              current_xLabel.push(avg);
              current_pu_values.push(current_floor_pu_values);
            }
            
          }
          pu_values.push(current_pu_values);
          xValues.push(current_xLabel);
        }
      }
      //console.log(xValues, pu_values);
      //console.log(pu_values[0-17][0-3]); 
      return [xValues, pu_values];
    }
    for(var i = 0; i < instances.length; i++) {
      var profiles = Object.keys(d.FSL[instances[i]]); 
      //console.log(profiles);
      if(instances[i] == instance) {
        var current_instance = Object.values(d.FSL[instances[i]]);

        for(var m = 0; m < current_instance.length; m++) {
          if(profiles[m] == profile) {
            var values = get_floor_values(current_instance[m]);
            xValues = values[0];
            pu_values = values[1];
            console.log(xValues, pu_values);
            var jso = [], jso_val;
            xValues.forEach(function(d,i) {
              for(j = 0; j < d.length; j++) {
                jso_val = { floor : i,
                            interfaces: j,
                            half_floor : (i % 2) ? 1 : 0,
                            value : d[j]
                          }
                jso.push(jso_val);
              }
            });

            
            svg.call(tip);

            var cards = svg.selectAll(".hour")
                .data(jso, function(d) {return d.floor+':'+d.interfaces;});

            //cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) { return (d.interfaces) * gridSize + 20; })
                .attr("y", function(d) { return (d.floor) * gridSize/2 + 80; })
                .attr('id', function(d) { return ("box" + d.floor + d.interfaces + '-' + d.value); })
                .attr("rx", 2)
                .attr("ry", 2)
                .attr("class", "hour bordered")
                .attr("width", gridSize/2)
                .attr("height", gridSize/5)
                .style("fill", function(d) { return colors[Math.floor(d.value/10)]; })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on('click', handler);

            cards.append("text")
              .attr("class", "mono")
              .text(function(d) { return d.value})
              .attr("x", function(d) { return (d.interfaces) * gridSize + 20; })
              .attr("y", function(d) { return (d.floor) * gridSize/2 + 80; })
              .attr("transform", "translate(" + gridSize / 2 + ", -6)");

                      
            cards.transition()
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("width", gridSize)
                .attr("height", gridSize/2)
                .style("fill", function(d) { return colorScale(d.value); })
                .delay(200)
                .duration(500)
                .ease("linear");

            //cards.select("title").text(function(d) { return d.value; });

            cards.exit().remove();

            var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
              .attr("x", function(colors, i) { return gridSize * i + 20; })
              .attr("y", height)
              .attr("width", gridSize)
              .attr("height", gridSize/2)
              .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
              .attr("class", "mono")
              .text(function(d,i) { return "≥ " + Math.round(i*10); })
              .attr("x", function(colors, i) { return (gridSize * i + 10); })
              .attr("y", height+gridSize);

            legend.exit().remove();

            function handler() {
              var box = this.id;
              console.log(box);
              var value = box.split('-');
              d3.select('#chart-details')
                .style('display', 'block');
              addGridInfo(value[0], value[1]);
            }

            
            function addGridInfo(box, value) {
              box = box.slice(3);
              var floor = parseInt(box)/10;
              var interface = parseInt(box)%10;
              var interface_val = '';
              if(interface <= 1) {
                interface_val = xLabel[0];
              }
              else if(interface <= 3) {
                interface_val = xLabel[1];
              }
              else if(interface <= 5) {
                interface_val = xLabel[2];
              }
              else {
                interface_val = xLabel[3];
              }
              var half_floor = (Math.floor(floor) % 2) ? 1 : 0;
              d3.select('#interface_val').text(interface_val+'_'+xsubLabel[interface]);
              d3.select('#floor_no').text(Math.floor(floor/2));
              d3.select('#half_floor_no').text(half_floor);
              var used = parseInt(value);
              var available = 100 - used;

              // And for a doughnut chart
              function draw_doughnut(ctx) {
                var myDoughnutChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                          datasets: [{
                              data: [available, used],
                              backgroundColor: [
                                  '#00BFC4',
                                  '#FF5556',
                              ]
                          }],
                          labels: [
                              'Available',
                              'Used'
                          ],
                          options: {
                            cutoutPercentage: 10
                          }
                      }
                });
              }

              // for bar chart
              function draw_bar(ctx, arr, inv_arr, name) {
                var barData = {
                  labels: [name+'_0',name+'_1',name+'_2',name+'_3'],
                  datasets: [
                  {
                    label: "Used",
                    backgroundColor: '#FF5556',
                    data: arr
                  },
                  {
                    label: "Available",
                    backgroundColor: '#00BFC4',
                    data: inv_arr
                  }]
                };
                var myBarChart = new Chart(ctx, {
                  type: 'bar',
                  data: barData,
                  options: {
                    scales: {
                      xAxes: [{ stacked: true }],
                      yAxes: [{ stacked: true }]
                    }
                  }
                });
              }

              var resetCanvas = function() {
                d3.select('#result-graph').remove();
                $('#myChart').append('<canvas id="result-graph"></canvas>');
                var ctx = document.getElementById('result-graph').getContext('2d');
                if(interface <= 5) {
                  draw_doughnut(ctx);
                }
                else {
                  ctx.canvas.height = "300px";
                  var arr = pu_values[Math.floor(floor)][interface-6];
                  var name = xsubLabel[interface];
                  var color = ["#51C0BF", "#3DA3E8", "#FECC60", "#FD6585"];
                  /*var arr_color = arr.map(function(val) {
                    return color[Math.floor(val/25)];
                  });*/
                  var inv_arr = arr.map(function(val) {
                    return 100-val;
                  });
                  /*var inv_arr_color = inv_arr.map(function(val) {
                    return color[Math.floor(val/25)];
                  });*/
                  //console.log(arr, arr_color);
                  draw_bar(ctx, arr, inv_arr, name);
                }
              };

              resetCanvas();
            }  
          }
        }
      }
    }
  });
};
