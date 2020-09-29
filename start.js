const moveLeft = ()=> pl.moveLeft()
const moveRight = ()=> pl.moveRight()
const sizePlus = ()=> pl.sizePlus()
const sizeMinus = ()=> pl.sizeMinus()

const factory = (plotType, data, size, margin, exhangeType)=> { 
    let plot
    console.log(size)
    switch (plotType) {
        case 'tick': { plot = new TickPlot(data, size, margin, exhangeType); break}
        //case 'plotType': {plot = new plotTypePlot(params); break }
        default: console.log(`${plotType} is not valid plot type`)
    }
    return plot
}

class AbstractPlot {
    constructor (data, size, margin){
        this.data = data
        this.size = size
        this.margin = margin
    }
    nums = [0]
    cords = undefined
    ticks = undefined
    svg = undefined
    min = undefined
    max = undefined

    get cords() {return this.cords}
    get svg() {return this.svg}

    calculateCords() { 

        const x = d3.scaleLinear()
        .range([0, this.size.width])
        .domain([0, this.data.length-1])

        const y = d3.scaleLinear()
        .range([ this.size.height, 0 ])
        .domain([ this.min, this.max ] )

        const z = d3.scaleBand()
        .range([0, this.size.width])
        .domain( this.calculateZ() )
        this.cords =  {x: x, y: y, z: z}
    }
    
    calculateZ() {
        const interval = Math.floor( (this.data.length)/5)
        const points = []
        for (let i = 0; i<(this.data.length); i += 1 ){
            if (this.data[i] && i%interval===0) points.push(this.data[i].time.toLocaleTimeString())
        }
        return points
    }

    calculateMinMax() {
        this.max = Math.max(d3.max(this.data, d => d.avgBid), d3.max(this.data, d => d.avgAsk))
        this.min = Math.min(d3.min(this.data, d => d.avgBid), d3.min(this.data, d => d.avgAsk))
        const bidAskSaldo = this.max-this.min
        this.max += bidAskSaldo/10
        this.min -= bidAskSaldo/10
    }

