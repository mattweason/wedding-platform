const $ = jQuery = require( 'jquery');
require('jquery-ui');
require('bootstrap'); //bootstrap JS
require('jquery-validation'); //form validation

$(document).ready(function() {

    //--------------------CREATING NEW DIVISION, COMPANY, PERSON, CITY---------------------
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
                        $('.modal-content').removeClass('failure').addClass('success'); //change background color if add-form is successful
                        $('#message-modal').find('.view-button').removeClass('notdisplay').attr('href', data.url);
                        $('#message-modal').find('.view-button').children().html(data.buttontext);
                        $(form).find('input[type=submit]').attr('disabled', 'disabled');
                    }
                }
            });
            return false; //since we use Ajax
        }
    }); //end of validate

}); //end of document ready