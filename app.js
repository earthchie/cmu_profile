/**
 * @name cmu_profile
 * @version 1.0.0
 * @update Sep 5, 2017
 * @website https://github.com/earthchie/cmu_profile
 * @author Earthchie http://www.earthchie.com/
 * @license WTFPL v.2 - http://www.wtfpl.net/
 **/

// async load FB SDK
$.getScript('//connect.facebook.net/en_US/sdk.js', function () {
    FB.init({
        appId: '113581508678006',
        version: 'v2.4'
    });
    FB.XFBML.parse(); // parse social plugins

    ga('Main.send', 'event', 'CMU60', 'app', 'loaded'); // collect stats

    // on image chosen
    $('#file_selected').change(function (e) {

        ga('Main.send', 'event', 'CMU60', 'browse image', 'selected'); // collect stats
        if (this.value) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var imgObj = new Image();
                imgObj.src = e.target.result; 
                imgObj.onload = function () {
                    render({imgObj: imgObj}); // render from image object
                }
            }
            reader.readAsDataURL(e.target.files[0]); // read image from disk

        }
    });

    // on scale change
    $('#scale').on('input', function () {
        if (image) {
            ga('Main.send', 'event', 'CMU60', 'scale image', this.value+'x'); // collect stats

            // set scale
            image.set({
                scaleY: this.value,
                scaleX: this.value,
            });
            Canvas.centerObject(image); // center the image
            Canvas.renderAll(); // re-render canvas
        }
    });

    // on rotate left
    $('#rotate-left').click(function () {
        if (image) {
            ga('Main.send', 'event', 'CMU60', 'rotate image', 'left'); // collect stats

            // rotate left
            image.set({
                angle: image.angle - 90
            });

            Canvas.centerObject(image); // center the image
            Canvas.renderAll(); // re-render canvas
            
        }
    });

    // on rotate right
    $('#rotate-right').click(function () {
        if (image) {
            ga('Main.send', 'event', 'CMU60', 'rotate image', 'right'); // collect stats

            // rotate right
            image.set({
                angle: image.angle + 90
            });

            Canvas.centerObject(image); // center the image
            Canvas.renderAll(); // re-render canvas
            
        }
    });

    // on download button clicked
    $('#download').click(function () {
        ga('Main.send', 'event', 'CMU60', 'download image', 'clicked'); // collect stats

        // create base64 image
        var base64 = Canvas.toDataURL({
            format: 'jpeg',
            quality: 0.9
        });

        $('#download-modal img').attr('src', base64); // apply to <img> so user can view it
        $('#download-modal a').attr('href', base64); // appy to <a> so user can download it
    });

    render({imgURL:'https://cmu.project.in.th/images/example.jpg'}); // render example
});

function render(img) {

    // destroy previous canvas if exists
    if (typeof Canvas !== 'undefined' && Canvas.dispose) {
        Canvas.dispose();
    }

    // init new Fabric's Canvas
    window.Canvas = new fabric.Canvas('canvas', {
        preserveObjectStacking: true
    });

    // call this function when image has been set or loaded
    var loadImage = function () {
        fabric.Image.fromURL('images/template1.png', function (template) {
            window.template = template;
            Canvas.add(image);
            Canvas.centerObject(image);

            var template_scale = Canvas.width / template.width;
            template.set({
                selectable: false
            });
            template.scale(template_scale);
            Canvas.add(template);
            template.setTop(Canvas.height / 1.77);
            Canvas.renderAll();
            $('#file_selected').val('');
        });
    }

    // load from obj
    if (img.imgObj) {
        window.image = new fabric.Image(img.imgObj); // create Fabric's Image Object
        window.scale = Canvas.width / image.width; // determine scale to make image fit the canvas
        if (image.height > image.width) { // if image is vertical, determine scale from height instead
            scale = Canvas.height / image.height;
        }
        $('#scale').val(scale); // set scale to range input

        // apply scale settings
        image.set({
            scaleY: scale,
            scaleX: scale,
            selectable: true
        });
        loadImage(); // load image
    }

    if (img.imgURL) {
        
        // create Fabric's Image Object from image URL
        fabric.Image.fromURL(img.imgURL, function (image) {
            window.image = image;
            window.scale = Canvas.width / image.width; // determine scale to make image fit the canvas
            if (image.height > image.width) { // if image is vertical, determine scale from height instead
                scale = Canvas.height / image.height;
            }
            $('#scale').val(scale); // set scale to range input

            // apply scale settings
            image.set({
                scaleY: scale,
                scaleX: scale,
                selectable: true
            });
            loadImage(); // load image
        });
    }

    // on mouse move over the canvas
    Canvas.on('mouse:move', function (e) {
        image.opacity = 0.7; // fade image
        Canvas.setActiveObject(image); // set image as active object, so we can interact with it later
        image.bringToFront(); // put image to the front

        // if touch screen
        if (e.e.type === 'touchmove') {

            if (first_move === false) {
                first_move = {
                    top: e.e.touches[0].clientY,
                    left: e.e.touches[0].clientX,
                    oTop: image.top,
                    oLeft: image.left
                }
            }

            var pos = {
                top: first_move.oTop + (e.e.touches[0].clientY - first_move.top) * 3,
                left: first_move.oLeft + (e.e.touches[0].clientX - first_move.left) * 3,
            }
            image.set(pos);
        }

        Canvas.renderAll(); // re-render

        if (window.timer) {
            clearTimeout(timer);
        }

        // exit draging mode after 500ms
        window.timer = setTimeout(function () {
            first_move = false;
            Canvas.deactivateAll()
            image.opacity = 1;
            image.sendToBack();
            Canvas.renderAll();
        }, 500)
    });

    // exit draging mode
    Canvas.on('mouse:out', function () {
        Canvas.deactivateAll();
        image.opacity = 1;
        image.sendToBack();
        Canvas.renderAll();
    });

    Canvas.on('touch:drag', function (e) {
        Canvas.setActiveObject(image);
        image.opacity = 0.7;
        image.bringToFront();
        Canvas.renderAll();

        if (timer) {
            clearTimeout(timer);
        }

        // exit draging mode after 1s
        timer = setTimeout(function () {
            ga('Main.send', 'event', 'CMU60', 'image dragged', 'yes'); // collect stats

            Canvas.deactivateAll()
            image.opacity = 1;
            image.sendToBack();
            Canvas.renderAll();
        }, 1000)
    });




}