var glide = glide || {};

/******************************************************************************
 *** Slideshow Param Defaults ***
 *****************************************************************************/
glide.param = {};
glide.param.name = "Slideshow";
glide.param.showDuration = 5000;
glide.param.animDuration = 2000;
glide.param.autoForward = true;
glide.param.animation = "SLIDE_RIGHT_AND_ZOOM_IN";

/******************************************************************************
 *** Internal Vars ***
 *****************************************************************************/
glide.picsJson = "pics.json";   // pic catalog path
glide.intervalId = null;
glide.animations = {};

/******************************************************************************
 *** Helper Functions ***
 *****************************************************************************/
glide.isScalar = function (obj) {
    return (/string|number|boolean/).test(typeof obj);
};

/******************************************************************************
 *** Glide Functions ***
 *****************************************************************************/
glide.nextPic = function () {
    if (glide.i == glide.max) {
        glide.i = 0;
    } else {
        glide.i++;
    }
    return [{"key": glide.i, "src": glide.dataset.pics[glide.i]}];
};

glide.prevPic = function () {
    if (glide.i == 0) {
        glide.i = glide.max;
    } else {
        glide.i--;
    }
    return [{"key": glide.i, "src": glide.dataset.pics[glide.i]}];
};

glide.key = function (d) {
    return d.key;
};

glide.calcImgPosAndDims = function (img) {

    var height, width, x, y;

    if (img != null) {  // new image
        glide.naturalHeight = img.naturalHeight;
        glide.naturalWidth = img.naturalWidth;
    }

    var wh = window.innerHeight;
    var ww = window.innerWidth;

    if (glide.naturalHeight <= wh && glide.naturalWidth <= ww) {  // image fits
        height = glide.naturalHeight;
        width = glide.naturalWidth;
    } else {    // scale
        var widthScale = ww / glide.naturalWidth;
        var heightScale = wh / glide.naturalHeight;
        var scale = Math.min(widthScale, heightScale);
        width = Math.round(glide.naturalWidth * scale);
        height = Math.round(glide.naturalHeight * scale);
    }

    x = (ww - width) / 2;
    y = (wh - height) / 2;

    return { "width": width,
             "height": height,
             "x": x,
             "y": y };
};

glide.updateParams = function () {
    Object.keys(glide.param).forEach(function(key, index) {
        if (glide.dataset.hasOwnProperty(key)) {
            var val = glide.dataset[key];
            if (glide.isScalar(val)) {
                console.log("Using custom slideshow param '" + key + "' : " + val);
                glide.param[key] = val;
            } else {
                console.log("Ignoring invalid slideshow param '" + key + "'.");
            }
        }
    });
};

glide.setupCanvas = function () {
    glide.svg = d3.select("body")
                  .append("svg")
                  .attr("width", window.innerWidth)
                  .attr("height", window.innerHeight)
                  .attr("id", "canvas");
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

    // select all image objects
    var pics = glide.svg.selectAll("image")
                        .data(nextPicSpec, glide.key);
    // show next pic using selected transition
    if (glide.animations.hasOwnProperty(glide.param.animation)) {
        glide.animations[glide.param.animation](nextPicSpec, pics);
    } else {
        console.log("Unknown transition '" + glide.param.animation + "'");
        glide.aniNone(nextPicSpec, pics);
    }
};

glide.picId = function (d) { return "pic_" + d.key };

glide.picSrc = function (d) { return d.src };

glide.aniNone = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", glide.picSrc)
           .attr("id", glide.picId)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);
    };
    img.src = nextPicSpec[0].src;
};

glide.aniNotImplemented = function (nextPicSpec, pics) {
    console.log("This animation is not yet implemented!");
    glide.aniNone(nextPicSpec, pics);
};

glide.aniZoomIn = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
           .append("image")
           .attr("xlink:href", glide.picSrc)
           .attr("id", glide.picId)
           .attr("width", 1)
           .attr("height", 1)
           .attr("x", window.innerWidth / 2)
           .attr("y", window.innerHeight / 2)
           .transition()
           .duration(glide.param.animDuration)
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);
    };
    img.src = nextPicSpec[0].src;
};

glide.aniSlideRight = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(glide.param.animDuration)
        .attr("x", window.innerWidth)
        .remove();

    // (2) load new pic
    var img = new Image();
    img.onload = function () {
        var posAndDims = glide.calcImgPosAndDims(img);
        pics.enter()
            .append("image")
            .attr("xlink:href", glide.picSrc)
            .attr("id", glide.picId)
            .attr("width", posAndDims.width)
            .attr("height", posAndDims.height)
            .attr("x", 0 - posAndDims.width)
            .transition()
            .duration(glide.param.animDuration)
            .attr("x", posAndDims.x);
    };
    img.src = nextPicSpec[0].src;
};

glide.registerAnimations = function () {
    glide.animations.NONE = glide.aniNone;
    glide.animations.ZOOM_IN = glide.aniZoomIn;
    glide.animations.PUZZLE = glide.aniNotImplemented;
    glide.animations.SLIDE_RIGHT = glide.aniSlideRight;
};

glide.startShow = function (data) {
    glide.dataset = data;
    glide.max = glide.dataset.pics.length - 1;
    glide.i = -1;
    glide.updateParams();
    glide.registerAnimations();
    glide.setupCanvas();
    glide.nextSlide();
    if (glide.param.autoForward) {
        glide.intervalId = setInterval(glide.nextSlide, glide.param.showDuration);
    }
}

glide.stopShow = function () {
    if (glide.intervalId != null) {
        clearInterval(glide.intervalId);
    }
}


/******************************************************************************
 *** Event Handler ***
 *****************************************************************************/
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
    case "Escape":
      glide.stopShow();
      break;
    default:
      return;
  }
};

// On window resize:
window.onresize = function(e) {

    // resize canvas
    glide.svg.attr("width", window.innerWidth)
             .attr("height", window.innerHeight);

    // resize pic
    var posAndDims = glide.calcImgPosAndDims();
    glide.svg.selectAll("image")
           .attr("width", posAndDims.width)
           .attr("height", posAndDims.height)
           .attr("x", posAndDims.x)
           .attr("y", posAndDims.y);
};

// On page load:
d3.json(glide.picsJson, function(data) {
    glide.startShow(data);
});
