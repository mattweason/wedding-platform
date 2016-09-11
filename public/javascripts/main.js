const $ = jQuery = require( 'jquery');
require('jquery-ui');
require('bootstrap'); //bootstrap JS
require('jquery-validation'); //form validation

$(document).ready(function() {

    //--------------------CREATING NEW VENDOR---------------------
    $('#add-form').validate({

        submitHandler: function(form){
            if (!$('.is-file').hasClass('valid')) {
                $(form).find('.is-file').attr('name', '');
            }
            console.log(form);
            var formData = new FormData(form);
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

    //--------------------ADDING REVIEW TO VENDOR---------------------
    $('#review-form').validate({
        
        submitHandler: function(form){
            $.ajax({
                type: "POST",
                url: $('#review-form').attr('action'),
                data: $('#review-form').serialize(), // serializes the form's elements.
                success: function(data){
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

    //--------------------REGISTERING NEW USER TO PLATFORM---------------------
    $('#register').validate({

        submitHandler: function(form){
            console.log($('#register').serialize());
            $.ajax({
                type: "POST",
                url: $('#register').attr('action'),
                data: $('#register').serialize(),
                success: function(data){
                    $('#message-modal').modal('toggle'); //toggle modal on form submit
                    if(data.status == 'success'){
                        $('#dismiss-button').addClass('notdisplay'); //Make dismiss button visible
                        $('.view-button').removeClass('notdisplay'); //Make variable modal button invisible
                        $('#message-modal').find('.form-response').html(data.message);
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $('.view-button').attr('href', data.url);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                    } else if (data.status == 'usernameTaken') {
                        $('#message-modal').find('.form-response').html(data.message);
                        $('#dismiss-button').removeClass('notdisplay'); //Make dismiss button visible
                        $('.view-button').addClass('notdisplay'); //Make variable modal button invisible
                    } else if (data.status == 'emailTaken') {
                        $('#message-modal').find('.form-response').html(data.message);
                        $('#dismiss-button').removeClass('notdisplay'); //Make dismiss button visible
                        $('.view-button').addClass('notdisplay'); //Make variable modal button invisible
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
    $("select#city").chosen();

    //Chosen field for category
    $("select#price").chosen();

    //Chosen field for category
    $(".chosen").chosen();

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
    var inputs = document.querySelectorAll( '.inputfile' );
    Array.prototype.forEach.call( inputs, function( input )
    {
        var label	 = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener( 'change', function( e )
        {
            var reader = new FileReader();

            reader.onload = function (e) {
                // get loaded data and render thumbnail.
                document.getElementById("featured-thumbnail").src = e.target.result;
            };

            // read the image file as a data URL.
            reader.readAsDataURL(this.files[0]);

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
    });

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
        centerPadding: '160px',
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

    //----------------------------------------MASONRY GALLERY------------------------------------------//
    $('.grid-item').imagesLoaded()
        .done( function( instance ) {
            $('.grid').masonry({
                // options
                itemSelector: '.grid-item',
                gutter: 10
            });
        });

    //Enable lightbox modal for Masonry gallery
    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
        event.preventDefault();
        $(this).ekkoLightbox({
            left_arrow_class: '.glyphicon .glyphicon-left',
            right_arrow_class: '.glyphicon .glyphicon-right'
        });
    });

    //----------------------------------------LIST.JS------------------------------------------//
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
            valueNames: ['vendName', 'vendCat', 'vendPrice', 'vendCity'],
            page: 8,
            plugins: [
                ListPagination(paginationTopOptions),
                ListPagination(paginationBottomOptions)
            ]
        };

        var vendorList = new List('vendors-list', options);
        var activeFilters = [];

        var updateListCat = function(){
            var values_cat = $(".cat-s").val();

            vendorList.filter(function(item) {
                var vendorCategory = item.values().vendCat;
                if(values_cat == 'All')
                    return true;
                else
                    return (vendorCategory.indexOf(values_cat) !== -1);
            });
        };

        var updateListCity = function(){
            var values_city = $(".city-s").val();

            vendorList.filter(function(item) {
                var vendorCity = item.values().vendCity;
                if(values_city == 'All')
                    return true;
                else
                    return (vendorCity.indexOf(values_city) !== -1);
            });
        };

        var updateListPrice = function(){
            var isChecked = this.checked;
            var value_price = $(this).data("value");

            if(isChecked){
                //  add to list of active filters
                activeFilters.push(value_price);
            }
            else
            {
                // remove from active filters
                activeFilters.splice(activeFilters.indexOf(value_price), 1);
            }

            vendorList.filter(function (item) {
                if(activeFilters.length > 0)
                {
                    return(activeFilters.indexOf(item.values().vendPrice)) > -1;
                }
                return true;
            });
        };

        $(".cat-s").change(updateListCat);

        $(".city-s").change(updateListCity);

        $("input:checkbox[name=price]").change(updateListPrice);
    });

    //Show #no-vendors if there are no vendors in the filter
    $('.search-filter').change(function() {
        if ($('#vendor-list').find('.vendor').length) {
            $('#no-vendors').css({'display': 'block'});
            console.log($('#vendor-list').find('.vendor').length);
        }
    });
    
}); //end of document ready