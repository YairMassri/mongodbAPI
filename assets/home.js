
$(document).ready(function()
{
   $(".post").click( function() {
      var aId = $(this).parent().parent().parent().attr("id");
      var val = $(this).parent().find("textarea").first().val();
      var lbl = $(this).parent().parent().find(".comment").first();
      $.ajax(  {  "url"    :  "comment.jsp",
                  "method" :  "post",
                  "data"   :  "aid=" + aId + "&val=" + escape(val),
                  "success"   :  function( data ){
                     $(".sliders").slideUp();
                     $(".tar"    ).slideUp();
                     lbl.html( parseInt(lbl.text()) + 1 );
                  }
               });
   });
   
   
   $(".comment").click( function() {
      var aId = $(this).parent().parent().attr("id");
      var lbl = $(this).parent().parent().find(".comments").first();
      $.ajax(  {  "url"       :  "showComment.jsp?aid=" + aId,
                  "success"   :  function( data ){
                     $(".tar"    ).slideUp();
                     lbl.html(data).slideToggle();
                  }
               });
   });
   
   
   $(".like").click( function() {
      var aId = $(this).parent().parent().attr("id");
      var lbl = $(this).parent().parent().find(".likes").first();
      $.ajax(  {  "url"       :  "showLike.jsp?aid=" + aId,
                  "success"   :  function( data ){
                     $(".tar"    ).slideUp();
                     lbl.html(data).slideToggle();
                  }
               });
   })
   
   $(".fa-thumbs-up").click( function() {
      var aId = $(this).parent().parent().attr("id");
      var lbl = $(this).next();
      $.ajax(  {  "url"       :  "like.jsp?aid=" + aId,
                  "success"   :  function( data ){
                     if( data.count != -1 )
                        lbl.html( parseInt(lbl.text()) + 1 );
                  }
               });
   });
   
   $(".fa-commenting-o").click( function() {
      $(".sliders").slideUp();
      $(this).parent().find(".tar").fadeToggle();
   });
});
