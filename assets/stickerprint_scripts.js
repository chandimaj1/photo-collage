(function($) {
//--- jQuery No Conflict

//Global Variables
var ajax_url = '/wp-content/plugins/sticker_print/ajax_php/';

/**
 * 
 * 
 * 
 * 
 * 
 * Execute functions on DOM ready
 * 
 */

$(document).ready(function() {
  console.log('StickerPrint Shortcode JavaScripts Loaded');

  //UI Settings
  ui_settings();

  dropzone_settings();

  print_sticker();

});




/**
 * 
 * 
 *  UI Settings
 */   
function ui_settings(){

  //Adjust Canvas
  adjust_canvas();
  $(window).on('resize', function(){
    adjust_canvas();
  });

  function adjust_canvas(){
    let win = $(this); //this = window

      width = $('#sb_sticker_area').width();
      if (width >= 800) { width=800 }
      let height = width*1.41;

      $('#sticker_canvas').css('width',width+'px');
      $('#sticker_canvas').css('height',height+'px');
  }
}



/**
 * 
 * Dropzone settings
 */
function dropzone_settings(){
  
  $(".sticker_image_dropzone").dropzone({ 
    url: ajax_url+"file_upload.php",
    createImageThumbnails: false,
    resizeQuality: 1,
    maxFiles: 1,
    acceptedFiles: 'image/*',
    //capture: 'image/*',
    dragenter: drag_enter,
    dragleave: drag_left,
    dragend: drag_ended,
    renameFile: function(e){
      return e.name = Date.now()+'_'+e.name;
    },
    uploadprogress: log_progress,
    complete: upload_complete,
  });

  function drag_enter(){
    let element = $(this)[0].element;
    $(element).closest('.sticker_outer').addClass('image_in_dropzone');
  }

  function drag_left(){
    let element = $(this)[0].element;
    $(element).closest('.sticker_outer').removeClass('image_in_dropzone');
  }

  function drag_ended(){
    $('.sticker_outer').each(function(){
      $(this).removeClass('image_in_dropzone');
    });
  }

  function log_progress(e, progress){
    if (progress>0 && progress<100){
      let progress_new = Math.round(progress);
      $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_handle').show();
      $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_bar_percent').html(progress_new+' %');
      $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_bar_inner').css('width',progress_new+'%');
    }
  }

  function upload_complete(e){
    console.log(e);
    if (e.status=="success"){
      $(e.previewElement).closest('.sticker_outer').removeClass('image_in_dropzone');
      $(e.previewElement).closest('.sticker_outer').addClass('image_uploaded');
      $(e.previewElement).closest('.sticker_set').addClass('image_attached');

      
      let image_url = window.plugin_url+'assets/images/'+e.upload.filename;
      $(e.previewElement).closest('.sticker_outer').find('.sn_image').attr('src',image_url);
      $(e.previewElement).closest('.sticker_outer').find('.sn_image').attr('style','');

    }
    $(e.previewElement).closest('.sticker_image_dropzone').find('.progress_handle').hide();
    reset_image_set_ui_functions(e.previewElement);
    this.removeAllFiles(true); 
  }







  function reset_image_set_ui_functions(e){

    // If remove button clicked
    let sticker_set = $(e).closest('.sticker_set');
    sticker_set.find('.sticker_set_controls .sbcs_remove').off().on('click', function(){
      sticker_set.removeClass('image_attached');
      sticker_set.find('.sticker_outer').removeClass('image_uploaded');
      sticker_set.find('.sticker_outer').removeClass('image_in_dropzone');
      sticker_set.find('.dz-preview').remove();
      sticker_set.children('.ui-wrapper').remove();
      sticker_set.children('.sn_image').remove();
      sticker_set.find('.sticker_image_holder').append('<img class="sn_image"/>');

      if ( sticker_set.find('.sticker_outer .sn_image').hasClass('ui-resizable') ){
        sticker_set.find('.sticker_outer .sn_image').resizable('destroy');
      }

      if ( sticker_set.find('.sticker_outer .sn_image').parent().hasClass('ui-draggable') ){
        sticker_set.find('.sticker_outer .sn_image').parent().draggable('destroy');
      }
    });


    // If rotate resize clicked
    $(e).closest('.sticker_set').find('.sticker_set_controls .sbcs_rotate_resize').off().on('click', function(){

      if ( $(this).closest('.sticker_set').find('.sticker_outer').hasClass('image_uploaded') ){

        $(this).closest('.sticker_set').addClass('image_on_edit');
        let resize = $(this).closest('.sticker_set').find('.sn_image');

        resize.resizable({
          handles: 'ne, se, sw, nw',
          //aspectRatio: resize.width()/resize.height(),
        });
        resize.parent().draggable({
            stack: "div",
            disabled: false
        });
        resize.parent().css( 'pointer-events','auto' );
        resize.parent().append('<button class="btn btn-success sn_edit_done"><i class="fa fa-check"></i> Done</button>');


        // done editing
        resize.parent().find('.sn_edit_done').off().on('click touchstart',function(){
          $(this).closest('.sticker_set').removeClass('image_on_edit');
          $(this).remove();
          resize.parent().css( 'pointer-events','none' );
          resize.parent().draggable('destroy');
        });

        /*
        resize.rotate({
            bind: {
                dblclick: function() {
                    $(this).data('angle', $(this).data('angle')+90);
                    var w = $(this).css('width');
                    $(this).parent().rotate({ animateTo: $(this).data('angle')}).css({width: $(this).css('height'), height: w});
    
                }
            }
        });
        */
      }
    });







    //On draggable dropped to droppable
    $( ".sticker_outer" ).droppable({
      
      hoverClass: "drop_hover",
      tolerance: "pointer",
      
      drop: function( event, ui ) {
        if ( !$(this).closest('.sticker_set').hasClass('image_on_edit') ){
          
          let image_src = $(ui.draggable).children('img').attr('src');

          // Draggable UI reset as if remove button clicked
          $(ui.draggable).closest('.sticker_set').find('.sticker_outer').removeClass('image_uploaded');
          $(ui.draggable).closest('.sticker_set').find('.sticker_outer').removeClass('image_in_dropzone');
          $(ui.draggable).closest('.sticker_set').removeClass('image_attached');


          console.log('droppble src:'+$(this).find('.sn_image').attr( 'src') );

          if ( typeof ( $(this).find('.sn_image').attr( 'src') ) !== 'undefined' && $(this).find('.sn_image').attr( 'src') != ''){
            $(ui.draggable).closest('.sticker_set').find('.sn_image').attr('src',$(this).find('.sn_image').attr( 'src'));
            $(ui.draggable).closest('.sticker_set').find('.sn_image').attr('style','');
            $(ui.draggable).closest('.sticker_set').find('.sticker_outer').addClass('image_uploaded');
            $(ui.draggable).closest('.sticker_set').addClass('image_attached');
          }else{
            $(ui.draggable).closest('.sticker_set').find('.sn_image').attr('src','');
          }

          $(ui.draggable).closest('.sticker_set').find('.dz-preview').remove();

          // Draggable specific UI reset
            $(ui.draggable).closest('.sticker_set').removeClass('image_on_edit');
            $(ui.draggable).find('.sn_edit_done').remove();
            $(ui.draggable).css( 'pointer-events','none' );

            $(ui.draggable).css({
              'left': $(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('left'),
              'top': $(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('top'),
              'width':$(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('width'),
              'height':$(ui.draggable).closest('.sticker_set').find('.sticker_image_holder').css('height'),
            });
            $(ui.draggable).draggable( "destroy" );
            $(ui.draggable).children('img').resizable("destroy");
            

            // Droppable ui set
            console.log ( image_src );

            $(this).find('.sn_image').attr( 'src',image_src );
            $(this).find('.sn_image').attr( 'style','' );
            $(this).closest('.sticker_outer').removeClass('image_in_dropzone');
            $(this).closest('.sticker_set').addClass('image_attached');
            $(this).closest('.sticker_outer').addClass('image_uploaded');
            $(this).closest('.sticker_image_dropzone').find('.progress_handle').hide();
            reset_image_set_ui_functions( $(this) );
            
        }
      },
      
    });

  }
}


 /**
   * 
   * 
   * Print Sticker
   * 
   */
  function print_sticker(){

    $('.sbcs_print_sticker').on('click', function(){

      $(this).html('Preparing to print...');

      $('body').append('<div id="hidden_canvas"><div id="print_canvas" style="width:2480px; height:3508px; position:absolute;"></div></div>');
      $('#print_canvas').html( $('#sb_sticker_area').html() );

      //Size calculations
      let original_width = $('#sb_sticker_area #sticker_canvas').width();
      let width_ratio = 2480/original_width;

      let original_height = original_width*1.41;
      let height_ratio = 3508/original_height;

      $('#print_canvas').find('.sticker_image_holder').each(function(){

        if( $(this).children('.ui-wrapper').length>0 ){
          let original_uiw_width = $(this).find('.ui-wrapper').width();
          let original_uiw_height = $(this).find('.ui-wrapper').height();
          let original_uiw_position = $(this).find('.ui-wrapper').position();
          let new_uiw_width = original_uiw_width * width_ratio;
          let new_uiw_height = original_uiw_height * height_ratio;

          $(this).find('.ui-wrapper').css('width', new_uiw_width+"px");
          $(this).find('.ui-wrapper').css('height', new_uiw_height+"px");

          $(this).find('.ui-wrapper').css('top', original_uiw_position.top*height_ratio+"px");
          $(this).find('.ui-wrapper').css('left', original_uiw_position.left*width_ratio+"px");
          
  
          console.log('original uiw width & height:'+original_uiw_width+" &"+original_uiw_height);
          console.log('New uiw width & height:'+new_uiw_width+" &"+new_uiw_height);
          console.log('original uiw Position:'+original_uiw_position);
          console.log('New uiw Position:' + $(this).find('.ui-wrapper').position() );
  
          let original_sni_width = $(this).find('.sn_image').width();
          let original_sni_height = $(this).find('.sn_image').height();
          let original_sni_position = $(this).find('.sn_image').position();
          let new_sni_width = original_sni_width * width_ratio;
          let new_sni_height = original_sni_height * height_ratio;
  
          $(this).find('.sn_image').css('width', new_sni_width+"px");
          $(this).find('.sn_image').css('height', new_sni_height+"px");

          $(this).find('.sn_image').css('top', original_sni_position.top*height_ratio+"px");
          $(this).find('.sn_image').css('left', original_sni_position.left*width_ratio+"px");
  
          console.log('original sni width & height:'+original_sni_width+" &"+original_sni_height);
          console.log('New sni width & height:'+new_sni_width+" &"+new_sni_height);
          console.log('original sni Position:'+original_sni_position);
          console.log('New sni Position:' + $(this).find('.sn_image').position() );



        }else{
          console.log('no ui wrapper');
        }
      });

      const container = document.getElementById('print_canvas');
      let canvas_dataurl = '';
      
      html2canvas(container, { allowTaint: true }).then(function (canvas) {
        let imgsrc = canvas.toDataURL();
        
        printJS({printable:imgsrc, type:'image', showModal:true});
      });

      
    });


    $('.sbcs_download_sticker').on('click', function(){
      
      $('body').append('<div id="hidden_canvas"><div id="print_canvas" style="width:2480px; height:3508px; position:absolute;"></div></div>');
      $('#print_canvas').append( $('#sb_sticker_area').html() );

      
      $('#print_canvas .sn_image').each(function(){
        let this_src = $(this).attr('src');
        $(this).closest('.sticker_image_holder').html('');
        $(this).closest('.sticker_image_holder').html('<img class="sn_image" src="'+this_src+'">');
      });

      const container = document.getElementById('print_canvas');
      let canvas_dataurl = '';
      
      html2canvas(container, { allowTaint: true }).then(function (canvas) {
        let link = document.createElement("a");
        document.body.appendChild(link);
        link.download = "sticker_highres_300dpi.jpg";
        link.href = canvas.toDataURL();
        link.target = '_blank';
        link.click();
      });
    });
  }

//--- jQuery No Conflict
})(jQuery);