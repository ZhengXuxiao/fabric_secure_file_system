$(function() {
  loadPage();

  function loadPage() {
    $.ajax({
      url:'/query/file',
      type:'post',
      data:query,
      success: function(data, status) {
        var request = $('#request');
        var template = $('#fileTemplate');
        filelist.empty();
        for (var i=0; i<data.length; i++) {
          template.find('.name').text(data[i].name);
          template.find('.keyword').text(data[i].keyword);
          template.find('.owner').text(data[i].owner);
          template.find('.summary').text(data[i].summary);
          request.append(template.html());
        }
        $('.request').each(function(index, element) {
          $(this).click(function() {
            var data = {};
            data.keyword = $(this).siblings('.keyword').text();
            data.name = $(this).siblings('.name').text();
            data.owner = $(this).siblings('.owner').text();
            console.log(data);
            $.ajax({
              url: '/exchange',
              type: 'post',
              data: data,
              succuss: function(data, status) {
                $(this).attr('disabled', 'true');
              },
              error: function(data, status) {
                console.log('error', data);
              }
            })
          });
        });
      },
      error: function(data, status) {
        console.log("error", data);
      }
    });
  }


});
