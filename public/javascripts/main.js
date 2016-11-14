const $ = jQuery = require( 'jquery');
require('jquery-ui');
require('bootstrap'); //bootstrap JS
require('jquery-validation'); //form validation

$(document).ready(function() {
//--------------------------------------------------------------------------------AJAX CALLS
    //--------------------CREATING NEW VENDOR---------------------
    $('#add-form').validate({

        submitHandler: function(form){
            if (!$('.is-file').hasClass('valid')) {
                $(form).find('.is-file').attr('name', '');
            }
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
                        if (data.guest){
                            $('#message-modal').find('.view-button').children().html(data.buttontext);
                            $('.view-button').attr('href', data.url);
                            $(form).find('input[type=submit]').attr('disabled', 'disabled');
                        } else {
                            $('#message-modal').find('.view-button').children().html(data.buttontext);
                            $('#message-modal').find('.gallery-button').children().html(data.buttontextgal);
                            $('.view-button').attr('href', data.url);
                            $('.gallery-button').removeClass('notdisplay').attr('href', data.urlgal);
                            $(form).find('input[type=submit]').attr('disabled', 'disabled');
                        }
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
            var formData = new FormData($('form')[0]);
            $.ajax({
                type: "POST",
                processData: false,
                contentType: false,
                url: $('#review-form').attr('action'),
                data: formData, // serializes the form's elements.
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

    //--------------------DELETING REVIEW FROM VENDOR---------------------
    $('#review-delete-form').submit( function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: $('#review-delete-form').attr('action'),
            data: $('#review-delete-form').serialize(),
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
    }); //end of validate

    //--------------------ASSIGN USER TO AS VENDOR OWNER---------------------
    $('#user-assign-form').submit( function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: $('#user-assign-form').attr('action'),
            data: $('#user-assign-form').serialize(),
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
    }); //end of validate

    //--------------------UNASSIGN USER TO AS VENDOR OWNER---------------------
    $('#user-unassign-form').submit( function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: $('#user-unassign-form').attr('action'),
            data: $('#user-unassign-form').serialize(),
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

    //--------------------FAVORITING VENDORS-----------------------------------
    $('.fill').click(function() {
        if ($(this).hasClass('favorited')) {
            $(this).removeClass('favorited');
            $.ajax({
                url: "/vendor/favorite/remove/"+$(this).data('vendor')
            })
        }
        else {
            $(this).addClass('favorited');
            $.ajax({
                url: "/vendor/favorite/add/"+$(this).data('vendor'),
            })
        }
    });

    //--------------------APPROVING VENDORS-----------------------------------
    $('.vend-approve').click(function() {
        $.ajax({
            url: "/admin/approve/"+$(this).data('vendorid'),
            success: function(data){
                $('#message-modal').find('.form-response').html(data.message);
                $('#message-modal').modal('toggle'); //toggle modal on form submit
                if(data.status == 'success'){
                    $('#message-modal').find('.view-button').children().html(data.buttontext);
                    $('.view-button').attr('href', data.url);
                    $(form).find('input[type=submit]').attr('disabled', 'disabled');
                }
            }
        })
    });

    //------------------------CLAIM BUSINESS PROCESS---------------------------
    $('#business-list').on('change', function() {
        var vendorID = $(this).val();
        $.ajax({
            url: "/api/business/"+vendorID,
            success: function(data){
                $('#name').html(data.name);
                $('#phone').html(data.phone);
                $('#address1').html(data.address1);
                $('#address2').html(data.address2);
                $('#businessContact').slideDown(500);
            }
        })
    });

//--------------------------------------------------------------------------------AJAX CALLS
    //-----------------------SENDING EMAIL-------------------------------------//
    var from,to,subject,reason,text,cname;
    $("#contact-submit").click(function(){
        cname=$("#fname").val() + " " + $("#lname").val();
        from=$("#emailadd").val();
        to="matt@oasiscode.com";
        reason=$("#subject").val();
        subject="Contact request from Vendor on a Dime";
        text= "From: " + cname + "\n" + "\n" + "Subject: " + reason + "\n\n" +  "Message: " + $("#message").val();
        $("#context").text("Sending E-mail...Please wait");
        $.get("http://localhost:3000/send",{from:from,to:to,subject:subject,text:text},function(data){
            if(data=="sent")
            {
                window.location.replace("/thankyou");
            }
        });
    });

    //-----------------------GENERAL JAVASCRIPT-------------------------------//

    //Disable delete gallery button if nothing is checked
    $('.delete-photo-check').click(function(){
        if ($(this).is(':checked')){
            $(this).parents('.delete-box').addClass('inputChecked');
        }
        else {
            $(this).parents('.delete-box').removeClass('inputChecked');
        }
        if ($("#delete-gallery input:checkbox:checked").length) {
            $('#delete-gallery-submit').removeAttr('disabled');
        }
        else {
            $('#delete-gallery-submit').attr("disabled","disabled");
        }
    });

    //Disable unnassign owner button if nothing is checked
    $('.user_owned').click(function(){
        if ($(".userUnassignForm input:checkbox:checked").length)
            $(this).siblings('.userUnassignSubmit').removeAttr('disabled');
        else
            $(this).siblings('.userUnassignSubmit').attr("disabled","disabled");
    });

    //Disable assign owner button if proper selection is not made
    $('.vendorAssignList').on('change', function(){
        if ($(this).val() != 'Select One')
            $(this).siblings('.userAssignSubmit').removeAttr('disabled');
        else
            $(this).siblings('.userAssignSubmit').attr("disabled","disabled");
    });

    //---------------------Go to page and scroll to id---------------------//
    // Read the cookie and if it's defined scroll to id
    var scroll = $.cookie('scroll');
    if(scroll){
        scrollToID(scroll, 1000);
        $.removeCookie('scroll');
    } else {
    }

    // Handle event onclick, setting the cookie when the href != #
    $('.scroll-nav').click(function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        var href = $(this).attr('href');
        if(href === '#'){
            scrollToID(id, 1000);
        }else{
            $.cookie('scroll', id, {path: '/'});
            window.location.href = href;
        }
    });

    // scrollToID function
    function scrollToID(id, speed) {
        var offSet = 80;
        var obj = $('#' + id);
        if(obj.length){
            var offs = obj.offset();
            var targetOffset = offs.top - offSet;
            $('html,body').animate({ scrollTop: targetOffset }, speed);
        }
    }

    //----------------------Profile Page Navigation-------------------------//
        var $grid = $('.photo-grid').imagesLoaded( function() {
            // init Masonry after all images have loaded
            $grid.masonry({
                itemSelector: '.photo-item',
                gutter: 10
            });
            $('#userReviews, #userGallery').css("display","none").css("visibility","visible");
        });


        //Favorite Vendors Clicked
        $('#profileFavorites').click(function() {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $('#profileReviews, #profilePhotos').removeClass('active');
                $('#userReviews, #userGallery').fadeOut(500);
                $('#userFavorites').delay(500).fadeIn(500);
            }
        });

        //Reviews Clicked
        $('#profileReviews').click(function() {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $('#profileFavorites, #profilePhotos').removeClass('active');
                $('#userFavorites, #userGallery').fadeOut(500);
                $('#userReviews').delay(500).fadeIn(500);
            }
        });

        //Photos Clicked
        $('#profilePhotos').click(function() {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
                $('#profileFavorites, #profileReviews').removeClass('active');
                $('#userFavorites, #userReviews').fadeOut(500);
                $('#userGallery').delay(500).fadeIn(500);
            }
        });

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

    //Show thumbnails for user image upload
    var inputLocalFont = document.getElementById("userupl");
    if (inputLocalFont) {
        inputLocalFont.addEventListener("change", previewImages, false);
        var label = inputLocalFont.nextElementSibling,
            labelVal = label.innerHTML;
        function previewImages() {
            $('#imagePreview').children().remove();
            var fileList = this.files;

            var anyWindow = window.URL || window.webkitURL;

            for (var i = 0; i < fileList.length; i++) {
                var objectUrl = anyWindow.createObjectURL(fileList[i]);
                $('#imagePreview').append(
                    '<div class="col-sm-2 "><div class="userImageBox"><img class="userImage" src="' + objectUrl + '" /></div></div> '
                );
                window.URL.revokeObjectURL(fileList[i]);
            }

            var fileName = '';
            if (fileList && fileList.length >= 1)
                fileName = ( this.getAttribute('data-multiple-caption') || '' ).replace('{count}', fileList.length);
            else
                fileName = ( this.getAttribute('data-single-caption') || '' ).replace('{count}', fileList.length);

            if (fileName)
                label.querySelector('span').innerHTML = fileName;
            else
                label.innerHTML = labelVal;
        }
    }

    //Change text in label for add to gallery button
    var inputs = document.querySelectorAll( '.inputfile' );
    Array.prototype.forEach.call( inputs, function( input ) {
        var label	 = input.nextElementSibling,
            labelVal = label.innerHTML;

        input.addEventListener( 'change', function( e )
        {
            var reader = new FileReader();

            if ($('#featured-thumbnail').length) {
                reader.onload = function (e) {
                    // remove background from wrapper
                    $(".placeholder, #thumbnail-wrapper").css("background-image","none");
                    // get loaded data and render thumbnail.
                    document.getElementById("featured-thumbnail").src = e.target.result;
                };
            }

            // read the image file as a data URL.
            reader.readAsDataURL(this.files[0]);

            var fileName = '';
            if( this.files && this.files.length >= 1 )
                fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
            else
                fileName = ( this.getAttribute( 'data-single-caption' ) || '' ).replace( '{count}', this.files.length );

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
    $(window).on("load", function() {
        $(".overflow-box").dotdotdot({
            ellipsis	: '... ',
            wrap		: 'word'
        });
    });


    //Initialize slick carousel for featured vendors
    $('.featured-carousel').slick({
        prevArrow:"<div class='left-fade'></div><img class='a-left control-c prev slick-prev' src='/images/left-arrow.png'>",
        nextArrow:"<img class='a-right control-c next slick-next' src='/images/right-arrow.png'><div class='right-fade'></div>",
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

    //----------------------------------------RATEYO INIT------------------------------------------//
    $(".reviewRating").each(function(){
        var rating = $(this).html();
        if($.isNumeric(rating)) {
            $(this).rateYo({
                rating: rating,
                starWidth: "20px",
                normalFill: "#bcbcbc",
                ratedFill: "#282828",
                readOnly: true
            });  
        }
        
    });

    //----------------------------------------MASONRY GALLERY------------------------------------------//
    $('.vendor-item').imagesLoaded()
        .done( function( instance ) {
            $('.vendor-grid').masonry({
                // options
                itemSelector: '.vendor-item',
                gutter: 10
            });
        });

    $('.user-item').imagesLoaded()
        .done( function( instance ) {
            $('.user-grid').masonry({
                // options
                itemSelector: '.user-item',
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
    //List.js options for vendor list
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

        vendorList.on('updated', function(list) {
            if (list.matchingItems.length > 0) {
                $('#no-vendors').hide();
            } else {
                $('#no-vendors').show();
            }
        });

        var updateList = function(){
            var values_cat = $(".cat-s").val();
            var values_city = $(".city-s").val();
            var activeFilters = [];
            var priceBoxes = $('input.price-checkbox');
            for (var i = 0; priceBoxes.length > i; i++)
                if (priceBoxes[i].checked)
                    activeFilters.push($(priceBoxes[i]).data("value"));

            vendorList.filter(function(item) {
                var vendorCategory = item.values().vendCat.replace(/&amp;/g, '&');
                var vendorCity = item.values().vendCity.replace(/&amp;/g, '&');
                var areFilters = activeFilters.length ? (activeFilters.indexOf(item.values().vendPrice) > -1) : true;
                return ((vendorCategory.indexOf(values_cat) !== -1) || values_cat == 'All')
                        && ((vendorCity.indexOf(values_city) !== -1) || values_city == 'All')
                        && (areFilters);
            });
        };

        $(".cat-s, .city-s, input:checkbox[name=price]").change(updateList);
    });

    //List.js options for user list
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
            valueNames: ['userFullName', 'userName', 'userEmail', 'userOwned'],
            page: 8,
            plugins: [
                ListPagination(paginationTopOptions),
                ListPagination(paginationBottomOptions)
            ]
        };

        var userList = new List('users-list', options);
    });
    
}); //end of document ready