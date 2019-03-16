var portret = portret || {};

/******************************************************************************
 *** Slideshow Param Defaults ***
 *****************************************************************************/
portret.param = {};
portret.param.name = "slideshow";
portret.param.showDuration = 5000;
portret.param.animDuration = 2000;
portret.param.autoForward = true;
portret.param.bgColor = "#1e2426";
portret.param.animation = "NONE";

/******************************************************************************
 *** Internal Vars ***
 *****************************************************************************/
portret.showTimeoutId = null;
portret.lastAnimation = null;
portret.animIntervalId = null;
portret.cancelAnimation = null;
portret.animations = {};

/******************************************************************************
 *** Helper Functions ***
 *****************************************************************************/
portret.isScalar = function (obj) {
    return (/string|number|boolean/).test(typeof obj);
};

portret.randSplice = function(array) {
    var i = Math.floor(Math.random() * array.length);
    var removed = array.splice(i, 1);
    return removed;
};

portret.randKey = function(obj) {
    var keys = Object.keys(obj);
    var i = Math.floor(Math.random() * keys.length);
    return keys[i];
};

/******************************************************************************
 *** Portret Functions ***
 *****************************************************************************/
portret.nextPic = function () {
    if (portret.i == portret.max) {
        portret.i = 0;
    } else {
        portret.i++;
    }

    var src = "collections/" + portret.dataset.collection.name + "/" + portret.dataset.collection.pics[portret.i];

    var re = /\.(\w+)$/i;
    var found = src.match(re);
    var filetype = "unknown";
    if (Array.isArray(found)) {
        filetype = (found[1]).toLowerCase();
    }

    console.log("src: " + src + ", filetype: " + filetype);
    return [{"key": portret.i, "src": src, "filetype": filetype}];
};

portret.prevPic = function () {
    if (portret.i === 0) {
        portret.i = portret.max;
    } else {
        portret.i--;
    }

    var src = "collections/" + portret.dataset.collection.name + "/" + portret.dataset.collection.pics[portret.i];

    var re = /\.(\w+)$/i;
    var found = src.match(re);
    var filetype = "unknown";
    if (Array.isArray(found)) {
        filetype = (found[1]).toLowerCase();
    }

    console.log("src: " + src + ", filetype: " + filetype);
    return [{"key": portret.i, "src": src, "filetype": filetype}];
};

portret.key = function (d) {
    return d.key;
};

portret.calcImgPosAndDims = function (img, callback) {

    var wh, ww, height, width, x, y, centerX, centerY, rotateDeg, tHeight, tWidth, tx, ty, posAndDims;
    var orientation = -1;

    if (img != null) {  // new image
        EXIF.getData(img, function() {
            orientation = EXIF.getTag(this, "Orientation");
            if (orientation == 6) {
                rotateDeg = 90;
            } else {
                rotateDeg = 0;
            }

            portret.naturalHeight = img.naturalHeight;
            portret.naturalWidth = img.naturalWidth;

            console.log("orientation: " + orientation + ", rotate: " + rotateDeg + " degrees");

            wh = window.innerHeight;
            ww = window.innerWidth;

            if (portret.naturalHeight <= wh && portret.naturalWidth <= ww) {
                // original image fits
                height = portret.naturalHeight;
                width = portret.naturalWidth;
            } else {
                // original image must be scaled
                var widthScale = ww / portret.naturalWidth;
                var heightScale = wh / portret.naturalHeight;
                var scale = Math.min(widthScale, heightScale);
                width = Math.round(portret.naturalWidth * scale);
                height = Math.round(portret.naturalHeight * scale);
            }

            x = (ww - width) / 2;
            y = (wh - height) / 2;

            // Calculate center around which an image can be rotated.
            centerX = x + width / 2;
            centerY = y + height / 2;

            tWidth = width;
            tHeight = height;

            tx = x;
            ty = y;

            // Calculate additional scale if image needs to be rotated. This scale
            // is applied after rotation to make the image fit to the window again.
            if (rotateDeg == 90) {
                if (width <= wh && height <= ww) {
                    // rotated image fits
                } else {
                    // scale
                    var rotatedWidthScale = ww / height;
                    var rotatedHeightScale = wh / width;
                    tScale = Math.min(rotatedWidthScale, rotatedHeightScale);
                    tWidth = Math.round(width * tScale);
                    tHeight = Math.round(height * tScale);
                    tx = (ww - tWidth) / 2;
                    ty = (wh - tHeight) / 2;
                }
            }

            posAndDims = { "width": width,
                           "height": height,
                           "x": x,
                           "y": y,
                           "centerX": centerX,
                           "centerY": centerY,
                           "rotateDeg": rotateDeg,
                           "tWidth": tWidth,
                           "tHeight": tHeight,
                           "tx": tx,
                           "ty": ty
                        };

           console.log("w x h = (" + posAndDims.width + "," + posAndDims.height + ") (x,y) = (" + posAndDims.x + "," + posAndDims.y + ")");

           typeof callback === 'function' && callback(posAndDims);
        });
    }
};

