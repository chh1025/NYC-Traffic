var rawData = [];
var selectedData = [];

d3.csv('./data/NYC_Traffic.csv', function (d) {
    for (var i = 0; i < d.length; i++) {
        if (d[i].CRASH_TIME == "" || d[i].BOROUGH == "" || d[i].NUMBER_OF_PERSONS_INJURED == "" ||
            d[i].NUMBER_OF_MOTORIST_INJURED == "" || d[i].VEHICLE_TYPE == "") {
            continue;
        } else {
            var split_time = d[i].CRASH_TIME.split(":");
            rawData.push({
                time: parseInt(split_time[0]),
                borough: d[i].BOROUGH,
                person: parseInt(d[i].NUMBER_OF_PERSONS_INJURED),
                motorist: parseInt(d[i].NUMBER_OF_MOTORIST_INJURED),
                vihicle: d[i].VEHICLE_TYPE
            });
        }
    }

    selectedData = rawData;

    draw_area(selectedData);
    draw_pie(selectedData);
    draw_bar(selectedData);
    draw_bubble(selectedData);
});

function draw_area(data) {
    var margin = {
            top: 40,
            right: 40,
            bottom: 80,
            left: 40
        },
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#rawArea")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var time = [];

    for (var i = 0; i < data.length; i++) {
        if (time.length == 0) time.push(data[i].time);
        else {
            var cnt = 0;
            for (var j = 0; j < time.length; j++) {
                if (time[j] == data[i].time) cnt++;
            }
            if (!cnt) time.push(data[i].time);
        }
    }

    var areaData = [];

    for (var i = 0; i < time.length; i++) {
        areaData[i] = {
            label: time[i],
            value: 0
        };
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < time.length; j++) {
            if (data[i].time == areaData[j].label) areaData[j].value++;
        }
    }

    areaData = areaData.sort(function (a, b) {
        return a.label - b.label;
    });

    console.log(areaData);

    var x = d3.scaleLinear()
        .domain([0, 23])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));


    var y = d3.scaleLinear()
        .domain([0,30])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0));

    svg.append("path")
        .datum(areaData)
        .attr("fill", "#1b9e77")
        .attr("opacity", 0.3)
        .attr("stroke", "none")
        .attr("d", d3.area()
            .x(function (d) {
                return x(d.label)
            })
            .y0(height)
            .y1(function (d) {
                return y(d.value)
            })
        )

    svg.append("path")
        .datum(areaData)
        .attr("fill", "none")
        .attr("stroke", "#1b9e77")
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.label)
            })
            .y(function (d) {
                return y(d.value)
            })
        )


    svg.selectAll("myCircles")
        .data(areaData)
        .enter()
        .append("circle")
        .attr("fill", "#1b9e77")
        .attr("stroke", "none")
        .attr("cx", function (d) {
            return x(d.label)
        })
        .attr("cy", function (d) {
            return y(d.value)
        })
        .attr("r", 5)

    svg.selectAll("myFocus")
        .data(areaData)
        .enter()
        .append("circle")
        .attr("fill", function (d) {
            d.focus = this;
            return "transparent"
        })
        .attr("stroke", "transparent")
        .attr("stroke-width", 3)
        .attr("cx", function (d) {
            return x(d.label)
        })
        .attr("cy", function (d) {
            return y(d.value)
        })
        .attr("r", 12)

    svg.selectAll("myText")
        .data(areaData)
        .enter()
        .append("text")
        .text(function (d) {
            d.text = this;
        })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", 13)
        .style("fill", "#1b9e77")
        .style("paint-order", "stroke")
        .style("stroke", "#1b9e77")
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .attr("x", function (d) {
            return x(d.label)
        })
        .attr("y", function (d) {
            return y(d.value) - 20
        })

    svg.selectAll("myRect")
        .data(areaData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.label);
        })
        .attr("y", function (d) {
            return y(30);
        })
        .attr("width", 16)
        .attr("height", y(0))
        .attr("transform", "translate(" + -8 + "," + 0 + ")")
        .attr("fill", "transparent")
        .on("mouseover", function (d) {
            d3.select(d.focus).attr("stroke", "#1b9e77")
            d3.select(d.text).text(d.value)

            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "block";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            selectedData = rawData.filter(dt => dt.time == d.label);
            draw_pie(selectedData);
            draw_selectedBar(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.focus).attr("stroke", "transparent")
            d3.select(d.text).text(null)
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "none";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData
            draw_pie(selectedData);
        })

    svg.append("text")
        .text('The number of accidents per TIME')
        .attr('transform', 'translate(' + 180 + ',' + 350 + ')')
        .style('text-anchor', 'middle')
        .style('font-size', 13)
        .style("fill", "#555555")
}

