$(function() {

  loadPage({});

  $('#search').click(function() {
    var name = $('.form-name').val();
    var keyword = $('.form-keyword').val();
    var owner = $('.form-owner').val();
    var query = {};
    if (name) query.name = name;
    if (keyword) query.keyword = keyword;
    if (owner) query.owner = owner;
    loadPage(query);
  });

  function loadPage(query) {
    $.ajax({
      url:'/query/file',
      type:'post',
      data:query,
      success: function(data, status) {
        var filelist = $('#filelist');
        var template = $('#fileTemplate');
        filelist.empty();
        for (var i=0; i<data.length; i++) {
          template.find('.name').text(data[i].name);
          template.find('.keyword').text(data[i].keyword);
          template.find('.owner').text(data[i].owner);
          template.find('.summary').text(data[i].summary);
          filelist.append(template.html());
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