portret.updateParams = function () {
    Object.keys(portret.param).forEach(function(key, index) {
        if (portret.dataset.hasOwnProperty(key)) {
            var val = portret.dataset[key];
            if (portret.isScalar(val)) {
                console.log("Using custom slideshow param '" + key + "' : " + val);
                portret.param[key] = val;
            } else {
                console.log("Ignoring invalid slideshow param '" + key + "'.");
            }
        }
    });
};

portret.getRandAnimation = function () {
    var anim = portret.lastAnimation;
    while (anim == portret.lastAnimation) {
        anim = portret.randKey(portret.animations);
    }
    portret.lastAnimation = anim;
    return anim;
};

portret.setupCanvas = function () {
    d3.select("title")
      .text(portret.param.name);

    portret.svg = d3.select("body")
                  .attr("style", "background-color: " + portret.param.bgColor)
                  .append("svg")
                  .attr("width", window.innerWidth)
                  .attr("height", window.innerHeight)
                  .attr("id", "canvas");
};

portret.nextSlide = function () {
    // get pic...
    var nextPicSpec = portret.nextPic();

    // show slide...
    portret.showSlide(nextPicSpec);
};

portret.prevSlide = function () {
    // get pic...
    var nextPicSpec = portret.prevPic();

    // show slide...
    portret.showSlide(nextPicSpec);
};

portret.showSlide = function (nextPicSpec) {

    // cancel old timeout
    if (portret.param.autoForward
        && portret.showTimeoutId != null) {
        clearTimeout(portret.showTimeoutId);
    }

    // cancel old animation
    if (portret.cancelAnimation != null) {
        portret.cancelAnimation();
    }

    // select all image objects
    var pics = portret.svg.selectAll("image")
                        .data(nextPicSpec, portret.key);

    // show next pic using random or selected animation...
    // ...but don't use any animation for GIF's
    if (nextPicSpec[0].filetype == "gif") {
        portret.aniNone(nextPicSpec, pics);
    } else if (portret.param.animation == "RANDOM") {
        var anim = portret.getRandAnimation();
        portret.animations[anim](nextPicSpec, pics);
    } else if (portret.animations.hasOwnProperty(portret.param.animation)) {
        portret.animations[portret.param.animation](nextPicSpec, pics);
    } else {    // no animation
        portret.aniNone(nextPicSpec, pics);
    }
};

portret.picId = function (d) { return "pic_" + d.key; };

portret.picSrc = function (d) { return d.src; };

portret.triggerNextSlide = function (millis) {
    if (portret.param.autoForward) {
        portret.showTimeoutId = setTimeout(portret.nextSlide, millis);
    }
};

portret.aniNotImplemented = function (nextPicSpec, pics) {
    console.log("This animation is not yet implemented!");
    portret.aniNone(nextPicSpec, pics);
};

portret.aniNone = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    portret.img = new Image();
    portret.img.onload = function () {
        portret.calcImgPosAndDims(portret.img, function (posAndDims) {
            pics.enter()
               .append("image")
               .attr("xlink:href", portret.picSrc)
               .attr("id", portret.picId)
               .attr("x", posAndDims.x)
               .attr("y", posAndDims.y)
               .attr("width", posAndDims.width)
               .attr("height", posAndDims.height)
               .attr("transform", "rotate(" + posAndDims.rotateDeg + " " + posAndDims.centerX + " " + posAndDims.centerY + ")")
               .transition()
               .attr("width", posAndDims.tWidth)
               .attr("height", posAndDims.tHeight)
               .attr("x", posAndDims.tx)
               .attr("y", posAndDims.ty);

            portret.triggerNextSlide(portret.param.showDuration);
        });
    };
    portret.img.src = nextPicSpec[0].src;
};

