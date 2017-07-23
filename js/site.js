$( document ).ready(function() {
  
  var api = "https://api.github.com/users/ex0dus-0x/repos";
    $.get(api, function (data) {
        $.each(data, function (idx, obj) {
          
            if(obj.language == null){
              obj.language = "None";
            }
                      
            $("#repos").append("<h3 class='section-heading'><a href='" + obj.html_url + "'>" + obj.name + "</a> <i class='fa fa-github'/></h3>");
            
            if((obj.homepage != "") && (obj.homepage !== null)){
              $("#repos").append("<h5><i class='fa fa-user'/> <a href='" + obj.homepage + "'> Homepage </a></h5>");
            }

            if(obj.fork == true) {
              $("#repos").append("<p style='font-size: 10px'> (this repo is a fork) </p>");
            }
            $("#repos").append("<p>" + obj.description + "</p>");
            $("#repos").append("<p style='font-weight: light'> <b>Stars:</b> " + obj.stargazers_count + " | <b>Forks:</b> " + obj.forks + " | <b>Issues:</b> " + obj.open_issues + " | <b>Language:</b> " + obj.language + "</p>");
            
        });
    });
  
});