function draw_selectedArea(data) {
    var margin = {
            top: 40,
            right: 40,
            bottom: 80,
            left: 40
        },
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#selectedArea")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var time = [];

    for (var i = 0; i < data.length; i++) {
        if (time.length == 0) time.push(data[i].time);
        else {
            var cnt = 0;
            for (var j = 0; j < time.length; j++) {
                if (time[j] == data[i].time) cnt++;
            }
            if (!cnt) time.push(data[i].time);
        }
    }

    var areaData = [];

    for (var i = 0; i < time.length; i++) {
        areaData[i] = {
            label: time[i],
            value: 0
        };
    }

    if (areaData.length < 24) {
        for (var i = 0; i <= 23; i++) {
            var cnt = 0;
            for (var j = 0; j < areaData.length; j++) {
                if (areaData[j].label == i) cnt++;
            }
            if (!cnt) {
                areaData.push({
                    label: i,
                    value: 0
                });
            }
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < time.length; j++) {
            if (data[i].time == areaData[j].label) areaData[j].value++;
        }
    }

    areaData = areaData.sort(function (a, b) {
        return a.label - b.label;
    });

    console.log(areaData);

    var x = d3.scaleLinear()
        .domain([0, 23])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));


    var y = d3.scaleLinear()
        .domain([0,30])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0));

    svg.append("path")
        .datum(areaData)
        .attr("fill", "#d95f02")
        .attr("opacity", 0.3)
        .attr("stroke", "none")
        .attr("d", d3.area()
            .x(function (d) {
                return x(d.label)
            })
            .y0(height)
            .y1(function (d) {
                return y(d.value)
            })
        )

    svg.append("path")
        .datum(areaData)
        .attr("fill", "none")
        .attr("stroke", "#d95f02")
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.label)
            })
            .y(function (d) {
                return y(d.value)
            })
        )

    svg.selectAll("myCircles")
        .data(areaData)
        .enter()
        .append("circle")
        .attr("fill", "#d95f02")
        .attr("stroke", "none")
        .attr("cx", function (d) {
            return x(d.label)
        })
        .attr("cy", function (d) {
            return y(d.value)
        })
        .attr("r", 5)
}

