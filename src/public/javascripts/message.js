$(function() {
  loadPage();

  function loadPage() {
    var query = {to: uname};
    $.ajax({
      url:'/query/request',
      type:'post',
      data:query,
      success: function(data, status) {
        var message = $('#message');
        var template = $('#fileTemplate');
        var date = new Date();
        message.empty();
        console.log(data);
        for (var i=0; i<data.length; i++) {
          template.find('.panel-title').text('request at '+ Date(parseInt(data[i].requestTime)));
          template.find('.tx_id').text(data[i].tx_id);
          template.find('.from').text(data[i].from);
          template.find('.to').text(data[i].to);
          template.find('.file').text(data[i].file);
          if (data[i].responseTime == 0) {
            template.find('.response').text('No Response');
          } else {
            template.find('.response').text(Date(parseInt(data[i].responseTime)));
          }
          if (data[i].confirmationTime == 0) {
            template.find('.confirm').text('No Confirmation');
          } else {
            template.find('.confirm').text(Date(parseInt(data[i].confirmationTime)));
          }
          message.append(template.html());
          template.find('.download').attr('disabled', 'false');
          template.find('.confirm').attr('disabled', 'false');
          if (data[i].responseTime != 0) {
            template.find('.download').attr('disabled', 'true');
            template.find('.confirm').attr('disabled', 'true');
          }
        }
        $('.respond').each(function(index, element) {
          $(this).click(function() {
            var data = {};
            data.tx_id = $(this).siblings('.tx_id').text();
            data.secret = "secret";
            console.log(data);
            $.ajax({
              url: '/exchange',
              type: 'put',
              data: data,
              succuss: function(data, status) {
                console.log('respond', data.tx_id);
                $(this).attr('disabled', 'true');
              },
              error: function(data, status) {
                console.log('error', data);
              }
            });
          });
        });
      },
      error: function(data, status) {
        console.log('error', data);
      }
    });
  };
});
