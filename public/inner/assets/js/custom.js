/**
 * Created by senthil on 02/06/17.
 */


$(document).ready(function () {

  //$('#bitcoinQRcode').qrcode({width: 100, height: 100, text: '<%= user.btcWallet %>'});

  function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
  }

  $('#purchase-points-form').submit(function (e) {
    e.preventDefault();
    e.stopPropagation();
    //$('#buy-elc-submit').attr("disabled", true);
    //console.info('form submit');
    var newBtc = $('#buy-bitcoin').val();
    $('#btcFinalBalance').val(newBtc);
    //var availableBtc = $('#btcBalance').val();
    var formObj = $("#purchase-points-form");
    //console.info('form submit');
    //if (newBtc > 0) {

    //$('#modal-container').LoadingOverlay("show");
    //if (newBtc <= availableBtc) {
    //$('#btc-message').hide();

    //$("#purchase-points-form").submit();
    var url = formObj.data("url");
    //console.info('url = ', url);
    var data = {};
    var formSubmit = formObj.data("form");
    var type = formObj.data("method");
    console.info('type = ', type);
    console.info('url = ', url);
    var formElement = formObj.closest('form');
    data = $(formElement).serialize();
    console.info('submitting = ', data);
    $.ajax({
      url: url,
      data: data,
      processData: false,
      type: type,
      error: function (err) {
        //$('#modal-container').LoadingOverlay("hide");
        //$('#buy-elc-submit').attr("disabled", false);
        console.info('err = ', err);
      },
      success: function (data) {
        console.info('data = ', data);
        $('.content-holder').html('');
        $('.content-holder').html(data);
        //console.info('success = ', data);
        //$('#modal-container').LoadingOverlay("hide");
        //$('#buy-elc-submit').attr("disabled", false);
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        snd.play();
        location.href = "/web/points/buy";
      }
    });
    /*} else {
      $('#btc-message-content').html('Your balance is not enough');
      $('#btc-message').show();
      $('#modal-container').LoadingOverlay("hide");
      $('#buy-elc-submit').attr("disabled", false);
    }*/
    /*} else {
      $('#btc-message-content').html('Please provide ELC value');
      $('#btc-message').show();
      $('#modal-container').LoadingOverlay("hide");
      $('#buy-elc-submit').attr("disabled", false);
    }*/
    //e.preventDefault();
  });

  function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
  }

  $(document.body).on('click', '#bitcoin-address-copy', function (e) {

    // event handler

    // find target element
    var
      t = e.target,
      c = t.dataset.copytarget,
      inp = $('#bitcoin-address');

    // is element selectable?
    if (inp && inp.select) {

      // select text
      inp.select();

      try {
        // copy text
        document.execCommand('copy');
        inp.blur();

        // copied animation
        //t.classList.add('copied');
        //setTimeout(function() { t.classList.remove('copied'); }, 1500);
        swal("Copied!", "Bitcoin address copied!!", "success");
      }
      catch (err) {
        //alert('please press Ctrl/Cmd+C to copy');
      }

    }

  });

  function initiateBitcoin() {
    var btcs = new WebSocket('wss://ws.blockchain.info/inv');
    var userName = $('#deposit-initiate').data("username");
    var userId = $('#deposit-initiate').data("userid");
    var btcWallet = $('#deposit-initiate').data("btcwallet");
    var context = $('#deposit-initiate').data("context");
    $('#bitcoinQRcode').qrcode({ width: 100, height: 100, text: btcWallet });
    btcs.onopen = function () {
      //console.info('block chain initiated')
      btcs.send(JSON.stringify({ "op": "addr_sub", "addr": btcWallet }));
      //var amount = 23282828;
      var url = "/rest/api/v1/points/buy/initiate";
      var data = {};
      data.userId = userId;
      data.userName = userName;
      data.address = btcWallet;
      data.addressType = 'BTC';
      data.value = parseFloat($('#buy-bitcoin').val());
      data.usd = parseFloat($('#buy-usd').val());
      data.points = parseFloat($('#purchase-points').val());
      data.hash = 'Initiated';

      ////console.info('data = ', data);
      $.ajax({
        url: url,
        data: JSON.stringify(data),
        processData: false,
        type: 'POST',
        dataType: "json",
        contentType: "application/json",
        error: function (err) {
          //console.info('err = ', err);
        },
        success: function (result) {
          //console.info('data = ', result.data);
          $('#blockchain-initiated-id').val(result.data._id);
          //$('#purchase-points-form').submit();
        }
      });
    };

    btcs.onmessage = function (onmsg) {
      var response = JSON.parse(onmsg.data);
      var getOuts = response.x.out;
      var countOuts = getOuts.length;
      for (i = 0; i < countOuts; i++) {
        //check every output to see if it matches specified address
        var outAdd = response.x.out[i].addr;
        $('#hash').val(response.x.hash);
        var specAdd = btcWallet;
        if (outAdd == specAdd) {
          console.info('response.x.out[i] = ', response.x.out[i]);
          console.info('btcWallet = ', btcWallet);
          var amount = response.x.out[i].value;
          var calAmount = amount / 100000000;
          var bitcoinValue = $('#buy-bitcoin').val();
          if (calAmount == bitcoinValue) {
            $('#messages').prepend("Received " + calAmount + " BTC");
            $('#purchase-points-form').submit();
            swal("Congratulation! Exchange Completed", "You will see your points in your Trade wallet, Thank you for using Quberos Automic Swap service.", "success");
            //$("#buy-units").trigger("click");
            location.href = '/web/points/buy';
          }
        }
      }
    } //Uncomment this block

    setTimeout(function () {
      $('#hash').val('2138172381238172873128');
      var specAdd = "1PjmVHWtcNnaZ2AtgoEfJtEMTYEp1bv2tZ";
      var amount = 0.111;
      var calAmount = amount / 100000000;
      var bitcoinValue = 0.111;
      //if (calAmount == bitcoinValue) {
      $('#messages').prepend("Received " + calAmount + " BTC");
      //console.info('purchase-points-form submit');
      $('#purchase-points-form').submit();
      swal("Congratulation! Exchange Completed", "You will see your points in your Trade wallet, Thank you for using Quberos Automic Swap service.", "success");
      //$("#buy-units").trigger("click");
      location.href = '/web/points/buy';
      //}
    }, 3000);
  }

  $(document.body).on('keyup', '#purchase-points', function () {
    //console.info('purchase-points');
    var value = $(this).val();
    if (value > 0) {
      $('#deposit-initiate').attr("disabled", true);
      var usd = value * 1;
      //var actualUSD = usd + parseFloat(usd) * 0.01;
      var actualUSD = usd;
      var ops = {};
      ops.value = actualUSD;
      ops.usd = usd;
      getCryptoData(ops)
      $('#buy-usd').val(usd);
      //$('#usd-rate').html(usd);
    } else {
      $('#deposit-initiate').attr("disabled", true);
    }
  });


  $(document.body).on('click', '#password-update-btn', function () {
    var url = "/web/profile/password";
    var formObj = $("#profile-password-form");
    var type = formObj.data("method");
    console.info('type = ', type);
    console.info('url = ', url);
    var formElement = formObj.closest('form');
    data = $(formElement).serialize();
    console.info('data = ', data);
    $.ajax({
      url: url,
      data: JSON.stringify(data),
      processData: false,
      type: 'POST',
      error: function (err) {
        //console.info('err = ', err);
      },
      success: function (data) {
        console.info('result');
      }
    });
  });

  $(document.body).on('click', '#deposit-initiate', function () {
    // Set the date we're counting down to
    $('#purchase-points').attr('readonly', true);
    $('#deposit-initiate').attr("disabled", true);
    $('#initiate-deposit').show();
    $('#deposit-value').html('Required Bitcoin Value :  ' + $('#buy-bitcoin').val());
    //console.info('initiated');
    swal({
      title: "Are you sure?",
      text: "Confirm, to initiate the BTC process",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn-danger",
      confirmButtonText: "Yes, confirm!",
      cancelButtonText: "No, cancel pls!",
      closeOnConfirm: false,
      closeOnCancel: false
    },
      function (isConfirm) {
        if (isConfirm) {
          //initiateBitcoin();
          swal("Initiated!", "Deposit Initiated.", "success");
        } else {
          swal("Cancelled", "Your BTC initiation process cancelled", "error");
        }
      });
  });

  function getCryptoData(ops) {
    $.ajax({
      url: "https://blockchain.info/tobtc?currency=USD&value=" + ops.value,
      data: '',
      processData: false,
      type: 'GET',
      error: function (err) {
        //console.info('err = ', err);
      },
      success: function (data) {
        $('#buy-bitcoin').val(data);
        $('#deposit-initiate').attr("disabled", false);
      }
    });
  }

  $(document.body).on('keyup', '#noOfUnits', function () {
    var obj = $(this).val($(this).val().replace(/[^\d].+/, ""));
    if ((event.which < 48 || event.which > 57)) {
      event.preventDefault();
    }
    $('#required-points').val($(this).val() * 135);
  });

  $(document.body).on('click', '.request-btn', function () {
    console.info("clicked");
    var id = $(this).data("id");
    //console.info('data id = ', id);
    var self = $(this);
    swal({
      title: "Are you sure the points not credited?",
      text: "Confirm, to request",
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn-danger",
      confirmButtonText: "Yes, confirm!",
      cancelButtonText: "No, cancel pls!",
      closeOnConfirm: false,
      closeOnCancel: false
    },
      function (isConfirm) {
        if (isConfirm) {
          var url = "/rest/api/v1/points/buy/request";
          //console.info('url = ', url);
          var data = {};
          data.id = id;
          $.ajax({
            url: url,
            data: JSON.stringify(data),
            processData: false,
            type: 'POST',
            dataType: "json",
            contentType: "application/json",
            error: function (err) {
              //console.info('err = ', err);
            },
            success: function (data) {
              //console.info('data = ', data);
              //$('#request-status').html('<span class="text-info">Requested</span>');
              self.parent().html('<span class="tag tag-default tag-warning">Requested</span>');
              swal("Initiated!", "Your BTC deposit request initiated successfuly.", "success");
            }
          });
        } else {
          swal("Cancelled", "Your BTC  deposit request process cancelled", "error");
        }
      }
    );
  });

  $(document.body).on('click', '#buy-units-btn', function () {
    var noOfUnits = $('#noOfUnits').val();
    var userId = $('#userId').val();
    var availablePoints = $('#availablePoints').val();
    var totalNoOfUnits = noOfUnits * 135;

    if (noOfUnits > 0 && totalNoOfUnits <= availablePoints) {
      swal({
        title: "Are you sure?",
        text: "You are about to purchase Lot(s)",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DA4453",
        confirmButtonText: "Buy the Lot(s)!!!",
        cancelButtonText: "No, cancel Lot(s)",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {

          //swal("Changed!", "Confirmed the Block!!", "success");
          //sc.get([id]).status('booked');
          purchaseBlocks(totalNoOfUnits, userId);
        } else {
          swal("Cancelled", "Canceled the Lot(s).", "error");
        }
      });
    } else if (totalNoOfUnits > availablePoints) {
      swal("Error!", "You don't have sufficient points in your account", "error");
    } else {
      swal("Error!", "Minimum of 1 lot required", "error");
    }
  });

  function purchaseBlocks(totalNoOfUnits, userId) {
    //console.info('totalNoOfUnits = ', totalNoOfUnits);
    //console.info('userId = ', userId);
    var purchaseUrl = "/rest/api/v1/points/buy/units/" + userId + "/" + totalNoOfUnits;
    //console.info('purchaseUrl = ', purchaseUrl);
    $.ajax({
      url: purchaseUrl,
      contentType: "application/json",
      dataType: "json",
      type: 'GET',
      error: function (err) {
        //console.info('err = ', err);
        if (err) {
          var response = JSON.parse(err.responseText);
          swal("Error!", response.status.message, "error");
        } else {
          swal("Error!", "Fatal Error Try again sometime", "error");
        }
      },
      success: function (data) {
        swal("Confirmed!", "Confirmed the Lot(s)!!", "success");
        /*setTimeout(function(){ 
          location.reload();
        }, 1000);*/
        //$('#buy-units').trigger('click');
        location.href = '/web/points/buy/units'
      }
    });
  }

  /* Support */

  $(document.body).on('click', '#support-btn', function () {
    var subject = $('#subject').val();

    if (subject) {
      swal({
        title: "Are you sure?",
        text: "You are about to submit support ticket",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DA4453",
        confirmButtonText: "Create support request?",
        cancelButtonText: "No, cancel",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {

          //swal("Changed!", "Confirmed the Block!!", "success");
          //sc.get([id]).status('booked');
          saveSupport();
        } else {
          swal("Cancelled", "Canceled the Support(s).", "error");
        }
      });
    } else {
      swal("Error!", "Provide required information", "error");
    }
  });

  function saveSupport() {
    //console.info('totalNoOfUnits = ', totalNoOfUnits);
    //console.info('userId = ', userId);
    var subject = $('#subject').val();
    var reason = $('#reason option:selected').val();
    var department = $('#department option:selected').val();
    var description = $.trim($('#description').val());

    var data = {
      subject : subject,
      reason : reason,
      department : department,
      description : description
    }

    console.info('data = ', data);

    var supportUrl = "/rest/api/v1/general/support";
    //console.info('purchaseUrl = ', purchaseUrl);
    $.ajax({
      url: supportUrl,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      type: 'POST',
      data: JSON.stringify({
        subject : subject,
        reason : reason,
        department : department,
        description : description
      }),
      error: function (err) {
        console.info('err = ', err);
        if (err) {
          var response = JSON.parse(err.responseText);
          swal("Error!", response, "error");
        } else {
          swal("Error!", "Fatal Error Try again sometime", "error");
        }
      },
      success: function (data) {
        swal("Confirmed!", "Support submitted successfully!", "success");
        /*setTimeout(function(){ 
          location.reload();
        }, 1000);*/
        //$('#buy-units').trigger('click');
        location.href = '/web/support/details'
      }
    });
  }


  $(document.body).on('click', '#update-support-btn', function () {
    var subject = $('#update-subject').val();
    console.info('subject = ', subject);
    if (subject) {
      swal({
        title: "Are you sure?",
        text: "You are about to update support ticket",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DA4453",
        confirmButtonText: "Update support request?",
        cancelButtonText: "No, cancel",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          var close = false;
          updateSupport(close);
        } else {
          swal("Cancelled", "Canceled the Support(s).", "error");
        }
      });
    } else {
      swal("Error!", "Provide required information", "error");
    }
  });

  $(document.body).on('click', '#close-support-btn', function () {
    var subject = $('#update-subject').val();
    console.info('subject = ', subject);
    if (subject) {
      swal({
        title: "Are you sure?",
        text: "You are about to close support ticket",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DA4453",
        confirmButtonText: "Close support request?",
        cancelButtonText: "No, cancel",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          var close = true;
          updateSupport(close);
        } else {
          swal("Cancelled", "Canceled the Support(s).", "error");
        }
      });
    } else {
      swal("Error!", "Provide required information", "error");
    }
  });

  function updateSupport(close) {
    //console.info('totalNoOfUnits = ', totalNoOfUnits);
    //console.info('userId = ', userId);
    console.info('update request');
    var subject = $('#update-subject').val();
    var reason = $('#update-reason').val();
    var department = $('#update-department').val();
    var description = $.trim($('#update-description').val());
    var replyBy = $('#replyBy').val();
    var supportTicketId = $('#supportTicketId').val();
    var supportTicketNo = $('#supportTicketNo').val();

    console.info('subject : ', subject);
    console.info('reason : ', reason);
    console.info('department : ', department);
    console.info('description : ', description);
    console.info('replyBy : ', replyBy);
    console.info('supportTicketId : ', supportTicketId);
    console.info('supportTicketNo : ', supportTicketNo);
    var data = {
      subject : subject,
      reason : reason,
      department : department,
      description : description,
      supportTicketId: supportTicketId,
      supportTicketNo: supportTicketNo
    }

    if (replyBy == "false") {
       data.reInitiated = true;
    } else {
      data.reInitiated = false;
    }

    data.close = close;

    console.info('data = ', data);

    var supportUrl = "/web/support/details/update";
    //console.info('purchaseUrl = ', purchaseUrl);
    $.ajax({
      url: supportUrl,
      contentType: "application/json; charset=utf-8",
      dataType: "html",
      type: 'POST',
      data: JSON.stringify(data),
      error: function (err) {
        console.info('err = ', err);
      },
      success: function (data) {
        swal("Updated!", "Support updated successfully!", "success");
        $('#slide-container').html(data);
      }
    });
  }

  $(document.body).on('click', '#transfer-points-btn', function () {
    var transferPoints = parseInt($('#transferPoints').val());
    var userId = $('#userId').val();
    var availablePoints = parseInt($('#availablePoints').val());
    var userName = $('#userName').val();

    if (userName === "") {
      swal("Error!", "User Name is required", "error");
    } else {
      if (transferPoints > 0 && transferPoints <= availablePoints) {
        swal({
          title: "Are you sure?",
          text: "You are about to transfer the Point(s)",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DA4453",
          confirmButtonText: "Transfer Points(s)!!!",
          cancelButtonText: "No, cancel transfer",
          closeOnConfirm: false,
          showLoaderOnConfirm: true,
          closeOnCancel: false
        }, function (isConfirm) {
          if (isConfirm) {
            transferInitiate(transferPoints, userId, userName.toLowerCase());
          } else {
            swal("Cancelled", "Canceled the Transfer.", "error");
          }
        });
      } else if (transferPoints > availablePoints) {
        swal("Error!", "You don't have sufficient points in your account", "error");
      } else {
        swal("Error!", "Minimum of 1 point required", "error");
      }
    }
  });

  function transferInitiate(transferPoints, userId, toUserId) {
    //console.info('transferPoints = ', transferPoints);
    //console.info('userId = ', userId);
    var transferUrl = "/rest/api/v1/points/transfer";
    //console.info('transferUrl = ', transferUrl);
    var data = {
      "fromUserId": userId,
      "toUserId": toUserId,
      "amount": transferPoints,
      "notes": "Transfer Initiated"
    }
    $.ajax({
      url: transferUrl,
      contentType: "application/json",
      data: JSON.stringify(data),
      processData: false,
      type: 'POST',
      dataType: "json",
      error: function (err) {
        //console.info('err = ', err);
        swal("Error!", "Fatal Error Try again sometime", "error");
      },
      success: function (data) {
        swal("Confirmed!", "Confirmed the Points(s)!!", "success");
        location.href = '/web/points/transfer/points'
      }
    });
  }

  $(document.body).on('click', '#internal-transfer-points-btn', function () {
    var transferPoints = parseInt($('#transferPoints').val());
    var selectedWallet = $('#internal-wallet-from option:selected');
    var availablePoints = parseInt(selectedWallet.data('available'));
    var walletId = selectedWallet.val();
    console.info('transferPoints = ', transferPoints);
    console.info('availablePoints = ', availablePoints);
    console.info('walletId = ', walletId);

    if (transferPoints >= 20 && transferPoints <= availablePoints) {
      swal({
        title: "Are you sure?",
        text: "You are about to transfer the Point(s)",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DA4453",
        confirmButtonText: "Transfer Points(s)!!!",
        cancelButtonText: "No, cancel transfer",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          internalTransferInitiate(transferPoints, walletId);
          console.info('confirmed');
        } else {
          swal("Cancelled", "Canceled the Transfer.", "error");
        }
      });
    } else if (transferPoints > availablePoints) {
      swal("Error!", "You don't have sufficient points in your account", "error");
    } else {
      swal("Error!", "Minimum of 20 points required", "error");
    }
  });

  function internalTransferInitiate(transferPoints, fromWalletId) {
    //console.info('transferPoints = ', transferPoints);
    //console.info('userId = ', userId);
    var transferUrl = "/rest/api/v1/points/internal/transfer";
    //console.info('transferUrl = ', transferUrl);
    var data = {
      "fromWalletId": fromWalletId,
      "amount": transferPoints,
      "notes": "Transfer Initiated"
    }
    $.ajax({
      url: transferUrl,
      contentType: "application/json",
      data: JSON.stringify(data),
      type: 'POST',
      dataType: "json",
      error: function (err) {
        //console.info('err = ', err);
        swal("Error!", "Fatal Error Try again sometime", "error");
      },
      success: function (data) {
        swal("Confirmed!", "Confirmed the Points(s)!!", "success");
        location.href = '/web/wallet/internal/transfer'
      }
    });
  }

  $(document.body).on('keyup', '#withdrawPoints', function () {
    var value = $(this).val();
    if (value > 0) {
      $('#btcValue').val(0);
      $('#receive-btc').html('');
      $('#withdraw-points-btn').prop('disabled', true);
    }
  });

  $('#withdraw-wallet-from').on('change', function () {
    //request-withdraw-holder
    var userStatus = $('#userStatus').val();
    var requestedWithdraw = $('#requestedWithdraw').val();
    var requestBtn = '<button type="button" id="withdraw-points-btn" style="margin-left: 12px;" class="btn btn-primary" disabled="true">Request Withdraw</button>'
    if (userStatus == "TRADER") {
      if (this.value == '5a6c8bf65a12076ff0cc0006') {
        if (requestedWithdraw == "false") {
          $('#request-withdraw-holder').html(requestBtn);
        } else {
          $('#request-withdraw-holder').html('<div class="infoCard infoCard--whiteFont bg-danger">Requested withdraw is already in process.</div>');
        }
      } else {
        if (requestedWithdraw == "true") {
          $('#request-withdraw-holder').html('<div class="infoCard infoCard--whiteFont bg-danger">Requested withdraw is already in process.</div>');
        } else {
          $('#request-withdraw-holder').html('<div class="infoCard infoCard--whiteFont bg-danger">You have not upgraded or referred any trader so far.</div>');
        }
      }
    }

  });

  $(document.body).on('click', '#calculate-bitcoin', function () {
    var withdrawPoints = parseInt($('#withdrawPoints').val());
    var loading = "/inner/assets/images/loading.gif";

    console.info('withdrawPoints = ', withdrawPoints);
    if ($('#withdrawPoints').val() == "") {
      swal("Error!", "Withdraw points required", "error");
    } else {
      swal({ title: "Fetching Bitcoin Information", text: "Please wait.", imageUrl: loading, imageSize: '200x200', showConfirmButton: false });
      $.ajax({
        url: "https://blockchain.info/tobtc?currency=USD&value=" + withdrawPoints,
        data: '',
        processData: false,
        type: 'GET',
        error: function (err) {
          //console.info('err = ', err);
        },
        success: function (result) {
          var btc = result * 0.9;
          $('#btcValue').val(btc.toFixed(8));
          $('#receive-btc').html(btc.toFixed(8));
          $('#withdraw-points-btn').prop('disabled', false);
          swal.close();
        }
      });
    }
  });

  $(document.body).on('click', '#withdraw-points-btn', function () {
    var withdrawPoints = parseInt($('#withdrawPoints').val());
    var bitcoinAddress = $('#bitcoinAddress').val();
    var selectedWallet = $('#withdraw-wallet-from option:selected');
    var availablePoints = parseInt(selectedWallet.data('available'));
    var walletId = selectedWallet.val();
    var minimumPoints = 30;

    if (walletId == '5a3c8bf65a12076ff0cc0003') {
      minimumPoints = 60;
    }

    console.info('withdrawPoints = ', withdrawPoints);
    console.info('availablePoints = ', availablePoints);
    console.info('walletId = ', walletId);
    console.info('bitcoinAddress = ', bitcoinAddress);
    var btcValue = $('#btcValue').val();
    console.info('btcValue = ', btcValue);
    if (bitcoinAddress == "") {
      swal("Error!", "Bitcoin address is required", "error");
    } else if (!btcValue || btcValue == 0) {
      swal("Error!", "Calculate bitcoin value", "error");
    } else if (withdrawPoints >= minimumPoints && withdrawPoints <= availablePoints) {

      var data = {};
      data.address = bitcoinAddress;
      data.addressType = "Bitcoin";
      data.value = btcValue;
      data.usd = withdrawPoints;
      data.points = withdrawPoints;
      data.walletId = walletId;
      swal({
        title: "Are you sure?",
        text: "You are about to request withdraw",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DA4453",
        confirmButtonText: "Withdraw Points(s)!!!",
        cancelButtonText: "No, cancel withdraw",
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        closeOnCancel: false
      }, function (isConfirm) {
        if (isConfirm) {
          requestWithdraw(data);
          console.info('confirmed');
        } else {
          swal("Cancelled", "Canceled the Withdraw Request.", "error");
        }
      });
    } else if (withdrawPoints > availablePoints) {
      swal("Error!", "You don't have sufficient points in your account", "error");
    } else {
      swal("Error!", "Minimum of " + minimumPoints + " points required", "error");
    }

  });

  function requestWithdraw(data) {
    var withdrawUrl = "/rest/api/v1/points/withdraw";
    $.ajax({
      url: withdrawUrl,
      contentType: "application/json",
      data: JSON.stringify(data),
      type: 'POST',
      dataType: "json",
      error: function (err) {
        //console.info('err = ', err);
        swal("Error!", "Fatal Error Try again sometime", "error");
      },
      success: function (data) {
        swal("Confirmed!", "Confirmed the Points(s)!!", "success");
        location.href = '/web/wallet/withdraw'
      }
    });
  }

  function earningDetails() {
    var url = "/rest/api/service/wallet/dashboard/" + loginId;
    $('#gen-commission').html('${balance.balance}');

    $.ajax({
      url: url,
      processData: false,
      type: 'GET',
      contentType: "application/json",
      dataType: "json",
      error: function (err) {
        //console.info('err = ', err);
      },
      success: function (data) {
        var tradeWallet = new Array();

        for (i = 0; i < data.length; i++) {
          if (data[i].accountTypeId == 1) {
            tradeWallet.push(data[i]);
          }
        }


        var totalTrade = 0;
        for (i = 0; i < tradeWallet.length; i++) {
          var trade = tradeWallet[i]
          var accountId = trade.accountId;
          ////console.info('accountId = ', accountId);
          ////console.info('accountName = ', trade.accountName);
          ////console.info('');
          //if (accountId != 15) {
          //var li = '<li class="list-group-item"><span class="tag tag-default tag-pill  float-xs-right">' + trade.totalPv + '</span>' + trade.accountName + '</li>';
          var accountInfoElement = '<div class="col-sm-12"><div class="card chartCard"><div class="paymentTx__icon badge badge-pill badge-primary"><strong>' + trade.totalPv + '</strong></div>';
          accountInfoElement += '<div class="paymentTx__footer">' + trade.accountName + '</div>';
          accountInfoElement += '</div></div>';
          $('#trade-wallet-info').append(accountInfoElement);

          if (accountId == 2) {
            $('#trade-transferbtn-font').html(trade.totalPv);
          }

          if (accountId == 4) {
            $('#trade-used').html(trade.totalPv);
            $('#trade-potential').html(trade.totalPv * 5);
          }

          if (accountId == 7 || accountId == 19 || accountId == 10 || accountId == 8 || accountId == 9
            || accountId == 5 || accountId == 15) {
            totalTrade += trade.totalPv;
          }



          if (accountId == 5) {
            $('#gen-royalty').html(trade.totalPv);
          }

        }

        $('#trade-total').html(totalTrade.toFixed(2));

      }
    });
  }

  function teamCount() {
    var url = "/rest/api/service/wallet/binary/" + loginId;

    $.ajax({
      url: url,
      processData: false,
      type: 'GET',
      contentType: "application/json",
      dataType: "json",
      error: function (err) {
        //console.info('err = ', err);
      },
      success: function (data) {
        var todayLeftGroupSales = data.todayLeftGroupSales;
        var todayRightGroupSales = data.todayRightGroupSales;
        var leftGroupSales = data.leftGroupSales;
        var rightGroupSales = data.rightGroupSales;
        var directcount = data.directcount;
        var level = data.level;


        $('#today-leftcount').html("Left: " + todayLeftGroupSales + " - Right: " + todayRightGroupSales);
        //$('#today-rightcount').html("Right: "+todayRightGroupSales);
        $('#total-leftcount').html("Left: " + leftGroupSales + " - Right: " + rightGroupSales);
        //$('#total-rightcount').html("Right: "+rightGroupSales);
        $('#directcount').html(directcount);
        //$('#levelcount').html("Level-"+level);

        var levelPosition = "";

        for (var i = 1; i <= 10; i++) {
          if (i <= level) {
            levelPosition += '<div class="utils__step utils__step--success">' + i + '</div>';
          } else {
            levelPosition += '<div class="utils__step utils__step">' + i + '</div>';
          }
        }

        $('#level-position').html(levelPosition);


      }
    });
  }


  function cashReward() {

    var url = context + "/rest/api/service/wallet/cashreward/" + loginId;

    $.ajax({
      url: url,
      processData: false,
      type: 'GET',
      contentType: "application/json",
      dataType: "json",
      error: function (err) {
        //console.info('err = ', err);
      },
      success: function (data) {
        //var loginid= data.loginid;

        var cashReward = new Array();
        for (i = 0; i < data.length; i++) {
          cashReward.push(data[i]);
        }

        var activatedDate;
        var currentDate = new Date();

        for (i = 0; i < cashReward.length; i++) {
          var reward = cashReward[i]

          var startdate = reward.startdate;
          var enddate = reward.enddate;
          var required_days = reward.required_days;
          var required_reward_points = reward.required_reward_points;
          var cashreward = reward.cashreward;
          var leftcount = reward.leftcount;
          var rightcount = reward.rightcount;
          activatedDate = reward.startdate;
          console.log('$$$$$$$$$$');

          /* 	var li = '<li class="list-group-item">' + startdate +   '	|	' +  enddate +   '<span class="tag tag-default tag-pill tag-inactive  float-xs-right">' + leftcount + '</span>  </li>';
        $('#cash-reward-info').append(li); */

          /*var li = "<tr>";
          li +="<td>" +  required_days + "</td>";
          li +="<td>" + enddate + "</td>";
          li +="<td>" + cashreward + "</td>";
          li +="<td>" + leftcount + " - " + rightcount + "</td>";
          li +="<td>" + required_reward_points + "</td>";
          li +="<td class='text-success'>Success</td>";
          li +="</tr>";*/

          /*var reward = '<div class="schedule-listing">';
          reward += '<div class="schedule-slot-time"> <span>' + enddate + '</span></div>';
          reward += '<div class="schedule-slot-info">';
          reward += '<div class="schedule-slot-info-content">';
          reward += '<p class="schedule-speaker"> James Killer</p>
                          <h3 class="schedule-slot-title"> Marketing Matters!</h3>
                          <p> How you transform your business as technology, consumer, habits industry dynamics change? Find out from those leading the charge. How you transform</p>
                       </div>
                    </div>
                 </div>*/

          /*var reward = '<div class="schedule-listing">';
          reward += '<div class="schedule-slot-time"> <span>' + enddate + '  Cut off date</span></div>';
           reward += '<div class="schedule-slot-info">';
           reward += '<div class="schedule-slot-info-content">';
           reward += '<h4 class="schedule-slot-title text-primary">Current Reward Points : 9</h4>';
           reward += '<p> <strong>Reach ' + required_reward_points * 100 + ' Left - ' + required_reward_points * 100 + ' Right to earn ' + required_reward_points + ' Reward Points with in ' + required_days + ' days you earn ' + cashreward + ' Euros</strong></p>';
           reward += '<p class="schedule-speaker text-success"> Current Count : ' + leftcount + ' - ' + rightcount + ' </p>';
           reward += '</div></div></div>';*/

          /*var currentStartDate = new Date(startdate);
          var currentDate = currentStartDate.setDate(currentStartDate.getDate() + required_days);
          
          
          var rewardPoints = Math.floor(parseInt(leftcount) / 100);
          //console.info('rewardPoints = ', rewardPoints);
          
          var currentEndDate = new Date(enddate);
          var date = currentEndDate.setDate(currentEndDate.getDate());
          
          ////console.info('today.getDate() = ', currentStartDate.getDate());
          //console.info('currentDate = ', currentDate);
          //console.info('date = ', date);*/

          var currentEndDate = new Date(enddate);

          var points = 0;
          if (leftcount < rightcount) {
            points = leftcount;
          } else {
            points = rightcount;
          }
          var rewardPoints = Math.floor(parseInt(points) / 100);
          var status = 'OPEN';
          var background = '#f5c220';

          if (!(currentDate <= currentEndDate)) {
            if (rewardPoints < required_reward_points) {
              status = 'MISSED';
              background = '#f55620';
            } else {
              status = 'ACHIEVED';
              background = '#46be8a';
            }
          }

          if (rewardPoints > required_reward_points) {
            status = 'ACHIEVED';
            background = '#46be8a';
          }

          var reward = '<div class="mobile-wrapper"><span class="paymentCard__sum" style=background-color:' + background + '>' + status + '</span><section class="today-box" id="today-box">';
          reward += '<span class="header-breadcrumb">CUT OFF DATE</span>';
          reward += '<h3 class="date-title">' + enddate + '</h3>';
          reward += '<div class="plus-icon"></div></section>';
          reward += '<section class="upcoming-events"><div class="container">';
          reward += '<div class="events-wrapper"><div class="event"><i class="ion ion-ios-play"></i>';
          reward += '<p class="event__description text-success">REWARD POINTS : ' + rewardPoints + '</p><h4 class="event__point">Reach ' + required_reward_points * 100 + ' Left - ' + required_reward_points * 100 + ' Right to earn ' + required_reward_points + ' Reward Points with in ' + required_days + ' days you earn ' + cashreward + ' Euros</h4>';
          reward += '</div>';
          reward += '<div class="event active"><i class="ion ion-ios-radio-button-on icon-in-active-mode"></i>';
          reward += '<h4 class="event__point"> ' + required_days + ' DAYS</h4>';
          reward += '<p class="event__description">Current Count : ' + leftcount + ' - ' + rightcount + '</p></div></div></div></section></div>';

          $('#cash-reward-chart').append(reward);
          //$('#cash-reward-info').append(li);
          //$('#cashRewardTable').find('tbody').append(li);
        }

        $('#dashboard-reward-date').html(activatedDate);




        /* 	
          $('#today-leftcount').html("Left:"+todayLeftGroupSales);
      $('#today-rightcount').html("Right:"+todayRightGroupSales);
      $('#total-leftcount').html("Left:"+leftGroupSales);
      $('#total-rightcount').html("Right:"+rightGroupSales);
      $('#directcount').html(directcount);
      $('#levelcount').html("Level-"+level); */



      }
    });
  }


  //earningDetails();
  //teamCount();
  //cashReward();

});