function draw_pie(data) {
    var width = 450
    height = 400
    margin = 40

    var radius = Math.min(width, height) / 2 - margin

    var svg = d3.select("#rawPie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "percents");
    svg.append("g")
        .attr("class", "counts");

    var vihicle = [];

    for (var i = 0; i < data.length; i++) {
        if (vihicle.length == 0) vihicle.push(data[i].vihicle);
        else {
            var cnt = 0;
            for (var j = 0; j < vihicle.length; j++) {
                if (vihicle[j] == data[i].vihicle) cnt++;
            }
            if (!cnt) vihicle.push(data[i].vihicle);
        }
    }

    var pieData = [];

    for (var i = 0; i < vihicle.length; i++) {
        pieData[i] = {
            label: "VT" + vihicle[i].substr(13, vihicle[i].length),
            value: 0
        };
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < pieData.length; j++) {
            if (data[i].vihicle == "VEHOCLE TYPE " + pieData[j].label.substr(2, pieData[j].length)) pieData[j].value++;
        }
    }

    var processed_pieData = [];
    var otherCnt = 0;

    for (var i = 0; i < pieData.length; i++) {
        if (pieData[i].value / data.length >= 1 / 30) {
            processed_pieData.push({
                label: pieData[i].label,
                value: pieData[i].value
            });
        } else otherCnt++;
    }

    processed_pieData = processed_pieData.sort(function (a, b) {
        return b.value - a.value;
    });

    processed_pieData.push({
        label: "Other",
        value: otherCnt
    });

    var color = d3.scaleOrdinal().range(d3.schemeDark2);

    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        })

    var data_ready = pie(processed_pieData)

    var arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8)

    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

    var piePath = svg.selectAll("pie_path").data(data_ready)

    piePath
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d) {
            d.element = this;
            return (color(d.index))
        })
        .attr("stroke", "antiquewhite")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "block";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            if (d.data.label != "Other") {
                selectedData = rawData.filter(dt => dt.vihicle == "VEHOCLE TYPE " + d.data.label.substr(2, d.data.label.length - 2));
            } else {
                selectedData = rawData.filter(dt => dt.vihicle != "VEHOCLE TYPE 1").filter(dt2 => dt2.vihicle != "VEHOCLE TYPE 4").filter(dt3 => dt3.vihicle != "VEHOCLE TYPE 2");
            }
            draw_selectedArea(selectedData);
            draw_selectedBar(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "none";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
        })

    piePath
        .enter()
        .append('text')
        .text(function (d) {
            if (d.data.value) return d.data.label
        })
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d)[0] * 1.45 + ',' + arc.centroid(d)[1] * 1.45 + ")";
        })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", 18)
        .style("fill", function (d) {
            return (color(d.index))
        })
        .style("paint-order", "stroke")
        .style("stroke", function (d) {
            return (color(d.index))
        })
        .style("stroke-width", "1px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "block";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            if (d.data.label != "Other") {
                selectedData = rawData.filter(dt => dt.vihicle == "VEHOCLE TYPE " + d.data.label.substr(2, d.data.label.length - 2));
            } else {
                selectedData = rawData.filter(dt => dt.vihicle != "VEHOCLE TYPE 1").filter(dt2 => dt2.vihicle != "VEHOCLE TYPE 4").filter(dt3 => dt3.vihicle != "VEHOCLE TYPE 2");
            }
            draw_selectedArea(selectedData);
            draw_selectedBar(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "none";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
        })

    piePath
        .enter()
        .append('text')
        .text(function (d) {
            if (d.data.value) return ((d.data.value / data.length) * 100).toFixed(1) + "%"
        })
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", 13)
        .style("fill", "antiquewhite")
        .style("paint-order", "stroke")
        .style("stroke", "antiquewhite")
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "block";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            if (d.data.label != "Other") {
                selectedData = rawData.filter(dt => dt.vihicle == "VEHOCLE TYPE " + d.data.label.substr(2, d.data.label.length - 2));
            } else {
                selectedData = rawData.filter(dt => dt.vihicle != "VEHOCLE TYPE 1").filter(dt2 => dt2.vihicle != "VEHOCLE TYPE 4").filter(dt3 => dt3.vihicle != "VEHOCLE TYPE 2");
            }
            draw_selectedArea(selectedData);
            draw_selectedBar(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "none";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
        })

    piePath
        .enter()
        .append('text')
        .text(function (d) {
            if (d.data.value) return d.data.value
        })
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d)[0] * 0.65 + ',' + arc.centroid(d)[1] * 0.65 + ")";
        })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", 11)
        .style("fill", function (d) {
            return (color(d.index))
        })
        .style("paint-order", "stroke")
        .style("stroke", function (d) {
            return (color(d.index))
        })
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "block";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            if (d.data.label != "Other") {
                selectedData = rawData.filter(dt => dt.vihicle == "VEHOCLE TYPE " + d.data.label.substr(2, d.data.label.length - 2));
            } else {
                selectedData = rawData.filter(dt => dt.vihicle != "VEHOCLE TYPE 1").filter(dt2 => dt2.vihicle != "VEHOCLE TYPE 4").filter(dt3 => dt3.vihicle != "VEHOCLE TYPE 2");
            }
            draw_selectedArea(selectedData);
            draw_selectedBar(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("selectedBar").innerHTML = "";
            document.getElementById("selectedBar").style.display = "none";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
        })

    svg.append("text")
        .text('Percentage of traffic accidents by VEHOCLE TYPE')
        .attr('transform', 'translate(' + 0 + ',' + 190 + ')')
        .style('text-anchor', 'middle')
        .style('font-size', 13)
        .style("fill", "#555555")
}

