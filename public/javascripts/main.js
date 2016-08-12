const $ = jQuery = require( 'jquery');
require('jquery-ui');
require('bootstrap'); //bootstrap JS
require('jquery-validation'); //form validation

$(document).ready(function() {

    //--------------------CREATING NEW VENDOR---------------------
    $('#add-form').validate({

        submitHandler: function(form){
            var formData = new FormData($('form')[0]);
            $.ajax({
                type: "POST",
                processData: false,
                contentType: false,
                url: $('#add-form').attr('action'),
                data: formData, // serializes the form's elements.
                success: function(data){
                    $('#message-modal').find('.form-response').html(data.message);
                    $('#message-modal').modal('toggle'); //toggle modal on form submit
                    if(data.status == 'success'){
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $('#message-modal').find('.gallery-button').children().html(data.buttontextgal);
                        $('.view-button').attr('href', data.url);
                        $('.gallery-button').removeClass('notdisplay').attr('href', data.urlgal);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                    } else if (data.status == 'failure') {
                        $('#dismiss-button').removeClass('notdisplay'); //Make dismiss button visible
                        $('.view-button').addClass('notdisplay'); //Make variable modal button invisible
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
    $('#upload-gallery').validate({

        submitHandler: function(form){
            var formData = new FormData($('form')[0]);
            $.ajax({
                type: "POST",
                processData: false,
                contentType: false,
                url: $('#upload-gallery').attr('action'),
                data: formData, // serializes the form's elements.
                success: function(data){
                    $('#message-modal').find('.form-response').html(data.message);
                    $('#message-modal').modal('toggle'); //toggle modal on form submit
                    if(data.status == 'success'){
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $('#message-modal').find('.gallery-button').children().html(data.buttontextgal);
                        $('.view-button').attr('href', data.url);
                        $('.gallery-button').removeClass('notdisplay').attr('href', data.urlgal);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                    }
                }
            });
            return false; //since we use Ajax
        }
    }); //end of validate

    //--------------------DELETING GALLERY FROM VENDOR---------------------
    $('#delete-gallery').validate({

        submitHandler: function(form){
            console.log($('#delete-gallery').serialize());
            $.ajax({
                type: "POST",
                url: $('#delete-gallery').attr('action'),
                data: $('#delete-gallery').serialize(),
                success: function(data){
                    $('#message-modal').find('.form-response').html(data.message);
                    $('#message-modal').modal('toggle'); //toggle modal on form submit
                    if(data.status == 'success'){
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $('#message-modal').find('.gallery-button').children().html(data.buttontextgal);
                        $('.view-button').attr('href', data.url);
                        $('.gallery-button').removeClass('notdisplay').attr('href', data.urlgal);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                    }
                }
            });
            return false; //since we use Ajax
        }
    }); //end of validate

    //-----------------------GENERAL JAVASCRIPT-------------------------------//

    //Chosen field for category
    $("select#category").chosen();

    //Chosen field for category
    $("select#price").chosen();

    //Chosen field for category
    $("select#category-search").chosen();

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
    var distance = $('#masthead').offset().top + 1,
        $window = $(window);
    
    $window.scroll(function(){
        if ( $window.scrollTop() >= distance ) {
            $('#masthead').addClass('catch-header');
        } else if ( $('#masthead').hasClass('catch-header') && $window.scrollTop() <= distance ) {
            $('#masthead').removeClass('catch-header');
        }
    })

    //Initialize dotdotdot function
    $(".overflow-box").dotdotdot({
        ellipsis	: '... ',
        wrap		: 'word'
    });

    //Initialize slick carousel for featured vendors
    $('.featured-carousel').slick({
        prevArrow:"<img class='a-left control-c prev slick-prev' src='/images/left-arrow.png'>",
        nextArrow:"<img class='a-right control-c next slick-next' src='/images/right-arrow.png'>",
        customPaging: function(slider) {
            return $('<button type="button" data-role="none" role="button" tabindex="0" />');
        },
        dots: true,
        centerMode: true,
        centerPadding: '380px',
        slidesToShow: 1,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }
        ]
    });

    //List.js options
    $(function() {
        var paginationTopOptions = {
            name: "paginationTop",
            paginationClass: "paginationTop",
            outerWindow: 2
        };
        var paginationBottomOptions = {
            name: "paginationBottom",
            paginationClass: "paginationBottom",
            innerWindow: 3,
            left: 2,
            right: 4
        };
        var options = {
            valueNames: ['vendName', 'vendCat', 'vendPrice'],
            page: 8,
            plugins: [
                ListPagination(paginationTopOptions),
                ListPagination(paginationBottomOptions)
            ]
        };

        var vendorList = new List('vendors-list', options);

        var updateListCat = function(){
            var values_cat = $(".cat-s").val();

            vendorList.filter(function(item) {
                var vendorCategory = item.values().vendCat;
                console.log(vendorCategory);
                if(values_cat == 'All')
                    return true;
                else
                    return (vendorCategory.indexOf(values_cat) !== -1);
            });
        };

        var updateListPrice = function(){
            var value_price = this.value;
            console.log(this.value);

            vendorList.filter(function(item) {
                var vendorPrice = item.values().vendPrice;
                if(value_price == 'All')
                    return true;
                else
                    return (vendorPrice == value_price);
            });
        };

        $(".cat-s").change(updateListCat);

        $("input:radio[name=price]").change(updateListPrice);
    });

    //Show #no-vendors if there are no vendors in the filter
    $('.search-filter').change(function() {
        if ($('#vendor-list').find('.vendor').length) {
            $('#no-vendors').css({'display': 'block'});
            console.log($('#vendor-list').find('.vendor').length);
        }
    });

    
}); //end of document ready