portret.aniZoomIn = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    portret.img = new Image();
    portret.img.onload = function () {
        portret.calcImgPosAndDims(portret.img, function (posAndDims) {
            pics.enter()
               .append("image")
               .attr("xlink:href", portret.picSrc)
               .attr("id", portret.picId)
               .attr("width", 1)
               .attr("height", 1)
               .attr("x", window.innerWidth / 2)
               .attr("y", window.innerHeight / 2)
               .attr("transform", "rotate(" + posAndDims.rotateDeg + " " + posAndDims.centerX + " " + posAndDims.centerY + ")")
               .transition()
               .duration(portret.param.animDuration)
               .attr("width", posAndDims.tWidth)
               .attr("height", posAndDims.tHeight)
               .attr("x", posAndDims.tx)
               .attr("y", posAndDims.ty);

            portret.triggerNextSlide(portret.param.animDuration
                + portret.param.showDuration);
        });
    };
    portret.img.src = nextPicSpec[0].src;
};

portret.aniSlideRight = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(portret.param.animDuration)
        .attr("x", window.innerWidth)
        .remove();

    // (2) load new pic
    portret.img = new Image();
    portret.img.onload = function () {
        portret.calcImgPosAndDims(portret.img, function (posAndDims) {
            pics.enter()
                .append("image")
                .attr("xlink:href", portret.picSrc)
                .attr("id", portret.picId)
                .attr("width", posAndDims.width)
                .attr("height", posAndDims.height)
                .attr("x", 0 - posAndDims.width)
                .attr("y", posAndDims.y)
                .attr("transform", "rotate(" + posAndDims.rotateDeg + " " + posAndDims.centerX + " " + posAndDims.centerY + ")")
                .transition()
                .duration(portret.param.animDuration)
                .attr("width", posAndDims.tWidth)
                .attr("height", posAndDims.tHeight)
                .attr("x", posAndDims.tx)
                .attr("y", posAndDims.ty);

                portret.triggerNextSlide(portret.param.animDuration
                    + portret.param.showDuration);
        });
    };
    portret.img.src = nextPicSpec[0].src;
};

portret.aniSlideTop = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .transition()
        .duration(portret.param.animDuration)
        .attr("y", window.innerHeight)
        .remove();

    // (2) load new pic
    portret.img = new Image();
    portret.img.onload = function () {
        portret.calcImgPosAndDims(portret.img, function (posAndDims) {
            pics.enter()
                .append("image")
                .attr("xlink:href", portret.picSrc)
                .attr("id", portret.picId)
                .attr("width", posAndDims.width)
                .attr("height", posAndDims.height)
                .attr("x", posAndDims.x)
                .attr("y", 0 - posAndDims.height)
                .attr("transform", "rotate(" + posAndDims.rotateDeg + " " + posAndDims.centerX + " " + posAndDims.centerY + ")")
                .transition()
                .duration(portret.param.animDuration)
                .attr("width", posAndDims.tWidth)
                .attr("height", posAndDims.tHeight)
                .attr("x", posAndDims.tx)
                .attr("y", posAndDims.ty);

            portret.triggerNextSlide(portret.param.animDuration
                + portret.param.showDuration);
        });
    };
    portret.img.src = nextPicSpec[0].src;
};

portret.getSquareDims = function (picPosAndDims) {

    var squaresPerRow = 8;
    var positions = [];
    var sqWidth, numSqWide, numSqHigh, planeWidth, planeHeight;

    if (picPosAndDims.tWidth > picPosAndDims.tHeight) {
        // fill complete width with squares
        sqWidth = Math.ceil(picPosAndDims.tWidth / squaresPerRow);
        numSqWide = squaresPerRow;
        numSqHigh = Math.ceil(picPosAndDims.tHeight / sqWidth);
    } else {
        // fill complete height with squares
        sqWidth = Math.ceil(picPosAndDims.tHeight / squaresPerRow);
        numSqHigh = squaresPerRow;
        numSqWide = Math.ceil(picPosAndDims.tWidth / sqWidth);
    }

    planeWidth = sqWidth * numSqWide;
    planeHeight = sqWidth * numSqHigh;

    // calculate positions
    var startX = picPosAndDims.tx - ((planeWidth - picPosAndDims.tWidth) / 2);
    var startY = picPosAndDims.ty - ((planeHeight - picPosAndDims.tHeight) / 2);
    var count = 0;
    var xPos = startX;
    var yPos = startY;
    for (var i=1; i <= numSqHigh; i++) {
        for (var j=1; j <= numSqWide; j++) {
            count++;
            positions.push({ key: count, x: xPos, y: yPos });
            xPos += sqWidth;
        }
        yPos += sqWidth;
        xPos = startX;
    }

    return {
        width: sqWidth,
        squares: positions
    };
};