function draw_bar(data) {
    var margin = {
            top: 40,
            right: 40,
            bottom: 80,
            left: 40
        },
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#rawBar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var borough = [];

    for (var i = 0; i < data.length; i++) {
        if (borough.length == 0) borough.push(data[i].borough);
        else {
            var cnt = 0;
            for (var j = 0; j < borough.length; j++) {
                if (borough[j] == data[i].borough) cnt++;
            }
            if (!cnt) borough.push(data[i].borough);
        }
    }

    var barData = [];

    for (var i = 0; i < borough.length; i++) {
        barData[i] = {
            label: "BR" + borough[i].substr(8, borough[i].length),
            value: 0
        };
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < barData.length; j++) {
            if (data[i].borough == "BOROUGH " + barData[j].label.substr(2, barData[j].label.length)) barData[j].value++;
        }
    }

    barData = barData.sort(function (a, b) {
        return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
    });

    var x = d3.scaleLinear()
        .domain([0, 120])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", 11)


    var y = d3.scaleBand()
        .range([0, height])
        .domain(barData.map(function (d) {
            return d.label;
        }))
        .padding(.3);
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", 15)

    var barPath = svg.selectAll("bar_path").data(barData)

    barPath
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", function (d) {
            d.element = this;
            return y(d.label);
        })
        .attr("width", function (d) {
            return x(d.value);
        })
        .attr("height", y.bandwidth())
        .attr("fill", "#1b9e77")
        .style("opacity", 0.7)
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            selectedData = rawData.filter(dt => dt.borough == "BOROUGH " + d.label[2]);
            draw_selectedArea(selectedData);
            draw_pie(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
            draw_pie(selectedData);
        })

    barPath
        .enter()
        .append("text")
        .text(function (d) {
            if (d.value >= 15) return ((d.value / data.length) * 100).toFixed(1) + "%"
        })
        .attr("x", function (d) {
            return x(d.value) - 5;
        })
        .attr("y", function (d) {
            return y(d.label) + 20;
        })
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")
        .style("font-size", 13)
        .style("fill", "antiquewhite")
        .style("paint-order", "stroke")
        .style("stroke", "antiquewhite")
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            selectedData = rawData.filter(dt => dt.borough == "BOROUGH " + d.label[2]);
            draw_selectedArea(selectedData);
            draw_pie(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
            draw_pie(selectedData);
        })

    barPath
        .enter()
        .append("text")
        .text(function (d) {
            return d.value
        })
        .attr("x", function (d) {
            return x(d.value) + 5;
        })
        .attr("y", function (d) {
            return y(d.label) + 20;
        })
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .style("font-size", 13)
        .style("fill", "#1b9e77")
        .style("paint-order", "stroke")
        .style("stroke", "#1b9e77")
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on("mouseover", function (d) {
            d3.select(d.element).style("opacity", 1);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "block";
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "block";
            selectedData = rawData.filter(dt => dt.borough == "BOROUGH " + d.label[2]);
            draw_selectedArea(selectedData);
            draw_pie(selectedData);
            draw_selectedBubble(selectedData);
        })
        .on("mouseout", function (d) {
            d3.select(d.element).style("opacity", 0.7);
            document.getElementById("selectedArea").innerHTML = "";
            document.getElementById("selectedArea").style.display = "none";
            document.getElementById("rawPie").innerHTML = "";
            document.getElementById("selectedBubble").innerHTML = "";
            document.getElementById("selectedBubble").style.display = "none";
            selectedData = rawData;
            draw_pie(selectedData);
        })

    svg.append("text")
        .text('Percentage of traffic accidents by BOROUGH TYPE')
        .attr('transform', 'translate(' + 180 + ',' + 350 + ')')
        .style('text-anchor', 'middle')
        .style('font-size', 13)
        .style("fill", "#555555")
}

