
$(document).ready(function(){
    $("#loading").hide()
    //$("#lg_false").hide()
    //$("#false").hide()

    $("input[name='map']").change(function(){
  // action goes here!!
    //console.log( $("input[name='map']:checked").val() )

    if( $("input[name='map']:checked").val() == 'log' ){
      //console.log('LOG')
      $('#div_log_value').show()
    }else{
      //console.log('LIN')
      $('#div_log_value').hide()
    }
    });

    $("#reset_fc").click(function(event) {
      /* get the action attribute from the <form action=""> element */
      //$("#loading").show()
      $("body").css("cursor", "wait");
      var $form = $("#falsecolor-config"),
          url = $form.attr( 'action' );

      $form[0].reset()
      /* Send the data using post with element id name and name2*/
      var posting = $.post( url, $("#falsecolor-config").serialize() );

      /* Alerts the results */
      posting.done(function( data ) {
        $("#lg_false").attr('src', "<?php echo $_SESSION['output_file'] . '_lg.jpg' ?>" + '?' + new Date().getTime())
        $("#false").attr('src', "<?php echo $_SESSION['output_file'] . '_fc.jpg' ?>" + '?' + new Date().getTime())
        //$("#loading").hide()
        $("body").css("cursor", "default");
      });
    });
    $("#update_fc").click(function(event) {

      $("body").css("cursor", "wait");
      //$("#loading").show()
      /* stop form from submitting normally */
      event.preventDefault();

      /* get the action attribute from the <form action=""> element */
      var $form = $("#falsecolor-config"),
          url = $form.attr( 'action' );
      //$("#loading").css("display", "block")
      /* Send the data using post with element id name and name2*/
      var posting = $.post( url, $("#falsecolor-config").serialize() );

      /* Alerts the results */
      posting.done(function( data ) {
        $("#lg_false").attr('src', "<?php echo $_SESSION['output_file'] . '_lg.jpg' ?>" + '?' + new Date().getTime())
        $("#false").attr('src', "<?php echo $_SESSION['output_file'] . '_fc.jpg' ?>" + '?' + new Date().getTime())
        $("body").css("cursor", "default");
        //$("#loading").hide()

      });
    });


  });