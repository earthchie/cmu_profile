window.image = null;
var imgObj;
var scale;
var editing = false;

$('#image').change(function (e) {
    if (this.value) {
        var reader = new FileReader();
        
        reader.onload = function (event) {
            imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function () {
                render(function(){
                    Velveto.importDocument('app/modules/frame.png.html', $('#sub-form').get(0));
                });
            }
        }
        
        reader.readAsDataURL(e.target.files[0]);
        
    } else {
        
        $('#generator').hide();
        
    }
});

$('#scale').on('input', function(){
    
    var user_scale = scale * this.value;
    image.set({
        scaleY: user_scale,
        scaleX: user_scale,
    });
    Canvas.setActiveObject(image);
    Canvas.centerObject(image);
    Canvas.renderAll();
    
});

$('#template').change(function(){
    var that = this;
    render(function(){
        Velveto.importDocument('app/modules/'+that.value+'.html', $('#sub-form').get(0));
    });
});

$('#done').click(function(){
    var base64 = Canvas.toDataURL({
       format: 'jpeg',
       quality: 0.9
    });
    $('#download-modal img').attr('src', base64);
    $('#download-modal a').attr('href', base64);
    //UIkit.modal('#download-modal');
});


$('#rotate-left').click(function(){
    image.set({
        angle: image.angle - 90
    });
    
    Canvas.renderAll();
    Canvas.centerObject(image);
});
$('#rotate-right').click(function(){
    image.set({
        angle: image.angle + 90
    });
    Canvas.renderAll();
    Canvas.centerObject(image);
});


function render(callback) {
    $('#generator').show();
    $('#scale').val(1);
    Velveto.scrollTo($('#generator').get(0));
    
    if(typeof Canvas !== 'undefined' && Canvas.dispose){
        Canvas.dispose();
    }
    
    window.Canvas = new fabric.Canvas('canvas',{
        preserveObjectStacking: true
    });
    
    // image
    image = new fabric.Image(imgObj);
    scale = Canvas.width / image.width;
    if(image.height > image.width){
        scale = Canvas.height / image.height;
    }
    
    image.set({
        scaleY: scale,
        scaleX: scale,
        selectable: true
    });
    
    var timer;
    window.first_move = false;
    
    Canvas.on('mouse:move', function(e) {
        image.opacity = 0.7;
        Canvas.setActiveObject(image);
        image.bringToFront();
        
        if(e.e.type === 'touchmove'){
            
            if(first_move === false){
                first_move = {
                    top: e.e.touches[0].clientY,
                    left: e.e.touches[0].clientX,
                    oTop: image.top,
                    oLeft: image.left
                }
            }
            
            var pos = {
                top: first_move.oTop + (e.e.touches[0].clientY - first_move.top)*3,
                left: first_move.oLeft + (e.e.touches[0].clientX - first_move.left)*3,
            }
            image.set(pos);
        }
        
        Canvas.renderAll();
        
        if(timer){
            clearTimeout(timer);
        }
        
        timer = setTimeout(function(){
            first_move = false;
            Canvas.deactivateAll()
            image.opacity = 1;
            image.sendToBack();
            Canvas.renderAll();
        }, 500)
    });
    
    Canvas.on('mouse:out', function() {
        Canvas.deactivateAll();
        image.opacity = 1;
        image.sendToBack();
        Canvas.renderAll();
        
    });
    
    Canvas.on('touch:drag', function(e) {
        Canvas.setActiveObject(image);
        image.opacity = 0.7;
        image.bringToFront();
        Canvas.renderAll();
        
        if(timer){
            clearTimeout(timer);
        }
        
        timer = setTimeout(function(){
            Canvas.deactivateAll()
            image.opacity = 1;
            image.sendToBack();
            Canvas.renderAll();
        }, 1000)
    });
    
    // end - image
    
    // mask
    var template = $('#template').val();
    fabric.Image.fromURL('app/images/'+template, function(oTemplate) {
        Canvas.add(image);
        Canvas.centerObject(image);
        
        var template_scale = Canvas.width / oTemplate.width;
        oTemplate.set({
            selectable: false
        });
        oTemplate.scale(template_scale);
        Canvas.add(oTemplate);
        
        if(callback) callback();
    });
    
    // end - mask
    
    Canvas.renderAll();
    
    
}