function draw_selectedBar(data) {
    var margin = {
            top: 40,
            right: 40,
            bottom: 80,
            left: 40
        },
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#selectedBar")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var borough = [];

    for (var i = 0; i < data.length; i++) {
        if (borough.length == 0) borough.push(data[i].borough);
        else {
            var cnt = 0;
            for (var j = 0; j < borough.length; j++) {
                if (borough[j] == data[i].borough) cnt++;
            }
            if (!cnt) borough.push(data[i].borough);
        }
    }

    var barData = [];

    for (var i = 0; i < borough.length; i++) {
        barData[i] = {
            label: "BR" + borough[i].substr(8, borough[i].length),
            value: 0
        };
    }

    if (barData.length < 5) {
        for (var i = 1; i <= 5; i++) {
            var cnt = 0;
            for (var j = 0; j < barData.length; j++) {
                if (barData[j].label == "BR" + i) cnt++;
            }
            if (!cnt) {
                barData.push({
                    label: "BR" + i,
                    value: 0
                });
            }
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < barData.length; j++) {
            if (data[i].borough == "BOROUGH " + barData[j].label.substr(2, barData[j].label.length)) barData[j].value++;
        }
    }

    barData = barData.sort(function (a, b) {
        return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
    });

    var x = d3.scaleLinear()
        .domain([0, 120])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", 11)


    var y = d3.scaleBand()
        .range([0, height])
        .domain(barData.map(function (d) {
            return d.label;
        }))
        .padding(.3);
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", 15)

    var barPath = svg.selectAll("bar_path").data(barData)

    barPath
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", function (d) {
            d.element = this;
            return y(d.label);
        })
        .attr("width", function (d) {
            return x(d.value);
        })
        .attr("height", y.bandwidth())
        .attr("fill", "#d95f02")
        

    barPath
        .enter()
        .append("text")
        .text(function (d) {
            if (d.value >= 15) return ((d.value / data.length) * 100).toFixed(1) + "%"
        })
        .attr("x", function (d) {
            return x(d.value) - 5;
        })
        .attr("y", function (d) {
            return y(d.label) + 20;
        })
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")
        .style("font-size", 13)
        .style("fill", "antiquewhite")
        .style("paint-order", "stroke")
        .style("stroke", "antiquewhite")
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        

    barPath
        .enter()
        .append("text")
        .text(function (d) {
            return d.value
        })
        .attr("x", function (d) {
            return x(d.value) + 5;
        })
        .attr("y", function (d) {
            return y(d.label) + 20;
        })
        .style("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .style("font-size", 13)
        .style("fill", "#d95f02")
        .style("paint-order", "stroke")
        .style("stroke", "#d95f02")
        .style("stroke-width", "0.5px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
}

function draw_bubble(data) {
    var margin = {
            top: 40,
            right: 40,
            bottom: 90,
            left: 90
        },
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#rawBubble")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var person = [];
    var motorist = [];

    for (var i = 0; i < data.length; i++) {
        if (person.length == 0) person.push(data[i].person);
        else {
            var cnt = 0;
            for (var j = 0; j < person.length; j++) {
                if (person[j] == data[i].person) cnt++;
            }
            if (!cnt) person.push(data[i].person);
        }
    }

    for (var i = 0; i < data.length; i++) {
        if (motorist.length == 0) motorist.push(data[i].motorist);
        else {
            var cnt = 0;
            for (var j = 0; j < motorist.length; j++) {
                if (motorist[j] == data[i].motorist) cnt++;
            }
            if (!cnt) motorist.push(data[i].motorist);
        }
    }

    var bubbleData = [];

    for (var i = 0; i < person.length; i++) {
        for (var j = 0; j < motorist.length; j++) {
            bubbleData.push({
                person: person[i],
                motorist: motorist[j],
                value: 0
            });
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < bubbleData.length; j++) {
            if (data[i].person == bubbleData[j].person && data[i].motorist == bubbleData[j].motorist) bubbleData[j].value++;
        }
    }

    var x = d3.scaleLinear()
        .domain([0, 3])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(4))
        .style("font-size", 13)


    var y = d3.scaleLinear()
        .domain([0, 3])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(4))
        .style("font-size", 13)


    var z = d3.scaleLinear()
        .domain([1, 124])
        .range([12, 50]);

    var bubblePath = svg.append('g').selectAll("dot").data(bubbleData)

    bubblePath
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return x(d.motorist);
        })
        .attr("cy", function (d) {
            return y(d.person);
        })
        .attr("r", function (d) {
            return z(d.value);
        })
        .style("fill", function (d) {
            d.element = this;
            if (d.value) return "#1b9e77";
            else return "transparent";
        })
        .style("opacity", "0.7")
        .attr("stroke", function (d) {
            if (d.value) return "antiquewhite";
            else return "transparent";
        })
        .style("stroke-width", "2px")
        .on("mouseover", function (d) {
            if (d.value) {
                d3.select(d.element).style("opacity", 1);
                document.getElementById("selectedArea").innerHTML = "";
                document.getElementById("selectedArea").style.display = "block";
                document.getElementById("rawPie").innerHTML = "";
                document.getElementById("selectedBar").innerHTML = "";
                document.getElementById("selectedBar").style.display = "block";
                selectedData = rawData.filter(dt => dt.motorist == d.motorist).filter(dt2 => dt2.person == d.person);
                draw_selectedArea(selectedData);
                draw_pie(selectedData);
                draw_selectedBar(selectedData);
            }
        })
        .on("mouseout", function (d) {
            if (d.value) {
                d3.select(d.element).style("opacity", 0.7);
                document.getElementById("selectedArea").innerHTML = "";
                document.getElementById("selectedArea").style.display = "none";
                document.getElementById("rawPie").innerHTML = "";
                document.getElementById("selectedBar").innerHTML = "";
                document.getElementById("selectedBar").style.display = "none";
                selectedData = rawData;
                draw_pie(selectedData);
            }
        })

    bubblePath
        .enter()
        .append("text")
        .attr("x", function (d) {
            return x(d.motorist);
        })
        .attr("y", function (d) {
            return y(d.person);
        })
        .text(function (d) {
            if (d.value) return d.value;
        })
        .style('text-anchor', 'middle')
        .style("alignment-baseline", "middle")
        .style('font-size', 15)
        .style("fill", "antiquewhite")
        .style("paint-order", "stroke")
        .style("stroke", "antiquewhite")
        .style("stroke-width", "1px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .on("mouseover", function (d) {
            if (d.value) {
                d3.select(d.element).style("opacity", 1);
                document.getElementById("selectedArea").innerHTML = "";
                document.getElementById("selectedArea").style.display = "block";
                document.getElementById("rawPie").innerHTML = "";
                document.getElementById("selectedBar").innerHTML = "";
                document.getElementById("selectedBar").style.display = "block";
                selectedData = rawData.filter(dt => dt.motorist == d.motorist).filter(dt2 => dt2.person == d.person);
                draw_selectedArea(selectedData);
                draw_pie(selectedData);
                draw_selectedBar(selectedData);
            }
        })
        .on("mouseout", function (d) {
            if (d.value) {
                d3.select(d.element).style("opacity", 0.7);
                document.getElementById("selectedArea").innerHTML = "";
                document.getElementById("selectedArea").style.display = "none";
                document.getElementById("rawPie").innerHTML = "";
                document.getElementById("selectedBar").innerHTML = "";
                document.getElementById("selectedBar").style.display = "none";
                selectedData = rawData;
                draw_pie(selectedData);
            }
        })

    svg.append("text")
        .text('MOTORIST')
        .style('font-size', 13)
        .style("fill", "#666666")
        .attr('transform', 'translate(' + 255 + ',' + 265 + ')')

    svg.append("text")
        .text('PERSON')
        .style('font-size', 13)
        .style("fill", "#666666")
        .attr('transform', 'translate(' + 5 + ',' + 10 + ')')

    svg.append("text")
        .text('Injury bias between MOTORIST & PERSON')
        .attr('transform', 'translate(' + 160 + ',' + 350 + ')')
        .style('text-anchor', 'middle')
        .style('font-size', 13)
        .style("fill", "#555555")
}

