const $ = jQuery = require( 'jquery');
require('jquery-ui');
require('bootstrap'); //bootstrap JS
require('jquery-validation'); //form validation

$(document).ready(function() {

    //--------------------CREATING NEW VENDOR---------------------
    $('#add-form').validate({
    
        submitHandler: function(form){
            $.ajax({
                type: "POST",
                url: $('#add-form').attr('action'),
                data: $('#add-form').serialize(), // serializes the form's elements.
                success: function(data){
                    $('#message-modal').find('.form-response').html(data.message);
                    $('#message-modal').modal('toggle'); //toggle modal on form submit
                    if(data.status == 'success'){
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $('.view-button').attr('href', data.url);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                        console.log('success!');
                    } else if (data.status == 'failure') {
                        $('#dismiss-button').removeClass('notdisplay'); //Make dismiss button visible
                        $('.view-button').addClass('notdisplay'); //Make variable modal button invisible
                        console.log('failure');
                    }
                }
            });
            return false; //since we use Ajax
        }
    }); //end of validate

    //--------------------DELETING VENDOR---------------------
    $('#delete-form').validate({

        submitHandler: function(form){
            $.ajax({
                type: "POST",
                url: $('#delete-form').attr('action'),
                data: $('#delete-form').serialize(), // serializes the form's elements.
                success: function(data){
                    $('#delete-modal').modal('hide'); //toggle modal on form submit
                    $('#message-modal').find('.form-response').html(data.message);
                    $('#message-modal').modal('toggle'); //toggle modal on form submit
                    if(data.status == 'success'){
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $('.view-button').attr('href', data.url);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                    }
                }
            });
            return false; //since we use Ajax
        }
    }); //end of validate

    //--------------------ADDING GALLERY TO VENDOR---------------------
    // $('#upload-gallery').validate({
    //
    //     submitHandler: function(form){
    //         $.ajax({
    //             type: "POST",
    //             processData: false,
    //             contentType: false,
    //             url: $('#upload-gallery').attr('action'),
    //             data: $('#upload-gallery').serialize(), // serializes the form's elements.
    //             success: function(data){
    //                 $('#message-modal').find('.form-response').html(data.message);
    //                 $('#message-modal').modal('toggle'); //toggle modal on form submit
    //                 if(data.status == 'success'){
    //                     $('#message-modal').find('.view-button').children().html(data.buttontext);
    //                 }
    //             }
    //         });
    //         return false; //since we use Ajax
    //     }
    // }); //end of validate

    //-----------------------GENERAL JAVASCRIPT-------------------------------//

    //Chosen field for category
    $("select#category").chosen();

    //Prevent delete form button default and open modal
    $( "#delete-modal-button" ).click(function( event ) {
        event.preventDefault();
        $('#delete-modal').modal('toggle');
    });

    //Vertically center Modal
    $(function() {
        function reposition() {
            var modal = $(this),
                dialog = modal.find('.modal-dialog');
            modal.css('display', 'block');

            // Dividing by two centers the modal exactly, but dividing by three
            // or four works better for larger screens.
            dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
        }
        // Reposition when a modal is shown
        $('.modal').on('show.bs.modal', reposition);
        // Reposition when the window is resized
        $(window).on('resize', function() {
            $('.modal:visible').each(reposition);
        });
    });

    //Change text in label for add to gallery button
    var inputs = document.querySelectorAll( '#upl' );
    Array.prototype.forEach.call( inputs, function( input )
    {
        var label	 = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener( 'change', function( e )
        {
            var fileName = '';
            if( this.files && this.files.length > 1 )
                fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
            else
                fileName = e.target.value.split( '\\' ).pop();

            if( fileName )
                label.querySelector( 'span' ).innerHTML = fileName;
            else
                label.innerHTML = labelVal;
        });
    });

    //If no images in gallery, delete button not shown.
    if ($('.delete-box').length < 1) {
        $('#delete-gallery-submit').hide();
    }

    //Fix header to top once scrolled to
    var distance = $('#masthead').offset().top,
        $window = $(window);
    
    $window.scroll(function(){
        if ( $window.scrollTop() >= distance ) {
            $('#masthead').addClass('catch-header');
        } else if ( $('#masthead').hasClass('catch-header') && $window.scrollTop() <= distance ) {
            $('#masthead').removeClass('catch-header');
        }
    })

    //Initialize dotdotdot function
    $("#overflow-box").dotdotdot({
        ellipsis	: '... ',
        wrap		: 'word'
    });
    
}); //end of document ready