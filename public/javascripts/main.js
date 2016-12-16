const $ = jQuery = require( 'jquery');
require('jquery-ui');
require('bootstrap'); //bootstrap JS
require('jquery-validation'); //form validation

$(document).ready(function() {
//--------------------------------------------------------------------------------AJAX CALLS
    //Add function to validator
    $.validator.addMethod("needsSelection", function (value, element) {
        var count = $(element).find('option:selected').length;
        return count > 0;
    });
    $.validator.messages.needsSelection = 'You gotta pick something.';
    //--------------------CREATING NEW VENDOR---------------------
    $('#add-form').validate({
        rules: {
            category: {
                needsSelection: true
            },
            agree: "required"
        },
        messages: {
            category: {
                needsSelection: "Please select at least one Category"
            },
            agree: ""
        },
        ignore: ':hidden:not("#category")',
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
    $('.userAssignForm').submit( function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: $(this).attr('action'),
            data: $(this).serialize(),
            success: function(data){
                $('#message-modal').find('.form-response').html(data.message);
                $('#message-modal').modal('toggle'); //toggle modal on form submit
                if(data.status == 'success'){
                    $('#message-modal').find('.view-button').children().html(data.buttontext);
                    $('.view-button').attr('href', data.url);
                }
            }
        });
    });

    //--------------------UNASSIGN USER TO AS VENDOR OWNER---------------------
    $('.userUnassignForm').submit( function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: $(this).attr('action'),
            data: $(this).serialize(),
            success: function(data){
                $('#message-modal').find('.form-response').html(data.message);
                $('#message-modal').modal('toggle'); //toggle modal on form submit
                if(data.status == 'success'){
                    $('#message-modal').find('.view-button').children().html(data.buttontext);
                    $('.view-button').attr('href', data.url);
                }
            }
        });
    });

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
                $('#businessName').val(data.name);
                $('#businessPhone').val(data.phone);
                $('#businessAdd1').val(data.address1);
                $('#businessAdd2').val(data.address2);
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
    //Contact Form
    $('[data-required]').each(function(i){
        var input = $(this);
        input.change(function(){
            if (this.value.length > 0) {
               input.removeClass('needInput');
            }
        });
    });
    var from,to,subject,reason,text,cname;
    $("#contact-submit").click(function(){
        var input = document.getElementById('email');
        if (input.value.length > 0)
            console.log('You are a bot');

        else {
            var incomplete = 0;
            $('[data-required]').each(function(i){
                if (this.value.length == 0){
                    $(this).addClass('needInput');
                    incomplete++;
                }
            });
            if(incomplete > 0) {
                $("#context").text("Please fill in the required fields.").addClass('colorAlert');
            }
            else {
                cname=$("#fname").val() + " " + $("#lname").val();
                from=$("#emailadd").val();
                to="matt@oasiscode.com";
                reason=$("#subject").val();
                subject="Contact request from Vendor on a Dime";
                text= "From: " + cname + "<br>" + "Email: " + from + "<br><br>" + "Subject: " + reason + "<br><br>" +  "Message: " + $("#message").val();
                $("#context").text("Sending E-mail...Please wait").removeClass('colorAlert');
                $.get("http://localhost:3000/send",{from:from,to:to,subject:subject,text:text},function(data){
                    if(data=="sent")
                    {
                        window.location.replace("/thankyou");
                    }
                });
            }
        }


    });

    //Claim Business Form
    $('[data-required]').each(function(i){
        var input = $(this);
        input.change(function(){
            if (this.value.length > 0) {
                input.removeClass('needInput');
            }
        });
    });

    var cbfrom, cbto, cbname, business, businessName, businessPhone, businessAdd1, businessAdd2, userName, userFullName, userID;
    $("#claim-business-submit").click(function(){
        var input = document.getElementById('email');

        if (input.value.length > 0)
            console.log('You are a bot');

        else {
            var incomplete = 0;
            $('[data-required]').each(function(i){
                if (this.value.length == 0){
                    $(this).addClass('needInput');
                    incomplete++;
                }
            });
            if((incomplete > 0) && ($("#businessName").val().length > 0))
                $("#context").text("Please fill in the required fields.").addClass('colorAlert');

            else if ((incomplete == 0) && ($("#businessName").val().length == 0))
                $("#context").text("Please select a business to claim.").addClass('colorAlert');

            else if ((incomplete > 0) && ($("#businessName").val().length == 0))
                $("#context").text("Please fill in the required fields and select a business to claim.").addClass('colorAlert');

            else {
                cbname=$("#cbfname").val() + " " + $("#cblname").val();
                cbfrom=$("#cbemailadd").val();
                cbto="matt@oasiscode.com";
                userName=$("#userName").val();
                userFullName=$("#userFullName").val();
                userID=$("#userID").val();
                businessName=$("#businessName").val();
                businessPhone=$("#businessPhone").val();
                businessAdd1=$("#businessAdd1").val();
                businessAdd2=$("#businessAdd2").val();
                subject="Claim business request from Vendor on a Dime";
                text=
                    "<h2>Claim Business Request</h2><br>" +
                    "<strong>From:</strong> " + cbname + "<br><br>" +
                    "<strong>Email:</strong> " + cbfrom + "<br><br>" +
                    "<h3 style='margin-bottom:5px;text-decoration:underline;'>User Information</h3>" + '<br>' +
                    "<strong>User Name:</strong> " + userFullName + "<br>" +
                    "<strong>Username:</strong> " + userName + "<br>"+
                    "<strong>User ID #:</strong> " + userID + "<br><br>"+
                    "<h3 style='margin-bottom:5px;text-decoration:underline;'>Vendor Information</h3>" + '<br>' +
                    "<strong>Vendor Name:</strong> " + businessName + "<br>" +
                    "<strong>Vendor Phone:</strong> " + businessPhone + "<br>"+
                    "<strong>Vendor Address 1:</strong> " + businessAdd1 + "<br>"+
                    "<strong>Vendor Address 2:</strong> " + businessAdd2 + "<br>";
                $("#context").text("Sending E-mail...Please wait").removeClass('colorAlert');
                $.get("http://localhost:3000/send",{from:cbfrom,to:cbto,subject:subject,text:text},function(data) {
                    if (data == "sent") {
                        window.location.replace("/thankyou");
                    }
                });
            }
        }
    });

    //-----------------------GENERAL JAVASCRIPT-------------------------------//

    //Slide down user-area for mobile when profile button is clicked
    $('#profile-dropdown').click(function(){
        $('.user-area-mobile').toggle("slide", { direction: "right" });
    });

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
                gutter: 0
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

    //Center featured vendor carousel if there is only one item
    $(window).on("load", function() {
        $('.slick-track').each(function(){
            if($('> div',this).length == 1)
            {
                $(this).addClass('center');
            }
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
                breakpoint: 1399,
                settings: {
                    arrows: true,
                    centerMode: true,
                    centerPadding: '120px',
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 1199,
                settings: {
                    arrows: true,
                    centerMode: true,
                    centerPadding: '80px',
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 991,
                settings: {
                    arrows: false,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    centerMode: true,
                    centerPadding: '0px',
                    slidesToShow: 1
                }
            }
        ]
    });



    //----------------------------------------RATEYO INIT------------------------------------------//
    var svg = "<svg id='iconmonstr' viewBox='0 0 24 24'><style>.st0{fill:#DBDBDB;}</style><path id='coin-2' d='M-35.878 10.54c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zm0 0c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zm0 0c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zM-35.938 0c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 22c-5.51 0-10-4.49-10-10s4.49-10 10-10 10 4.49 10 10-4.49 10-10 10zm.06-11.46c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zm0 0c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54z'/><path class='st0' d='M-35.938 2c-5.51 0-10 4.49-10 10s4.49 10 10 10 10-4.49 10-10-4.49-10-10-10zm1 14.95V18h-1v-1c-1.03-.02-2.11-.26-3-.72l.45-1.65c.96.37 2.23.77 3.23.54 1.15-.26 1.38-1.44.11-2.01-.93-.43-3.77-.8-3.77-3.24 0-1.37 1.04-2.59 2.98-2.85V6h1v1.02c.72.02 1.54.14 2.44.42l-.36 1.65c-.77-.27-1.62-.52-2.44-.47-1.49.09-1.62 1.38-.58 1.92 1.71.8 3.94 1.4 3.94 3.54 0 1.72-1.34 2.64-3 2.87z'/><path d='M12.003.99C5.92.99.993 5.918.993 12s4.927 11.01 11.01 11.01c6.074 0 11.01-4.928 11.01-11.01S18.075.99 12.002.99zm0 21.102C6.433 22.092 1.91 17.57 1.91 12S6.434 1.908 12.003 1.908c5.56 0 10.092 4.523 10.092 10.092s-4.533 10.092-10.092 10.092z'/><path class='st0' d='M22.093 12c0 5.57-4.53 10.09-10.09 10.09-5.57 0-10.09-4.52-10.09-10.09s4.52-10.09 10.09-10.09c5.56 0 10.09 4.52 10.09 10.09z'/><path d='M14.51 14.314c.212.257.413.502.602.737.188.235.38.48.578.738-.393.302-.835.552-1.327.748-.49.197-1.023.31-1.597.34v1.315h-1.428V16.72c-.545-.136-1.05-.352-1.52-.647-.467-.293-.872-.656-1.21-1.087-.342-.43-.61-.906-.806-1.428-.197-.52-.294-1.076-.294-1.665 0-.574.097-1.126.294-1.655.197-.528.465-1.005.805-1.428.34-.424.745-.783 1.213-1.077.467-.294.974-.51 1.52-.646v-1.45h1.427v1.292c.574.03 1.114.144 1.62.34.506.197.964.446 1.372.748L14.51 9.487c-.226-.18-.487-.33-.782-.442-.294-.113-.616-.185-.963-.215v6.14c.694-.045 1.276-.264 1.744-.656zM9.435 11.89c0 .664.175 1.253.52 1.766.35.514.81.884 1.384 1.11v-5.71c-.574.21-1.035.57-1.383 1.077-.346.506-.52 1.09-.52 1.756z'/></svg>";

    var svg2 = "<svg id='iconmonstr' viewBox='0 0 24 24'><style>.st0{fill:#DBDBDB;}</style><path id='coin-2' d='M-35.878 10.54c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zm0 0c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zm0 0c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zM-35.938 0c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 22c-5.51 0-10-4.49-10-10s4.49-10 10-10 10 4.49 10 10-4.49 10-10 10zm.06-11.46c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54zm0 0c-1.04-.54-.91-1.83.58-1.92.82-.05 1.67.2 2.44.47l.36-1.65c-.9-.28-1.72-.4-2.44-.42V6h-1v1.07c-1.94.26-2.98 1.48-2.98 2.85 0 2.44 2.84 2.81 3.77 3.24 1.27.57 1.04 1.75-.11 2.01-1 .23-2.27-.17-3.23-.54l-.45 1.65c.89.46 1.97.7 3 .72v1h1v-1.05c1.66-.23 3-1.15 3-2.87 0-2.14-2.23-2.74-3.94-3.54z'/><path class='st0' d='M-35.938 2c-5.51 0-10 4.49-10 10s4.49 10 10 10 10-4.49 10-10-4.49-10-10-10zm1 14.95V18h-1v-1c-1.03-.02-2.11-.26-3-.72l.45-1.65c.96.37 2.23.77 3.23.54 1.15-.26 1.38-1.44.11-2.01-.93-.43-3.77-.8-3.77-3.24 0-1.37 1.04-2.59 2.98-2.85V6h1v1.02c.72.02 1.54.14 2.44.42l-.36 1.65c-.77-.27-1.62-.52-2.44-.47-1.49.09-1.62 1.38-.58 1.92 1.71.8 3.94 1.4 3.94 3.54 0 1.72-1.34 2.64-3 2.87z'/><path d='M12.003.99C5.92.99.993 5.918.993 12s4.927 11.01 11.01 11.01c6.074 0 11.01-4.928 11.01-11.01S18.075.99 12.002.99zm0 21.102C6.433 22.092 1.91 17.57 1.91 12S6.434 1.908 12.003 1.908c5.56 0 10.092 4.523 10.092 10.092s-4.533 10.092-10.092 10.092z'/><path class='st0' d='M12.003 1.908C6.433 1.908 1.91 6.43 1.91 12s4.523 10.092 10.092 10.092c5.56 0 10.092-4.523 10.092-10.092S17.562 1.908 12.004 1.908zm7.403 4.853c.257.36.477.735.68 1.13h.008c0 .008 0 .008.01.017v.01s.008.008.008.017v.01h.01V7.96h.008v.008s0 .01.01.01V7.997h.008V8.015h.01V8.033h.008V8.05h.01V8.07h.008V8.087h.01V8.105h.008V8.123s.01 0 .01.008v.01s.008 0 .008.008v.01s0 .008.01.008v.01l.008.008v.01c0 .008.01.008.01.017v.01c.008.008.008.008.008.017 0 0 .01 0 .01.01s.008.008.008.017c.147.33.275.67.385 1.018l-.873.275c-.257-.817-.642-1.578-1.138-2.284l.756-.515zM14.92 3.414h.018c.9.312 1.743.752 2.486 1.312l-.55.743c-.68-.514-1.44-.917-2.248-1.193l.294-.862zm-5.018-.24c.01-.008.018-.008.018-.008h.01c.008 0 .008 0 .017-.01H9.983l.01-.008H10.028v-.01H10.064l.01-.008h.036v-.01H10.153v-.01H10.2c0-.01 0-.01.008-.01H10.244c0-.008.01-.008.01-.008H10.29v-.01H10.333v-.01h.053c0-.008.01-.008.018-.008H10.434c.008-.01.017-.01.017-.01h.028c.01 0 .018-.008.028-.008.027 0 .064-.01.1-.018.13-.018.267-.037.395-.046.02 0 .038-.01.056-.01.046 0 .1-.008.147-.008.01 0 .018 0 .027-.01H11.33c.01 0 .018 0 .028-.008h.136l.008-.01h.218V2.93H12.107l-.01.917h-.118c-.862 0-1.706.138-2.514.394l-.262-.873c.23-.074.46-.138.698-.193zm-6.744 6.78c.01-.017.01-.036.01-.054h.008v-.02V9.863c.01 0 .01-.01.01-.01v-.008-.01-.008l.008-.01V9.81v-.01-.008h.01v-.01-.028s.008 0 .008-.01V9.725v-.008h.01v-.01V9.7v-.01-.008h.008v-.01-.01-.008-.01h.01v-.01-.008-.01l.008-.008v-.01-.01c0-.008 0-.008.01-.017v-.03h.008c.028-.127.073-.247.11-.366l.874.285c-.266.806-.404 1.65-.404 2.513l-.917-.01c0-.688.08-1.367.228-2.01zm1.477 7.34c-.55-.76-.982-1.614-1.275-2.522l.872-.283c.257.817.642 1.578 1.147 2.275l-.745.532zm.78-10.1l-.743-.542c.248-.338.523-.66.817-.962v-.01c.008 0 .008-.008.017-.017h.01c0-.008 0-.008.008-.008v-.01h.01v-.008c.008 0 .008-.01.008-.01.01 0 .01 0 .01-.008.008 0 .008 0 .008-.01.01 0 .01 0 .01-.008h.01v-.01h.008v-.01h.01v-.01h.008V5.56h.01v-.01c.008 0 .008 0 .008-.008h.01v-.01h.008v-.01h.01v-.008h.008v-.01c.01 0 .01-.008.01-.008h.008v-.01c.01 0 .01-.008.01-.008H5.7v-.01h.01c0-.01.008-.01.008-.018h.01v-.01c.008 0 .008-.01.017-.01v-.008c.01 0 .01-.01.018-.01v-.008h.01c0-.01.008-.01.017-.018l.02-.02c.275-.256.568-.495.87-.715l.533.744c-.688.505-1.293 1.11-1.798 1.8zM9.14 20.615c-.477-.156-.936-.358-1.367-.587-.018-.01-.037-.02-.046-.028-.01 0-.018-.01-.028-.01s-.02-.008-.03-.008c-.366-.202-.715-.422-1.045-.67l.54-.743c.69.513 1.45.907 2.258 1.173l-.283.872zm5.587.046h-.01H14.7c0 .01-.01.01-.01.01H14.673s-.008 0-.008.01H14.646h-.01v.008h-.008-.01-.008v.01H14.583l-.01.008h-.026v.01h-.01H14.52l-.01.008h-.03v.01h-.01-.01-.008c0 .008-.01.008-.01.008h-.008H14.416c0 .01 0 .01-.01.01H14.4h-.01c-.008 0-.008 0-.008.008h-.01H14.353c0 .01-.008.01-.008.01h-.01H14.317v.008h-.036v.01h-.008H14.244v.008h-.017H14.21v.01h-.01-.01H14.173v.008h-.035v.01H14.11h-.01c0 .008 0 .008-.008.008H14.064l-.008.01H14.03h-.01-.008v.008H13.984c-.008 0-.008 0-.017.01H13.94s-.01 0-.01.008h-.01-.01-.008-.01l-.008.01H13.857c-.01 0-.01.008-.018.008H13.81h-.01l-.008.01h-.018-.01c-.008 0-.008 0-.017.008h-.02-.008s-.01 0-.018.01h-.047v.008h-.017H13.613l-.01.01h-.013-.01H13.563c-.008 0-.008.008-.017.008h-.018H13.5v.01h-.036-.01c-.008 0-.008.008-.017.008H13.41 13.392c-.01.01-.01.01-.018.01h-.045v.008h-.065v.01H13.2s-.008 0-.008.008h-.055-.01l-.008.01h-.028H13.056c-.01 0-.01.008-.018.008H13.01h-.008H12.974h-.008v.01h-.018-.038-.008-.01-.026v.008h-.01H12.84h-.072l-.008.01H12.73 12.713 12.695h-.008-.01H12.66 12.64v.008H12.596 12.56h-.01H12.525 12.496v.01H12.46 12.425h-.008H12.388h-.074-.008-.01H12.28h-.008c0 .008-.01.008-.01.008H12.243 12.207 12.2 12.17 12.135 12.1h-.008-.064-.008H12h-.055v-.917h.064c.834 0 1.66-.13 2.458-.377l.275.872c-.006.007-.016.007-.016.016zm2.8-1.467c-.01.01-.01.018-.02.018 0 0-.008 0-.008.01 0 0-.01.01-.02.01 0 .008-.008.008-.008.008s-.01 0-.01.01h-.008v.008h-.01v.01h-.008c-.01 0-.01 0-.01.008h-.008v.01h-.01v.008H17.4s-.01 0-.01.01h-.008v.008h-.01v.01h-.022v.008h-.008v.01h-.01l-.008.008-.01.01h-.008c-.01.008-.027.017-.037.027l-.533-.743c.697-.495 1.303-1.1 1.817-1.79l.734.552c-.496.68-1.093 1.277-1.762 1.79zm3.33-5.22V14c-.01 0-.01.01-.01.018V14.036c0 .01-.01.01-.01.01v.026s0 .01-.008.01v.036h-.01V14.154h-.01V14.19s-.01 0-.01.01V14.217s0 .008-.008.008V14.263c-.01.008-.01.008-.01.017-.054.21-.11.413-.183.605l-.863-.294c.266-.806.413-1.65.422-2.504l.916.01c-.01.623-.083 1.228-.21 1.816 0 .024 0 .042-.01.06z'/><path d='M11.984 2.926H11.948h-.01H11.885h-.008-.01H11.81h-.01-.008H11.738v.01H11.7 11.655 11.628 11.59h-.064-.008l-.01.008h-.028-.036-.018H11.38h-.008c-.01.01-.018.01-.028.01h-.018-.083c-.01.008-.018.008-.027.008-.046 0-.1.01-.147.01-.018 0-.037.008-.055.008-.128.01-.266.028-.394.046-.036.01-.072.018-.1.018-.01 0-.018.01-.028.01h-.027s-.01 0-.018.008H10.42c-.01 0-.018 0-.018.01H10.348v.008h-.018H10.303v.01H10.275h-.008s-.01 0-.01.008h-.008-.028c-.01 0-.01 0-.01.01H10.17v.008h-.055v.01H10.086h-.01l-.008.008h-.01-.008-.02v.01H10.003h-.01l-.01.012h-.008H9.947c-.01.01-.01.01-.018.01h-.01s-.01 0-.018.008c-.24.055-.468.12-.698.193l.284.872c.807-.258 1.65-.395 2.514-.395v-.92h-.018zM6.68 4.65c-.302.22-.595.46-.87.717l-.018.018s-.02.01-.02.018h-.008v.01c-.01 0-.01.008-.018.008v.01c-.01 0-.01.01-.018.01v.008h-.01c0 .01-.008.01-.008.018H5.7v.01h-.01s0 .008-.01.008v.01h-.008s0 .008-.01.008v.01h-.008v.008h-.01v.01h-.01v.008h-.008c0 .01 0 .01-.01.01v.008H5.61v.01h-.01v.008h-.01v.01H5.58v.008h-.01c0 .01 0 .01-.008.01 0 .008 0 .008-.01.008 0 .01 0 .01-.008.01 0 0 0 .008-.01.008v.01h-.01v.008c-.008 0-.008 0-.008.01h-.01c-.008.014-.008.023-.017.023v.008c-.295.303-.57.624-.818.963l.743.542c.505-.688 1.11-1.294 1.798-1.798L6.68 4.65zM3.38 9.175c-.037.12-.083.24-.11.367h-.01v.028c-.008.01-.008.01-.008.02V9.605l-.01.01V9.64h-.008V9.678h-.01V9.714h-.01V9.742c0 .008-.008.008-.008.008v.036h-.01V9.814l-.008.012V9.854s0 .008-.01.008V9.898H3.17c0 .018 0 .037-.01.055-.146.642-.228 1.32-.228 2.01l.917.008c0-.86.138-1.705.404-2.513l-.872-.283zm.854 5.312l-.872.285c.294.91.725 1.763 1.275 2.524l.743-.532c-.504-.698-.89-1.46-1.146-2.276zm2.935 4.083l-.54.742c.33.248.678.468 1.045.67.01 0 .018.01.028.01s.018.008.027.008c.01.01.027.018.046.028.43.23.89.43 1.367.587l.284-.872c-.807-.266-1.568-.66-2.257-1.174zm7.294 1.21c-.797.248-1.623.376-2.458.376h-.064v.917H12.254s.01 0 .01-.01H12.48v-.008H12.622v-.01H12.74l.01-.008H12.847v-.01H12.938v-.008H13.01s.01-.01.018-.01h.064l.03-.01h.064c0-.01.01-.01.01-.01h.063v-.008h.063v-.01h.045c.01 0 .01 0 .018-.008H13.432s.008-.01.017-.01h.044v-.008H13.54s.008-.01.017-.01H13.593l.01-.008H13.646v-.01h.047c.008-.008.017-.008.017-.008H13.74c.01-.01.01-.01.018-.01H13.783l.01-.008H13.828c.01 0 .01-.01.018-.01H13.874l.008-.008H13.918c0-.01.01-.01.01-.01h.026c.01-.008.01-.008.018-.008H14v-.01H14.035l.008-.008H14.072c.008 0 .008 0 .008-.01H14.116v-.008h.036v-.01H14.188v-.008H14.224v-.01H14.26v-.008H14.297v-.01H14.322s.01 0 .01-.008H14.36c0-.01 0-.01.008-.01H14.386c.01 0 .01 0 .01-.008H14.42s.01 0 .01-.01H14.457v-.008H14.486l.008-.01H14.522v-.008h.025l.01-.01H14.584v-.008H14.61v-.01h.028c0-.008.01-.008.01-.008H14.665s.008 0 .008-.01H14.702c0-.008.008-.008.008-.008l-.25-.878zm4.093-2.927c-.514.688-1.12 1.294-1.817 1.79l.532.742c.01-.01.028-.018.037-.028h.01l.008-.01.01-.008h.008v-.01h.01v-.01H17.368v-.008h.01v-.01h.008c0-.008.01-.008.01-.008h.008v-.01h.01v-.008h.008c0-.01 0-.01.01-.01h.008v-.008h.01v-.01h.008c0-.008.01-.008.01-.008s.008 0 .008-.01c.01 0 .018-.008.018-.008 0-.01.01-.01.01-.01.008 0 .008-.008.017-.017.67-.514 1.267-1.11 1.763-1.79l-.73-.552zm1.606-4.76c-.01.852-.157 1.696-.423 2.504l.862.294c.072-.192.127-.393.183-.604 0-.01 0-.01.01-.018V14.24v-.008c.008 0 .008-.01.008-.01V14.205c0-.008.01-.008.01-.008v-.01-.008-.01-.008h.01v-.01-.008V14.124h.008v-.037c.01 0 .01-.01.01-.01v-.017-.01s.008 0 .008-.008v-.01-.008c0-.01 0-.018.01-.018v-.028c.008-.018.008-.037.008-.055.128-.587.202-1.193.21-1.817l-.915-.014zm.118-3.818c0-.01-.01-.01-.01-.018s-.008-.01-.008-.01c0-.008 0-.008-.01-.017v-.01c0-.01-.008-.01-.008-.018v-.01l-.01-.008v-.01c-.008 0-.008-.008-.008-.008v-.01c0-.01-.01-.01-.01-.01V8.14c0-.01-.008-.01-.008-.01V8.12v-.01h-.01v-.008-.01h-.008V8.075h-.01v-.01-.01h-.008v-.008-.01h-.01V8.02h-.01V8h-.01V7.982c-.01 0-.01-.01-.01-.01v-.01h-.008v-.008-.01h-.01v-.008c0-.01-.008-.018-.008-.018v-.01c-.01-.01-.01-.01-.01-.018h-.008c-.202-.394-.422-.77-.68-1.128l-.75.523c.494.706.88 1.468 1.137 2.284l.872-.276c-.112-.35-.24-.69-.387-1.02zm-5.34-4.862h-.018l-.294.862c.807.275 1.57.68 2.248 1.193l.55-.743c-.742-.56-1.587-1-2.486-1.312zm-2.908-.487h-.01H12.003v.917h.12l.01-.917h-.102zM13.73 13.662c.154.187.3.366.438.537.137.17.278.348.42.536-.286.22-.607.402-.966.545-.357.144-.745.227-1.164.25v.957h-1.04v-1.073c-.397-.1-.766-.256-1.107-.47-.34-.215-.635-.48-.882-.794-.248-.314-.443-.66-.587-1.04-.142-.38-.213-.784-.213-1.213 0-.418.07-.82.214-1.206.144-.384.34-.73.588-1.04.247-.307.542-.57.883-.783.34-.215.71-.37 1.108-.47v-1.06h1.04v.94c.418.023.812.106 1.18.25.37.142.703.324 1 .544l-.908 1.074c-.165-.132-.355-.24-.57-.322-.214-.082-.45-.135-.702-.157v4.475c.507-.033.93-.192 1.272-.478zm-3.7-1.767c0 .484.128.914.38 1.287.255.375.59.644 1.01.81V9.83c-.42.153-.755.414-1.01.783-.252.37-.38.795-.38 1.28z'/></svg>";

    $(".reviewRating").each(function(){
        var rating = $(this).html();
        if($.isNumeric(rating)) {
            $(this).rateYo({
                rating: rating,
                starWidth: "24px",
                normalFill: "#bcbcbc",
                ratedFill: "#282828",
                readOnly: true,
                starSvg: svg2
            });
        }

    });

    //----------------------------------------MASONRY GALLERY------------------------------------------//
    $('.vendor-item').imagesLoaded()
        .done( function( instance ) {
            $('.vendor-grid').masonry({
                // options
                itemSelector: '.vendor-item',
                gutter: 0,
                percentPosition: true
            });
        });

    $('.user-item').imagesLoaded()
        .done( function( instance ) {
            $('.user-grid').masonry({
                // options
                itemSelector: '.user-item',
                gutter: 0
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
            innerWindow: 1,
            outerWindow: 1
        };
        var paginationBottomOptions = {
            name: "paginationBottom",
            paginationClass: "paginationBottom",
            innerWindow: 1,
            outerWindow: 1
        };
        var options = {
            valueNames: ['vendName', 'vendCat', 'vendPrice', 'vendCity', 'vendTags'],
            page: 6,
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
            valueNames: ['userFullName', 'userName', 'userEmail', 'userOwned', 'userID'],
            page: 8,
            plugins: [
                ListPagination(paginationTopOptions),
                ListPagination(paginationBottomOptions)
            ]
        };

        var userList = new List('users-list', options);
    });
    
}); //end of document ready