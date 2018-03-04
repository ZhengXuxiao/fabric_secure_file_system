$(function() {
  console.log("fuck");
  loadPage();

  function loadPage() {
    $.ajax({
      url:'/query/file',
      type:'post',
      data:{owner:uname},
      success: function(data, status) {
        var myfile = $('#myfile');
        var template = $('#fileTemplate');
        for (var i=0; i<data.length; i++) {
          template.find('.name').text(data[i].name);
          template.find('.keyword').text(data[i].keyword);
          template.find('.owner').text(data[i].owner);
          template.find('.summary').text(data[i].summary);
          myfile.append(template.html());
        }
      },
      error: function(data, status) {
        console.log("error", data);
      }
    });
  }
});
