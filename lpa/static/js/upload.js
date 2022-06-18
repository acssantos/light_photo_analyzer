

$(document).ready(function(){

  $('#rspfile').change(function (event) {
      form_rsp = new FormData();
      form_rsp.append('rsp', event.target.files[0]); // para apenas 1 arquivo
//    var name = event.target.files[0].content.name; // para capturar o nome do arquivo com sua extencao
    
  });
});


//$('#submit-all').click(function (){})
function upload_form(callback) {

  var myForm = document.getElementById('imgUpload');
  formData = new FormData(myForm);  

  $.ajax({
    url: "/form", // Url do lado server que vai receber o arquivo
    data: formData,
    processData: false,
    cache: false,
    contentType: false,
    type: 'POST',
    success: callback,
    dataType: "json"
  });
};



// Dropzone.autoDiscover = false;
Dropzone.options.myDrop = { // The camelized version of the ID of the form element

  url: "/upload",
  maxFilesize: 40,
  clickable: true,
  paramName: "img",
  autoProcessQueue: false,
  uploadMultiple: true,
  parallelUploads: 100,
  addRemoveLinks: true,
  acceptedFiles : "image/jpeg,image/tiff",
  maxFiles: 15,
  previewsContainer: ".mydropzone",


  // The setting up of the dropzone
  init: function() {
    var myDropzone = this;
    var submitButton = document.querySelector("#submit-all")

    // First change the button to actually tell Dropzone to process the queue.
      submitButton.addEventListener("click", function(e) {
      // Make sure that the form isn't actually being sent.
      var div_erro = document.querySelector(".alert-danger");
      //div_erro.style.display = "none";
      e.preventDefault();
      e.stopPropagation();
      console.log("test")
      myDropzone.processQueue();
      
      // upload_form(
      //   function (data) {
      //     dataType: "json"
      //     if(data.status != "success"){
      //         $("#erro").html(data.msg);
      //         $('.alert-danger').css("display", "block");
      //         console.log("ERRO")
      //      }else{
      //         console.log("Sucesso")
      //         myDropzone.processQueue();
      //      }
      // });


    });

    // Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
    // of the sending event because uploadMultiple is set to true.
    this.on("sendingmultiple", function() {
      // Gets triggered when the form is actually being sent.
      // Hide the success button or the complete form.
      var progressBar = document.querySelector(".progress")
      submitButton.disabled = "disabled";
      progressBar.style.display = "";
      
    });

    this.on("successmultiple", function(files, response) {
      // Gets triggered when the files have successfully been sent.
      // Redirect user or notify of success.
      var responseJSON = response;
      console.log(response.status);
      if(responseJSON.status != "success"){

        var progressBar = document.querySelector(".progress")
        submitButton.removeAttribute("disabled");
        progressBar.style.display = "none";

        var div_erro = document.querySelector(".alert-danger");
        var span_erro = document.querySelector("#erro");
        span_erro.innerHTML = responseJSON.msg;
        div_erro.style.display = "";
        scroll(0,0);
        this.removeAllFiles(true);

      }
      else{
        
        upload_form(
          function (data) {
            if(data.status != "success"){
              var progressBar = document.querySelector(".progress")
              submitButton.removeAttribute("disabled");
              progressBar.style.display = "none";

              var div_erro = document.querySelector(".alert-danger");
              var span_erro = document.querySelector("#erro");
              span_erro.innerHTML = data.msg;
              div_erro.style.display = "";
              scroll(0,0);
              Dropzone.forElement("#myDrop").removeAllFiles(true);
              
                //$("#erro").html(data.msg);
                //$('.alert-danger').css("display", "block");
                
                

                console.log("ERRO")
             }else{
              window.location= "/results";
             }
        });
      }
    });
    this.on("errormultiple", function(files, response) {
      // Gets triggered when there was an error sending the files.
      // Maybe show form again, and notify user of error
      //alert("An error occured. Try again later");
    });
  }

}