    svgInit() {
        this.svg = d3.select('.chart')
        .append('svg')
        .attr('width', this.size.width + this.margin.left + this.margin.right)
        .attr('height', this.size.height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr('transform', `translate(${ this.margin.left },${ this.margin.top })`)
    }

    ticksInit() {
        const timeScale = d3.scaleTime()
        .domain([this.data[0].time, this.data[this.data.length-1].time])
    
        const axis = d3.axisBottom(timeScale)
    
        this.ticks = timeScale.ticks(6)
    
        this.ticks.push(new Date(2*this.ticks[this.ticks.length-1]-this.ticks[this.ticks.length-2]))
    }

    dateTransform()  {
        this.data.forEach((element, index)=>{
            this.data[index].time = new Date(this.data[index].time)
        })
    }

    globalInit() {
        d3.selectAll('svg').remove()
        this.dateTransform()
        this.calculateMinMax()
        this.calculateCords()
        this.svgInit()
        this.ticksInit()
    }


    drawAxisAndBorad() {
        const xAxis = d3.axisBottom(this.cords.z)
        .ticks(6) 
        .tickSize(-this.size.height  ) 
        .tickPadding(10)
        .tickFormat((d) => '')
    
        const yAxis = d3.axisLeft(this.cords.y) 
        .ticks(6) 
        .tickSize( this.size.width  ) 
        .tickPadding( -50 - this.size.width)
        .tickFormat(d => '' )
    
        const tAxis = d3.axisTop(this.cords.x).ticks(0).tickFormat(d => '').tickSizeOuter(0)
        this.svg.append('g').call(tAxis)
        const lAxis = d3.axisLeft(this.cords.y).ticks(0).tickFormat(d => '').tickSizeOuter(0)
        this.svg.append('g').call(lAxis)
    
        this.svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${ this.size.height  })`) 
        .call(xAxis)
    
        this.svg.append('g')
        .attr('class', 'axis y-axis')
        .attr('transform', `translate(${ this.size.width }, 0)`)
        .call(yAxis)
    
        this.svg.append('g')
        .attr('transform', `translate(0 ,${ this.size.height })`)
        .call(d3.axisBottom(this.cords.z)
        .tickSizeOuter(0))
    
        this.svg.append('g')
        .attr('transform', `translate( ${ this.size.width } , 0)`)
        .call(d3.axisRight(this.cords.y)
        .tickSizeOuter(0)
        .ticks(6))
    }

    lineConstructor(lineGenerator, data, color = 'black') {
        this.svg
        .selectAll('svg')
        .data(data)
        .enter()
        .append('path')
        .attr('d', (d)=> lineGenerator(d) )
        .attr('class', 'line')
        .attr('stroke', color )
    }

    rectDrawingAlgorinm() {
        let i = 0
        let red = false
        this.nums = [0]
        for (let j = 0; j<this.ticks.length; j++){
             while (this.data[i] && this.data[i].time<this.ticks[j+1]){
                if (j===this.ticks.length-1) console.log('i =' + i)
                i +=1

            }
            if (!this.data[i]) i -=1
                if (i!==0) this.drawBottomRect(this.data[i].number, this.ticks[j], red)
                else this.drawBottomRect(this.data[i].number, this.ticks[j], red)
                red = !red
                this.nums.push(this.data[i].number)
        }
    }

    drawBottomRect = (num,  time, red) => {
        let ln = 0
        if (this.nums[this.nums.length-1]) ln = this.nums[this.nums.length-1]
        time = time.toLocaleTimeString()
    
        const svgContainer = d3.select("body").append("svg")
        .attr("width", this.cords.x(num-ln))
        .attr("height", 15)
        .attr('transform', `translate(${  this.margin.left },${ 0 })`)
    
        const rectAttributes = svgContainer
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.cords.x(num-ln))
        .attr("height", 15 )
        .attr('fill', red? 'red': 'blue')
    
        const txt = svgContainer.append('text')
        .attr("x", '50%')
        .attr("y", '50%')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text(time.slice(6, 8)==='00'? time.slice(0, 5): time)
    
    }


}

class TickPlot extends AbstractPlot {
    constructor (data, size, margin, exhangeType) {
        super(data, size, margin )
        this.exhangeType = exhangeType
    }

    draw(data)  {
        if (data) this.data = data
        super.globalInit()
        super.drawAxisAndBorad()
        this.drawLines()
        this.drawArea()
        this.drawLable()
        super.rectDrawingAlgorinm()
        if (Math.abs(super.cords.y(this.data[this.data.length-1].avgAsk)-super.cords.y(this.data[this.data.length-1].avgBid))>=16){
            this.drawArrow('ask')
            this.drawArrow('bid')
            }
        
    }

    drawArea() {
        const defs = super.svg.append("defs");

        const gradient = defs.append("linearGradient")
        .attr('id', 'svgGradient')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%')
    
        gradient.append('stop')
        .attr('class', 'start')
        .attr('offset', '0%')
        .attr('stop-color','red')
        .attr('stop-opacity', 0.5)
    
        gradient.append('stop')
        .attr('class', 'end')
        .attr('offset', '100%')
        .attr('stop-color', 'yellow')
        .attr('stop-opacity', 0.5)

        const area = d3.area()
        .x((d)=>  super.cords.x(d.number))
        .y0((d)=> super.cords.y(d.avgBid))
        .y1((d)=> super.cords.y(d.avgAsk))
    
        const arr = area(this.data)
        super.svg
        .selectAll('svg')
        .data([0])
        .enter()
        .append('path')
        .attr('fill', 'url(#svgGradient)')
        .attr('d', arr)
     }

    drawLable() {
        const bid = this.data[this.data.length-1].avgBid
        const ask = this.data[this.data.length-1].avgAsk
        let lable = super.svg
        .append('svg')
        .attr('width', 500)
        .attr('height', 20)
    
        let txt = lable.append('text')
        .attr("x", 10)
        .attr("y", '50%')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'blue')
        .attr('font-size', '14px')
        .text(this.exhangeType)
    
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

    drawLines() {
        const asks = new Array(this.data.length)
        const bids = new Array(this.data.length)

        let lineGenerator = d3.line()
        .x(d => super.cords.x(d.number))
        .y(d => super.cords.y(d.value))
        
        this.data.forEach((el, index) => {
            asks[index] = {value: this.data[index].avgAsk, number: this.data[index].number}
        })
        this.data.forEach((el, index) => {
            bids[index] = {value: this.data[index].avgBid, number: this.data[index].number}
        })
        super.lineConstructor(lineGenerator, [bids], 'red')
        super.lineConstructor(lineGenerator, [asks], 'green')
    }

    drawArrow(mode) {
        let color
        let yCord
        let text
        if (mode ==='ask'){
          color = 'green'
          yCord = super.cords.y(this.data[this.data.length-1].avgAsk)
          text = this.data[this.data.length-1].avgAsk
        }
        else {
            color = 'red'
            yCord = super.cords.y(this.data[this.data.length-1].avgBid)
            text = this.data[this.data.length-1].avgBid
        }
        
        const arrow = super.svg
        .append('svg')
        .attr('x', this.size.width)
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

    
}

class Plot {
    constructor (url, queryParam , size, margin ) {
        this.url = url
        this.size = size
        this.margin = margin
        this.queryParam = queryParam
    }
    border =  {leftBorder: 950, rightBorder:1050, max: 1050, min: 0 }
    allData = undefined
    data = undefined
    plot = undefined

    queryBuileder = ()=> {
        //return this.url + '/' + this.queryParam.exhangeType + '/' + this.queryParam.plotType
        return this.url
    }

    updateData = (newData)=> {
        const l = this.allData.length
        this.allData = this.allData.slice(20, l)
        this.allData = this.allData.concat(newData)
    }

    dateInit() {
        for (let i = 0; i<this.data.length; i++) {this.data[i].number = i 
        }
    }

    calculateData = () =>{
        this.data = this.allData.slice(this.border.leftBorder, this.border.rightBorder)
        this.dateInit()
    }

    moveRight = ()=> {
        const borderLength = this.border.rightBorder - this.border.leftBorder
        if (this.cheakBorder(borderLength/5)){
            this.border.rightBorder += borderLength/5
            this.border.leftBorder += borderLength/5
        }
        this.calculateData()
        this.draw(this.data)
    }

    moveLeft = ()=> {
        const borderLength = this.border.rightBorder - this.border.leftBorder
        if (this.cheakBorder(-borderLength/5)){
            this.border.rightBorder -= borderLength/5
            this.border.leftBorder -= borderLength/5
        }
        this.calculateData()
        this.draw(this.data)
    }
    
    sizePlus = ()=> {
        const borderLength = this.border.rightBorder - this.border.leftBorder
        if (this.cheakBorderSize(-borderLength/5)){
            this.border.leftBorder += borderLength/5
        }
        this.calculateData()
        this.draw(this.data)
    }
    
    sizeMinus = ()=> {
        const borderLength = this.border.rightBorder - this.border.leftBorder
        if (this.cheakBorderSize(borderLength/4)){
            this.border.leftBorder -= borderLength/4
        }
        this.calculateData()
        this.draw(this.data)
    }
    
    cheakBorderSize = (k)=>{
        if (Math.abs(k)<4 && k<0){
            return false
        }
            if  ( this.border.leftBorder-k<this.border.min) return false 
        return true
    }
    
    cheakBorder = (k) =>{
        if (this.border.leftBorder+k<this.border.min || this.border.rightBorder+k>this.border.max) return false
        return true
    }

    createPlot = () => {
        this.plot = factory(this.queryParam.plotType, this.data, this.size, this.margin, this.queryParam.exhangeType)
    }

    draw = () => {
        if (this.plot) this.plot.draw(this.data)
    }

    start = () => {
        const ws = new WebSocket(this.queryBuileder())
        let open = false
        console.log('started')
        ws.onopen = ()=> {
            console.log('open')
            open = true
            //this.size.width = this.size.width - this.margin.left - this.margin.right
           // this.size.height = this.size.height - this.margin.top - this.margin.bottom
        }

        ws.onmessage = (data)=> {console.log('messege')
            data = JSON.parse(data.data)
            if (!this.allData) {this.allData = data
                this.calculateData()
                this.createPlot()
                this.draw(this.data)
            }
            else {this.updateData(data)
                this.calculateData()
                this.draw(this.data)
            }
            setInterval(() => {
                if (open) ws.send('0')
            }, 30)
        }
        ws.onclose = ()=> {console.log('closed'); open = false}
        }
}

pl = new Plot('wss://still-tor-75666.herokuapp.com',
{ exhangeType: 'ETH_BTC', plotType: 'tick' }, 
{width: 790, height: 320}, 
{ top: 20, right: 50, bottom: 50, left: 100 })
pl.start()