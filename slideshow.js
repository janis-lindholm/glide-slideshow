var glide = glide || {};

glide.duration = 2000;

glide.pix = [
    "pics/walter.jpg",
    "pics/163_by_e4v.jpg",
    "pics/A_Little_Quetzal_by_vgerasimov.jpg",
    "pics/Aeg_by_Tauno_Erik.jpg",
    "pics/Arboreal_ballet_by_Bob_Farrell.jpg",
    "pics/Aubergine_Sea_by_Wyatt_Kirby.jpg",
    "pics/Backyard_Mushrooms_by_Kurt_Zitzelman.jpg",
    "pics/Bay.jpg",
    "pics/Beach_by_Renato_Giordanelli.jpg",
    "pics/Begonia_by_fatpoint21.jpg",
    "pics/Below_Clouds_by_kobinho.jpg",
    "pics/Berries_by_Orb9220.jpg",
    "pics/Berries_by_Tom_Kijas.jpg",
    "pics/Bird_by_Magnus.jpg"
];

glide.max = glide.pix.length - 1;
glide.i = -1;
glide.svg;

glide.nextPic = function () {
    if (glide.i == glide.max) {
        glide.i = 0;
    } else {
        glide.i++;
    }
    return [{"key": glide.i, "src": glide.pix[glide.i]}];
};

glide.prevPic = function () {
    if (glide.i == 0) {
        glide.i = glide.max;
    } else {
        glide.i--;
    }
    return [{"key": glide.i, "src": glide.pix[glide.i]}];
};

glide.key = function (d) {
    return d.key;
};

glide.calcImgPosAndDims = function (img) {

    var height, width, x, y;

    if (img != null) {
        var h = img.naturalHeight;
        var w = img.naturalWidth;

        var wh = window.innerHeight;
        var ww = window.innerWidth;

        if (h <= wh && w <= ww) {          // image fits
            height = h;
            width = w;
        } else {                           // scale
            var widthScale = ww / w;
            var heightScale = wh / h;
            var scale = Math.min(widthScale, heightScale);
            width = Math.round(w * scale);
            height = Math.round(h * scale);
        }

        x = (ww - width) / 2;
        y = (wh - height) / 2;
    }

    return {"width": width, "height": height, "x": x, "y": y};
};

glide.loadPic = function (nextPicSpec, pics) {
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", function(d) { return d.src })
           .attr("id", function(d) { return "pic_" + d.key })
           .transition()
           .duration(glide.duration)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);
    };
    img.src = nextPicSpec[0].src;
}

glide.setupCanvas = function () {
    glide.svg = d3.select("body")
                  .append("svg")
                  .attr("width", window.innerWidth)
                  .attr("height", window.innerHeight)
                  .attr("id", "canvas")
                  .attr("class", "canvas");
};

glide.nextSlide = function () {
    // get pic...
    var nextPicSpec = glide.nextPic();

    // show slide...
    glide.showSlide(nextPicSpec);
};

glide.prevSlide = function () {
    // get pic...
    var nextPicSpec = glide.prevPic();

    // show slide...
    glide.showSlide(nextPicSpec);
};

glide.showSlide = function (nextPicSpec) {

    // select pics
    var pics = glide.svg.selectAll("image")
                        .data(nextPicSpec, glide.key);

    // remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(glide.duration)
        .attr("x", window.innerWidth + 10)
        .remove();

    // load new pic
    glide.loadPic(nextPicSpec, pics);
};

// On click on body:
d3.select("body").on("click", function(e) {
    glide.nextSlide();
});

// On key press:
document.onkeypress = function (e) {
    e = e || window.event;
    switch (e.key) {
    case " ":   // Space
        glide.nextSlide();
      break;
    case "Backspace":
      glide.prevSlide();
      break;
    case "ArrowDown":
      glide.prevSlide();
      break;
    case "ArrowUp":
      glide.nextSlide();
      break;
    case "ArrowLeft":
      glide.prevSlide();
      break;
    case "ArrowRight":
      glide.nextSlide();
      break;
    case "Enter":
      glide.nextSlide();
      break;
    default:
      return;
  }
};

// On page load:
glide.setupCanvas();
glide.nextSlide();
