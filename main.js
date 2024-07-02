
const color_mixer = document.getElementById("colorMixer");

const size_slider = document.getElementById("sizeSlider");
const opacity_slider = document.getElementById("opacitySlider");

let brush_size = 6;
let opacity = 1;

document.body.onload = () =>
{
    console.log("loaded");
    size_slider.value = brush_size;
    opacity_slider.value = opacity * 10;

    let color_tray = document.getElementById("colorTray");

    let colors = ["black", "white", "red", "green", "blue", "cyan", "magenta", "yellow", "orange", "purple"];

    for (let i = 0; i < 10; i++)
    {
        let newButt = document.createElement("button");

        newButt.style.background = colors[i];
        newButt.style.height = "25px";
        newButt.style.width = "25px";
        color_tray.appendChild(newButt);

        newButt.onclick = () => {brush_color = newButt.style.background; color_mixer.value = getHexColor(newButt.style.background)};
        
    }

    var rect = everything.getBoundingClientRect();
    offsetL = rect.x + container.offsetLeft + window.scrollX;
    offsetT = rect.y + container.offsetTop + window.scrollY;
}

const bg_canvas = document.getElementById("backgroundCanvas");
const canvas = document.getElementById("drawCanvas");
const overlay_canvas = document.getElementById("strokeCanvas");

const container = document.getElementById("canvasContainer");

const everything = document.getElementById("content");

w = 800;
h = 600;

bg_canvas.width = w;
bg_canvas.height = h; 

canvas.width = w;
canvas.height = h;

overlay_canvas.width = w;
overlay_canvas.height = h;

container.style.width = w + "px";
container.style.height = h + "px";

const context = canvas.getContext("2d", {"willReadFrequently": true});
const scontext = overlay_canvas.getContext("2d");

let tool = "pen";




let is_drawing = false;
let brush_color = "black";


var rect = everything.getBoundingClientRect();

let offsetL = rect.x + container.offsetLeft;
let offsetT = rect.y + container.offsetTop;

let undo_arr = [];
let redo_arr = [];


function beginDraw(e)
{
    let x, y;
    if (e.type == "touchstart")
    {
        x = e.changedTouches[0].clientX - offsetL + window.scrollX;
        y = e.changedTouches[0].clientY - offsetT + window.scrollY;
    }
    else
    {
        x = e.layerX;
        y = e.layerY;
    }
    
    switch (tool)
    {
        default:
            break;
        case "pen":

            is_drawing = true;

            context.beginPath();
            context.moveTo(x, y);

            scontext.beginPath();
            scontext.moveTo(x, y);

        break;
        
        case "eraser":

            is_drawing = true;

            context.beginPath();
            context.moveTo(x, y);
        break;

        case "eyedropper":
            let data = context.getImageData(x, y, 1, 1).data;
            brush_color = `rgb(${data[0]},${data[1]},${data[2]})`;
            color_mixer.value = getHexColor(brush_color);
            tool = "pen";
        break;

    }

    e.preventDefault();
}

function stopDraw(e)
{
    if (is_drawing)
    {
        let x, y;
        if (e.type == "touchend")
        {
            x = e.changedTouches[0].clientX - offsetL + window.scrollX;
            y = e.changedTouches[0].clientY - offsetT + window.scrollY;
        }
        else
        {
            x = e.layerX;
            y = e.layerY;
        }
        is_drawing = false;
        switch (tool)
        {
            case "pen":
                context.lineTo(x, y);
                context.stroke();
                context.closePath();

                scontext.stroke();
                scontext.closePath();
                scontext.clearRect(0, 0, canvas.width, canvas.height);
            
            break;

            case "eraser":
                context.lineTo(x, y);
                context.stroke();
                context.closePath();

            break;
        }
        undo_arr.push(context.getImageData(0,0,canvas.width, canvas.height));
        redo_arr.length = 0;
    }
    
    e.preventDefault();
}

