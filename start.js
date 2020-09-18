ws = new WebSocket("wss://still-tor-75666.herokuapp.com")
ws.onopen = ()=> console.log("open")

ws.onmessage = (data)=> {console.log("messege");
    data = JSON.parse(data.data)
    if (allData.length===0) {loadData(data)}
    else {updateData(data)}
    draw()
}

ws.onclose = ()=> console.log("closed")

const border = {leftBorder: 950, rightBorder:1050, max: 1050, min: 0 }

let allData = []

const moveLeft = ()=> {
    const borderLength = border.rightBorder - border.leftBorder
    if (cheakBorder(-borderLength/5)){
        border.rightBorder -= borderLength/5
        border.leftBorder -= borderLength/5
        draw()}
}

const moveRight = ()=> {
    const borderLength = border.rightBorder - border.leftBorder
    if (cheakBorder(borderLength/5)){
        border.rightBorder += borderLength/5
        border.leftBorder += borderLength/5
        draw()}
}

const sizeMinus = ()=> {
    const borderLength = border.rightBorder - border.leftBorder
    if (cheakBorderSize(-borderLength/5)){
        border.leftBorder += borderLength/5
        draw()}
}

const sizePlus = ()=> {
    const borderLength = border.rightBorder - border.leftBorder
    if (cheakBorderSize(borderLength/5)){
        border.leftBorder -= borderLength/5
        draw()}
}

const cheakBorderSize = (k)=>{
    if (Math.abs(k)<4 && k<0){
        return false
    }
        if  ( border.leftBorder-k<border.min) return false 
    
    return true
}

const cheakBorder = (k) =>{
    if (border.leftBorder+k<border.min || border.rightBorder+k>border.max) return false
    return true
}

const cut = (leftBorder, rightBorder)=>{
    return allData.slice(leftBorder, rightBorder)
}

const loadData = (data)=> {
    allData = data 
}

const updateData = (newData)=>{
    const l = allData.length
    allData = allData.slice(20, l)
    allData = allData.concat(newData)
    //allData = init(allData)
}

const init = (data) => {
    for (let i = 0; i<data.length; i++) {data[i].number = i 
    }
    return data
}

const chageArrToDateFormat = (dat, ind)=>{

    data[ind].time =  getDateFromHours(data[ind].time)
}

const dateToHours = ()=> {
    data.forEach((dat, ind)=> {data[ind].time = data[ind].time.toLocaleTimeString() })
}

const calculateZ = ()=>{
    interval =Math.floor( (border.rightBorder - border.leftBorder)/5)
    points = []

    for (let i = 0; i<(border.rightBorder - border.leftBorder); i += 1 ){
        if (data[i] && i%interval===0) points.push(data[i].time)
    }
    //console.log(p
    return points

}

const  draw = () => {

    data = cut(border.leftBorder, border.rightBorder)
    data = init(data)

    d3.selectAll("svg").remove()
    margin = { top: 20, right: 50, bottom: 50, left: 100 }
    const width = 920 - margin.left - margin.right
    const height = 390 - margin.top - margin.bottom

    const x = d3.scaleLinear()
      .range([0, width])
  
    const y = d3.scaleLinear()
      .range([ height, 0 ])

    const z = d3.scaleBand()
      .range([0, width])

    const svg = d3.select('.chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${ margin.left },${ margin.top })`)

    let max = Math.max(d3.max(data, d => d.avgBid), d3.max(data, d => d.avgAsk))
    let min = Math.min(d3.min(data, d => d.avgBid), d3.min(data, d => d.avgAsk))
    const bidAskSaldo = max-min
    max += bidAskSaldo/10
    min -= bidAskSaldo/10

    x.domain([0, data.length-1])
    y.domain([ min, max ] )
    z.domain( calculateZ() )

    cords = {x: x, y: y}

    const xAxis = d3.axisBottom(z)
    .ticks(6) // origin (width + 2) / (height + 2) * 5 
    .tickSize(-height  ) //origin -6
    .tickPadding(10)
    .tickFormat((d) => '')

    const yAxis = d3.axisLeft(y) //origin axisRight
    .ticks(6) //origin 5
    .tickSize( width  ) // origin width+7
    .tickPadding( -50 - width) //origin -15 - width
    .tickFormat(d => '' /*d*/ )

    const tAxis = d3.axisTop(x).ticks(0).tickFormat(d => '').tickSizeInner(0).tickSizeOuter(0)
    svg.append('g').call(tAxis)
    const lAxis = d3.axisLeft(y).ticks(0).tickFormat(d => '').tickSizeInner(0).tickSizeOuter(0)
    svg.append('g').call(lAxis)

    svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${ height  })`) //org +6
    .call(xAxis);

    svg.append('g')
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${ width }, 0)`)// origin (7; 0)
    .call(yAxis)

    svg.append('g')
    .attr('transform', `translate(0 ,${ height })`)// origin 
    .call(d3.axisBottom(z)
    .tickSizeInner(3)
    .tickSizeOuter(0))

    svg.append('g')
    .attr('transform', `translate( ${ width } , 0)`)// origin (7; 0)
    .call(d3.axisRight(y)
    .tickSizeInner(3)
    .tickSizeOuter(0)
    .ticks(6))

    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
    .attr('id', 'svgGradient')
    .attr('y1', '0%')
    .attr('y2', '100%')

    gradient.append("stop")
    .attr('class', 'start')
    .attr("offset", "0%")
    .attr("stop-color", "red")
    .attr("stop-opacity", 0.5)

    gradient.append("stop")
    .attr('class', 'end')
    .attr("offset", '100%')
    .attr("stop-color", "yellow")
    .attr("stop-opacity", 0.5)

    const lineGenerator = d3.line()
    .x(d => x(d.number))
    .y(d => y(d.avgBid))

    const lineGener = d3.line()
    .x(d => x(d.number))
    .y(d => y(d.avgAsk))

    const area = d3.area()
    .x((d)=> {return x(d.number)} )
    .y0((d)=> y(d.avgBid))
    .y1((d)=>  y(d.avgAsk))

    const arr = area(data)

    if (Math.abs(y(data[data.length-1].avgAsk)-y(data[data.length-1].avgBid))>=16){
    drawArrow(svg, 'ask')
    drawArrow(svg, 'bid')
    }

    svg
    .selectAll(".line")
    .data([0])
    .enter()
    .append('path')
    .attr('fill', "url(#svgGradient)")
    .attr('d', arr)

    svg
    .selectAll('.line')
    .data([false, true])
    .enter()
    .append('path')
    .attr('d', (d)=> { return d?  lineGenerator(data): lineGener(data) } )
    .attr('class', 'line')
    .attr('stroke', (d) => {return d? 'red': 'blue'} )

    data.forEach(chageArrToDateFormat)

    const timeScale = d3.scaleTime()
    .domain([data[0].time, data[data.length-1].time])

    const axis = d3.axisBottom(timeScale)

    const ticks = timeScale.ticks(6)

    const timeInterval = (ticks[1]-ticks[0])

    ticks.push(new Date(2*ticks[ticks.length-1]-ticks[ticks.length-2]))

    rectDrawingAlgorinm(ticks)

    dateToHours()
}

