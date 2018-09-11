function loadRUBData() {
    // Create new object XMLHttpRequest
    let xhr;
    
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    
    let days = 430000;
    let to = Math.floor(Date.now() / 1000);
    let from = to - days;
    
    /*Object.defineProperty(document, "referrer", {get : function(){ return "my new referrer"; }});*/
    
    let urlRUB = `https://charts.forexpf.ru/html/tw/history?symbol=29&resolution=5&from=${from}&to=${to}`;
    
    //Make the configuration: GET-request on URL posted below
    xhr.onreadystatechange = function() {
        if (xhr.status === 200 && xhr.readyState === 4) {
            let value = JSON.parse(xhr.responseText);
            let parsedInfo = value;
            getChart(parsedInfo);
        }
    }
    xhr.open("GET", urlRUB);
    xhr.send();
}
function loadBYNData(parsedRUBInfo) {
    let xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    
    let currentDate = Date.now();
    let urlBYN = `https://bcse.by/ru/instruments/tradegraph?instrumentId=1077&field=Rate&daysBackward=7&payTerm=&_=${currentDate}`;
    
    //Make the configuration: GET-request on URL posted below
    xhr.onreadystatechange = function() {
        if (xhr.status === 200 && xhr.readyState === 4) {
            let value = JSON.parse(xhr.responseText);
            let parsedBYNRate = value;
            getChart(parsedRUBInfo, parsedBYNRate);
        }
    }
    xhr.open("GET", urlBYN);
    xhr.send();
}
function getChart(parsedRUBInfo){
    let ctx;
    let x = 0;
    let y = 0;
    let delta = 0;
    let scale = 1;
    let cellSize = 4;
    let canvasChartGrid;
    let canvasChartAxisY;
    let canvasChartAxisX;
    Number.prototype.pad = function(size) {
        let s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }
    function drawChartGrid() {
        canvasChartGrid = document.getElementById('chart_grid');
        canvasChartGrid.width = cellSize * 800;
        canvasChartGrid.height = cellSize * 400;
        ctx = canvasChartGrid.getContext('2d');
        
        drawGrid(delta, ctx, canvasChartGrid);
        drawRateChart(delta, ctx, canvasChartGrid);
        drawChartMarkupDataAxis();
        drawChartMarkupPriceAxisY();
        
        canvasChartGrid.addEventListener('mousedown', mouseDown);
        function mouseDown(event) {
            let canvasElemX = event.pageX - canvasChartGrid.getBoundingClientRect().left + pageXOffset - delta - canvasChartGrid.offsetLeft - canvasChartGrid.clientLeft - canvasChartGrid.scrollLeft;
            
            canvasChartGrid.addEventListener('mousemove', mouseMove);
            function mouseMove(event) {
                ctx = canvasChartGrid.getContext('2d');
                canvasChartGrid.style.cursor = 'grabbing';
                let canvasElemX2 = event.clientX - canvasChartGrid.getBoundingClientRect().left + pageXOffset;
                
                delta = canvasElemX2 - canvasElemX;
                
                ctx.clearRect(x, y, canvasChartGrid.width, canvasChartGrid.height);
                drawGrid(delta, ctx, canvasChartGrid);
                drawRateChart(delta, ctx, canvasChartGrid);
                
                ctx = canvasChartAxisX.getContext('2d');
                ctx.clearRect(x, y, canvasChartAxisX.width, canvasChartAxisX.height);
                drawChartMarkupDataAxis()
            }
            
            canvasChartGrid.addEventListener('mouseup', mouseUp);
            function mouseUp() {
                canvasChartGrid.style.cursor = 'crosshair';
                canvasChartGrid.removeEventListener('mousemove', mouseMove);
            }                        
        }
        canvasChartGrid.addEventListener('wheel', mouseWheel); 
        function mouseWheel(event){
            ctx = canvasChartGrid.getContext('2d');
            let dX = event.wheelDelta;
            if (dX < 0 && scale > 0.0625){
                scale -= 0.03125;
            } 
            else if (scale < 1 && dX > 0){
                scale += 0.03125;
            }
            ctx.clearRect(x, y, canvasChartGrid.width, canvasChartGrid.height);
            drawGrid(delta, ctx, canvasChartGrid);
            drawRateChart(delta, ctx, canvasChartGrid);
            
            ctx = canvasChartAxisY.getContext('2d');
            ctx.clearRect(x, y, canvasChartAxisY.width, canvasChartAxisY.height);
            drawChartMarkupPriceAxisY()
            
            ctx = canvasChartAxisX.getContext('2d');
            ctx.clearRect(x, y, canvasChartAxisX.width, canvasChartAxisY.height);
            drawChartMarkupDataAxis()
            
            event.preventDefault();
        }
    }
    function drawGrid(delta, ctx, canvasElem){
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x, y, canvasChartGrid.width, canvasChartGrid.height); 
        ctx.strokeStyle = '#D3D3D3';
        ctx.lineWidth = 2;
        let stepX = 160;
        let stepY = 40;
        let step2 = stepX;
        let i = 0;
        
        for (let j = parsedRUBInfo['o'].length - 1; j >= 0; j--){
            if (scale <= 0.75 && scale > 0.375){
                stepX = 320;
            }
            else if (scale <= 0.375 && scale > 0.125){
                stepX = 800;
            }
            else if (scale <= 0.125 && scale >= 0.1875){
                stepX = 1600;
            }
            else if (scale <= 0.1875 && scale > 0.09375){
                stepX = 1600;
            }
            else if (scale <= 0.09375 && scale >= 0){
                stepX = 3200;
            }
            ctx.beginPath();
            ctx.moveTo(canvasElem.width - i * scale + delta - 200, y);
            ctx.lineTo(canvasElem.width - i * scale + delta - 200, canvasElem.height);
            ctx.stroke();
            i += stepX;
        }
        for (let j = 0; j <= canvasElem.height; j += stepY){
            ctx.beginPath();
            ctx.moveTo(x, j * 2);
            ctx.lineTo(canvasElem.width, j * 2);
            ctx.stroke();
        }
    }
    function drawRateChart(delta, ctx, canvasElem) {
        let x;
        let y;
        let width;
        let height;
        let maxRate;
        let minRate
        let i = 0;
        let openRate = 0;
        let closeRate = 0;
        let stepY = 16 * scale; // 0,001 RUB = 16px
        let stepX = 40; // 1 min = 80px
        ctx.strokeStyle = '#000' // black border
        ctx.lineWidth = 2;
        
        maxRate = Number((Math.max.apply(null, parsedRUBInfo['o'], parsedRUBInfo['c'])).toFixed(1));
        minRate = Math.floor(Math.min.apply(null, parsedRUBInfo['o'], parsedRUBInfo['c']));

        let deltaRate = maxRate - minRate; // 2
        let sumTotalPoints = canvasElem.height / stepY; // 100
        let stepPoint = deltaRate / sumTotalPoints; // 0,02

        let stepPoint2 = stepPoint;
        let stepY2 = stepY;

        let array = [];

        while(stepPoint2 <= deltaRate) {
            array.push(canvasElem.height - stepY2)
            stepY2 += stepY;
            stepPoint2 += stepPoint;
        }

        for (let j = parsedRUBInfo['o'].length - 1; j >= 0; j--) {
            ctx.fillStyle = '#FF0000'; // red color

            openRate = parsedRUBInfo['o'][j];
            closeRate = parsedRUBInfo['c'][j];

            let deltaOpenRate = openRate - minRate;
            let deltaCloseRate = closeRate - minRate;

            let arrayPosition = deltaOpenRate / stepPoint;
            
            
            let arrayPositionInt = Math.round((arrayPosition * 100) / 100);
            
            let deltaArrayPosition = arrayPosition - arrayPositionInt;
            
            let arrayPosition2= Math.round(((deltaArrayPosition * stepY) * 100) / 100) ;

            if (deltaCloseRate > deltaOpenRate) {
                arrayPosition = deltaCloseRate / stepPoint;
                arrayPositionInt = Math.round((arrayPosition * 100) / 100);
                
                deltaArrayPosition = arrayPosition - arrayPositionInt;
                
                arrayPosition2= Math.round(((deltaArrayPosition * stepY) * 100) / 100);
            }

            let deltaOpenCloseRate = deltaOpenRate - deltaCloseRate;

            if (closeRate > openRate){
                ctx.fillStyle = '#00FF00'; // green color
                deltaOpenCloseRate = deltaCloseRate - deltaOpenRate;
            }

            y = array[arrayPositionInt] - arrayPosition2;
            x = canvasElem.width - 200 - i * 4 * scale + delta - stepX * scale;
            width = stepX * 2 * scale;
            height = Math.round(((deltaOpenCloseRate / stepPoint) * stepY) * 100 / 100);

            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);

            i+= stepX;
        }
        /*drawBYNRateChart(delta, ctx, canvasElem);*/
    }
    /*function drawBYNRateChart(delta, ctx, canvasElem){
        let x;
        let y;
        let width;
        let height;
        let i = 0;
        let openRate = 0;
        let closeRate = 0;
        let stepY = 16 * scale; // 0,001 RUB = 16px
        let stepX = 50; // 1 min = 80px
        ctx.strokeStyle = '#000' // black border
        ctx.lineWidth = 2;
        
        let rateBYN = [];
        let maxBYNRate;
        let minBYNRate;
        
        for (let a = 0; a < parsedBYNInfo[0]['graphPoints'].length; a++){
            rateBYN.push(parsedBYNInfo[0]['graphPoints'][a]['value'])       
        }
        
        maxBYNRate = Number((Math.max.apply(null, rateBYN)).toFixed(3));
        minBYNRate = Math.floor(Math.min.apply(null, rateBYN));
            
        let deltaRate = maxBYNRate - minBYNRate; // 2
        let sumTotalPoints = canvasElem.height / stepY / 2; // 100
        let stepPoint = deltaRate / sumTotalPoints; // 0,02
        
        let stepPoint2 = stepPoint;
        let stepY2 = stepY;

        let array = [];

        while(stepPoint2 <= deltaRate) {
            array.push(canvasElem.height - stepY2)
            stepY2 += stepY;
            stepPoint2 += stepPoint;
        }
        
        for (let q = parsedBYNInfo[0]['graphPoints'].length; q >= 0; q--) {
            ctx.fillStyle = '#da241c'; // red color

            y = array[arrayPositionInt];
            x = canvasElem.width - 200 - i * 4 * scale + delta - stepX * scale;
            width = stepX * 2 * scale;
            height = Math.round(((deltaOpenCloseRate / stepPoint) * stepY) * 100 / 100);
            ctx.beginPath();
            ctx.moveTo(x, y)
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(, y, width, height);
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size)
            ctx.lineTo(x, y + size)
            ctx.lineTo(x + size, y)
            ctx.fill()

            i+= stepX;
        }
    }
    */
    function drawChartMarkupPriceAxisY(){
        canvasChartAxisY = document.getElementById('chart_markup_price_axis');
        ctx = canvasChartAxisY.getContext('2d');
        canvasChartAxisY.width = cellSize * 32;
        canvasChartAxisY.height = cellSize * 400;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x, y, canvasChartAxisY.width, canvasChartAxisY.height);
        drawPrices(delta, ctx, canvasChartAxisY)
    }   
    function drawChartMarkupDataAxis(){
        canvasChartAxisX = document.getElementById('chart_markup_data_axis');
        ctx = canvasChartAxisX.getContext('2d');
        canvasChartAxisX.width = cellSize * 400;
        canvasChartAxisX.height = cellSize * 8;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x, y, canvasChartAxisX.width, canvasChartAxisX.height);
        drawTime(delta, ctx, canvasChartAxisX, parsedRUBInfo);
    }
    function drawPrices(delta, ctx, canvasElem){
        let maxRate = Number((Math.max.apply(null, parsedRUBInfo['o'], parsedRUBInfo['c'])).toFixed(1));
        let minRate = Math.floor(Math.min.apply(null, parsedRUBInfo['o'], parsedRUBInfo['c']));
        
        let stepY = 80;
        
        let deltaRate = maxRate - minRate; // 2
        let sumTotalPoints = canvasElem.height / stepY; // 20
        let stepPoint = deltaRate / sumTotalPoints; // 0,1
        
        ctx.strokeStyle = '#000';
        for (let j = 0; j < canvasElem.height; j += stepY / 2){
            ctx.beginPath();
            ctx.moveTo(x, j * 2);
            ctx.lineTo(canvasElem.width / 14 * scale, j * 2);
            ctx.fillStyle = "#505050";
            ctx.textAlign = 'medium';
            ctx.font = "30px Arial";
            ctx.fillText(maxRate.toPrecision(5), canvasElem.width / 6 , (j * 2 + 10));
            maxRate -= stepPoint;
            ctx.stroke();
        }
    }
    function drawTime(delta, ctx, canvasElem, parsedRUBInfo){
        ctx = canvasElem.getContext('2d');
        ctx.strokeStyle = '#000';
        let stepX = 80;
        let stepX2 = 0;
        let step2 = 0;
        let i = 0;
        let j = parsedRUBInfo['t'].length - 1;
        let stepJ = 1;
        for (j; j >= 0; j -= stepJ){
            if (scale <= 0.750 && scale > 0.375){ 
                stepX = 160;
                step2 = stepX;
                stepX2 = stepX / 8;
                stepJ = 2;
            }
            else if (scale <= 0.375 && scale > 0.125){
                stepX = 400;
                step2 = stepX;
                stepX2 = stepX / 5;
                stepJ = 5;
            }
            else if (scale <= 0.125 && scale > 0.1875){
                stepX = 400;
                step2 = stepX;
                stepX2 = stepX / 2;
                stepJ = 10;
            }
            else if (scale <= 0.1875 && scale > 0.09375){
                stepX = 800;
                step2 = stepX;
                stepX2 = stepX / 4.5;
                stepJ = 10;
            }
            else if (scale <= 0.09375 && scale >= 0){
                stepX = 1600;
                step2 = stepX;
                stepX2 = stepX / 4.2;
                stepJ = 20;        
            }
            ctx.beginPath();
            ctx.moveTo(canvasElem.width - i * scale + delta / 2 - 100, y);
            ctx.lineTo(canvasElem.width - i * scale + delta / 2 - 100, canvasElem.height / 6);
            ctx.fillStyle = "#505050";
            ctx.font = "15px Arial";
            if (j >= 0) {
                let time = new Date(parsedRUBInfo['t'][j] * 1000);
                let hours = time.getHours().pad(2);
                let minutes = time.getMinutes().pad(2);
                let timeContent = `${hours}:${minutes}`;
                if (hours === '00' && minutes === '00'){
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    ctx.font = 'bold 15px Arial';
                    let month = monthNames[time.getMonth()];
                    let day = time.getDay().pad(2);
                    timeContent = `${month}, ${day}`;
                }   
                ctx.fillText(timeContent, canvasElem.width - i * scale + delta / 2 - stepX / 4 + stepX2 - 100, canvasElem.height - canvasElem.height / 4);
                ctx.stroke();
                /*j -= stepJ;*/
                i += stepX;
            }    
        }
        ctx.stroke();
    }
    drawChartGrid();
}
loadRUBData();