function Draw(e)
{   
    if (is_drawing)
    {   
        let x, y;
        if (e.type == "touchmove")
        {
            x = e.changedTouches[0].clientX - offsetL + window.scrollX;
            y = e.changedTouches[0].clientY - offsetT + window.scrollY;
        }
        else
        {
            x = e.layerX;
            y = e.layerY;
        }

        switch (tool)
        {
            case "pen":
                context.strokeStyle = brush_color;
                context.lineCap = "round";
                context.lineJoin = "round";
                context.lineWidth = brush_size;
                context.lineTo(x, y);
                
                scontext.strokeStyle = brush_color;
                
                scontext.lineCap = "round";
                scontext.lineJoin = "round";
                scontext.lineWidth = brush_size;
                scontext.lineTo(x, y);
                scontext.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);
                scontext.stroke();
        
            break;

            case "eraser":
                context.strokeStyle = "white";
                context.lineCap = "round";
                context.lineJoin = "round";
                context.lineWidth = brush_size;

                
                context.lineTo(x, y);
                context.stroke();
            break;
        }
    }
    e.preventDefault();
}

overlay_canvas.addEventListener("mousedown", beginDraw);
overlay_canvas.addEventListener("mouseup", stopDraw);
overlay_canvas.addEventListener("mousemove", Draw);
overlay_canvas.addEventListener("mouseout", stopDraw);

overlay_canvas.addEventListener("touchstart", beginDraw);
overlay_canvas.addEventListener("touchend", stopDraw);
overlay_canvas.addEventListener("touchmove", Draw);
//overlay_canvas.addEventListener("touchcancel", stopDraw);

overlay_canvas.addEventListener('contextmenu', event => event.preventDefault());

function clearCanvas()
{
    context.clearRect(0, 0, canvas.width, canvas.height);
    undo_arr.push(context.getImageData(0,0,canvas.width, canvas.height));
    redo_arr.length = 0;
}

function changeColor(element)
{
    brush_color = element.style.background;
}

function changeSize(element)
{
    brush_size = element.value;
}

function changeOpacity(element)
{
    opacity = element.value / 10;
    context.globalAlpha = opacity;
    scontext.globalAlpha = opacity;
}

function undo()
{
    if (undo_arr.length > 1)
    {
        redo_arr.push(undo_arr.pop());
        context.putImageData(undo_arr[undo_arr.length - 1], 0, 0);
    }
    else if (undo_arr.length > 0)
    {
        redo_arr.push(undo_arr.pop());
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function redo()
{
    if (redo_arr.length > 0)
    {
        context.putImageData(redo_arr[redo_arr.length - 1], 0, 0);
        undo_arr.push(redo_arr.pop());
    }
}




window.addEventListener("keydown", (event) => {

    if (event.ctrlKey)
    {
        if (event.code == "KeyZ")
        {
            if (!event.shiftKey)
            {
                undo();
            }
            else
            {
                redo();
            }
        }
        if (event.code == "KeyS")
        {
            
        }
    }
    else
    {
        if (event.code == "KeyE")
        {
            tool = "eraser";
            context.globalCompositeOperation="destination-out";

        }
        if (event.code == "KeyD")
        {
            tool = "pen";
            context.globalCompositeOperation="source-over";
        }
        if (event.code == "KeyI")
        {
            tool = "eyedropper";
        }
    }
} )

function addPaletteButton()
{
    let color_tray = document.getElementById("colorTray");
    let newButt = document.createElement("button");

    newButt.style.background = color_mixer.value;
    newButt.style.height = "25px";
    newButt.style.width = "25px";
    color_tray.appendChild(newButt);

    newButt.onclick = () => {brush_color = newButt.style.background; color_mixer.value = getHexColor(newButt.style.background)};
}


function getHexColor(colorStr) {
    var a = document.createElement('div');
    a.style.color = colorStr;
    var colors = window.getComputedStyle( document.body.appendChild(a) ).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
    document.body.removeChild(a);
    return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
}


window.addEventListener("resize", () => {
    
    var rect = everything.getBoundingClientRect();

    offsetL = rect.x + container.offsetLeft;
    offsetT = rect.y + container.offsetTop;
});