portret.aniMemory = function (nextPicSpec, pics) {
    // (1) remove old pic (if exists)
    pics.exit()
        .remove();

    // (2) load new pic
    portret.img = new Image();
    portret.img.onload = function () {
        portret.calcImgPosAndDims(portret.img, function (posAndDims) {
            pics.enter()
               .append("image")
               .attr("xlink:href", portret.picSrc)
               .attr("id", portret.picId)
               .attr("width", posAndDims.width)
               .attr("height", posAndDims.height)
               .attr("x", posAndDims.x)
               .attr("y", posAndDims.y)
               .attr("transform", "rotate(" + posAndDims.rotateDeg + " " + posAndDims.centerX + " " + posAndDims.centerY + ")")
               .attr("width", posAndDims.tWidth)
               .attr("height", posAndDims.tHeight)
               .attr("x", posAndDims.tx)
               .attr("y", posAndDims.ty);

           // (3) immediately draw squares
           var squareDims = portret.getSquareDims(posAndDims);
           var squareData = squareDims.squares;
           var squareShowTime = 100;
           var animDuration = squareData.length * squareShowTime;
           portret.svg.selectAll("rect")
                    .data(squareData, portret.key)
                    .enter()
                    .append("rect")
                    .attr("width", squareDims.width)
                    .attr("height", squareDims.width)
                    .attr("x", function (d) { return d.x; })
                    .attr("y", function (d) { return d.y; })
                    .attr("id", function (d) { return "sq_" + d.key; })
                    .attr("stroke", portret.param.bgColor)
                    .attr("fill", portret.param.bgColor);

           // (4) define animation stopper
           portret.cancelAnimation = function () {
               if (portret.animIntervalId != null) {
                   clearInterval(portret.animIntervalId);
                   portret.animIntervalId = null;

                   portret.svg.selectAll("rect")
                            .data([], portret.key)
                            .exit()
                            .remove();

                   portret.cancelAnimation = null;
               }
           };

           // (5) start animation: remove squares (one by one)
           portret.animIntervalId = setInterval(function () {
                   if ( squareData.length > 0 ) {
                       portret.randSplice(squareData);
                       portret.svg.selectAll("rect")
                             .data(squareData, portret.key)
                             .exit()
                             .remove();
                   } else {
                       clearInterval(portret.animIntervalId);
                       portret.animIntervalId = null;
                       portret.cancelAnimation = null;
                   }
           },
           squareShowTime);

           portret.triggerNextSlide(animDuration + portret.param.showDuration);
        });
    };
    portret.img.src = nextPicSpec[0].src;
};

portret.registerAnimations = function () {
    portret.animations.ZOOM_IN = portret.aniZoomIn;
    portret.animations.SLIDE_RIGHT = portret.aniSlideRight;
    portret.animations.SLIDE_TOP = portret.aniSlideTop;
    portret.animations.MEMORY = portret.aniMemory;
};

portret.startShow = function (data) {
    portret.dataset = data;
    portret.max = portret.dataset.collection.pics.length - 1;
    portret.i = -1;
    portret.updateParams();
    portret.registerAnimations();
    portret.setupCanvas();
    portret.nextSlide();
};

portret.stopShow = function () {
    if (portret.showTimeoutId != null) {
        clearTimeout(portret.showTimeoutId);
        portret.showTimeoutId = null;
    }
};

/******************************************************************************
 *** Event Handler ***
 *****************************************************************************/
 // On click on body:
d3.select("body").on("click", function(e) {
    portret.nextSlide();
});

// On key press:
document.onkeypress = function (e) {
    e = e || window.event;
    switch (e.key) {
    case " ":   // Space
        portret.nextSlide();
      break;
    case "Backspace":
      portret.prevSlide();
      break;
    case "ArrowDown":
      portret.prevSlide();
      break;
    case "ArrowUp":
      portret.nextSlide();
      break;
    case "ArrowLeft":
      portret.prevSlide();
      break;
    case "ArrowRight":
      portret.nextSlide();
      break;
    case "Enter":
      portret.nextSlide();
      break;
    case "Escape":
      portret.stopShow();
      break;
    default:
      return;
  }
};

// On window resize:
window.onresize = function(e) {

    if ( portret.svg != null ) {
        // resize canvas
        portret.svg.attr("width", window.innerWidth)
                 .attr("height", window.innerHeight);

        // resize pic
        portret.calcImgPosAndDims(portret.img, function (posAndDims) {
            portret.svg.selectAll("image")
                   .attr("width", posAndDims.tWidth)
                   .attr("height", posAndDims.tHeight)
                   .attr("x", posAndDims.tx)
                   .attr("y", posAndDims.ty);
        });
    }
};