const drawBottomRect = (num,  time, red) => {
    let ln = 0
    if (nums[nums.length-1]) ln = nums[nums.length-1]
    time = time.toLocaleTimeString()

    const svgContainer = d3.select("body").append("svg")
    .attr("width", cords.x(num-ln))
    .attr("height", 15)
    .attr('transform', `translate(${  margin.left },${ 0 })`)

    const circleAttributes = svgContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", cords.x(num-ln))
    .attr("height", 15 )
    .attr('fill', red? 'red': 'blue')

    //console.log(time)

    const txt = svgContainer.append('text')
    .attr("x", '50%')
    .attr("y", '50%')
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .text(time.slice(6, 8)==='00'? time.slice(0, 5): time)

}

const getDateFromHours = (time) => {
    time = time.split(':');
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);            
}

const rectDrawingAlgorinm = (ticks)=>{
    let i = 0
            let red = false
            nums = [0]

        for (let j = 0; j<ticks.length; j++){
            while (data[i] && data[i].time<ticks[j+1]){
                if (j===ticks.length-1) console.log('i =' + i)
                i +=1

            }
            if (!data[i]) i -=1

                if (i!==0) drawBottomRect(data[i].number, ticks[j], red)
                else drawBottomRect(data[i].number, ticks[j], red)
                red = !red
                nums.push(data[i].number)
        }
}

const drawArrow =  (svg, mode) => {
    width = 920 - margin.left - margin.right
    let color
    let dat
    if (mode ==='ask'){
      color = 'green'
      yCord = cords.y(data[data.length-1].avgAsk)
      text = data[data.length-1].avgAsk
    }
    else {
        color = 'red'
        yCord = cords.y(data[data.length-1].avgBid)
        text = data[data.length-1].avgBid
}
    
    const arrow = svg
    .append('svg')
    .attr('x', width)
    .attr('y', yCord-8)
    .attr('width', 100)
    .attr('height', 16)

    const poly = arrow.append('polygon')
    .attr("points", "0,8 10,16, 100,16, 100,0  10,0")
    .style("fill", color)

    const txt = arrow.append('text')
    .attr("x", '50%')
    .attr("y", '50%')
    .attr('dominant-baseline', 'middle')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '8px')
    .text(text)
}

const drawLable = (svg)=> {
    const bid = data[data.length-1].avgBid
    const ask = data[data.length-1].avgAsk
    let lable = svg
    .append('svg')
    //.attr('x', 0)
    //.attr('y', 0)
    .attr('width', 500)
    .attr('height', 20)

    let txt = lable.append('text')
    .attr("x", 10)
    .attr("y", '50%')
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'blue')
    .attr('font-size', '14px')
    .text(`ETH_BTC`)

    txt = lable.append('text')
    .attr("x", 80)
    .attr("y", '50%')
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'black')
    .attr('font-size', '14px')
    .text(`${bid.toFixed(5)}/${ask.toFixed(5)}`)

    txt = lable.append('text')
    .attr("x", 190)
    .attr("y", '50%')
    .attr('dominant-baseline', 'middle')
    .attr('fill', (bid-ask)>0? 'red': 'green')
    .attr('font-size', '14px')
    .text(`${(bid-ask)>0? '+': ''}${(bid-ask).toFixed(8)} (${(bid-ask)>0? '+': ''}${((bid-ask)/bid).toFixed(8)}%)`)
}