function draw_selectedBubble(data) {
    var margin = {
            top: 40,
            right: 40,
            bottom: 90,
            left: 90
        },
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#selectedBubble")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var person = [];
    var motorist = [];

    for (var i = 0; i < data.length; i++) {
        if (person.length == 0) person.push(data[i].person);
        else {
            var cnt = 0;
            for (var j = 0; j < person.length; j++) {
                if (person[j] == data[i].person) cnt++;
            }
            if (!cnt) person.push(data[i].person);
        }
    }

    for (var i = 0; i < data.length; i++) {
        if (motorist.length == 0) motorist.push(data[i].motorist);
        else {
            var cnt = 0;
            for (var j = 0; j < motorist.length; j++) {
                if (motorist[j] == data[i].motorist) cnt++;
            }
            if (!cnt) motorist.push(data[i].motorist);
        }
    }

    var bubbleData = [];

    for (var i = 0; i < person.length; i++) {
        for (var j = 0; j < motorist.length; j++) {
            bubbleData.push({
                person: person[i],
                motorist: motorist[j],
                value: 0
            });
        }
    }

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < bubbleData.length; j++) {
            if (data[i].person == bubbleData[j].person && data[i].motorist == bubbleData[j].motorist) bubbleData[j].value++;
        }
    }

    var x = d3.scaleLinear()
        .domain([0, 3])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(4))
        .style("font-size", 13)


    var y = d3.scaleLinear()
        .domain([0, 3])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(4))
        .style("font-size", 13)


    var z = d3.scaleLinear()
        .domain([1, 124])
        .range([12, 50]);

    var bubblePath = svg.append('g').selectAll("dot").data(bubbleData)

    bubblePath
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return x(d.motorist);
        })
        .attr("cy", function (d) {
            return y(d.person);
        })
        .attr("r", function (d) {
            return z(d.value);
        })
        .style("fill", function (d) {
            d.element = this;
            if (d.value) return "#d95f02";
            else return "transparent";
        })
        .style("stroke-width", "2px")
        

    bubblePath
        .enter()
        .append("text")
        .attr("x", function (d) {
            return x(d.motorist);
        })
        .attr("y", function (d) {
            return y(d.person);
        })
        .text(function (d) {
            if (d.value) return d.value;
        })
        .style('text-anchor', 'middle')
        .style("alignment-baseline", "middle")
        .style('font-size', 15)
        .style("fill", "antiquewhite")
        .style("paint-order", "stroke")
        .style("stroke", "antiquewhite")
        .style("stroke-width", "1px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
}