/* Copyright (c) 2012 Victorian Department of Transport.  All Rights Reserved. http://www.transport.vic.gov.au */

$( function() {

  $('#dashboard-spinner').attr('src', DOT_Dashboard_Config["urlLoading"]);

  setApiKey(DOT_Dashboard_Config['jsapiKey']);

  var roleID = DOT_Dashboard_Config['maintainerRoleID'];
  var userID = DOT_Dashboard_Config['userID'];
  var rootID = DOT_Dashboard_Config['assetListingRootID'];

  // get role assignments
  $('#dashboard-status').append('Looking up Maintainer role assignments...');
  getRoles('', roleID, userID, 1, 0, 0, 0, 0, [], 0, function(data) {
    if (data == 'No roles data is found') {
      $('#dashboard-status').append('Done.<br /><br />Not able to find any assets assigned to you.');
      $('#dashboard-spinner').hide();
      return;
    }
    var assets = data[roleID][userID];

    // get assets
    $('#dashboard-status').append('Done.<br />Retrieving assets...');
    if (assets.length) {
      $.post(DOT_Dashboard_Config['assetListingURL'] + '?SQ_DESIGN_NAME=ajax&rootid=' + rootID, {assets: assets.toString()}, function(data) {
        $('#dashboard-tabs-all table').append(data);

        // process data
        $('#dashboard-status').append('Done.<br />Processing data....');

        // check asset expiry
        $('.dashboard-type-standard_page').not('.dashboard-status-under_construction').find('.dashboard-expiry-cell').each( function(i) {
          if (getDateObject($(this).html()) < new Date()) {
            $(this).siblings('.dashboard-name-cell').append(' <span class="small">Expired</span>');
          }
        }); // each

        // create tabs
        $('#dashboard-status').append('Done.<br />Creating tabs....');

        // pages tab
        $('#dashboard-tabs-all .dashboard-type-standard_page').clone().appendTo('#dashboard-tabs-pages table');
        $('#dashboard-tabs-all .dashboard-type-news_item').clone().appendTo('#dashboard-tabs-pages table');

        // documents tab
        $('#dashboard-tabs-all .dashboard-type-pdf_file').clone().appendTo('#dashboard-tabs-docs table');
        $('#dashboard-tabs-all .dashboard-type-ms_word_document').clone().appendTo('#dashboard-tabs-docs table');
        $('#dashboard-tabs-all .dashboard-type-ms_excel_document').clone().appendTo('#dashboard-tabs-docs table');
        $('#dashboard-tabs-all .dashboard-type-ms_powerpoint_document').clone().appendTo('#dashboard-tabs-docs table');
        $('#dashboard-tabs-all .dashboard-type-text_file').clone().appendTo('#dashboard-tabs-docs table');
        $('#dashboard-tabs-all .dashboard-type-rtf_file').clone().appendTo('#dashboard-tabs-docs table');

        // images tab
        $('#dashboard-tabs-all .dashboard-type-image').clone().appendTo('#dashboard-tabs-image table');

        // media tab
        $('#dashboard-tabs-all .dashboard-type-video_file').clone().appendTo('#dashboard-tabs-media table');
        $('#dashboard-tabs-all .dashboard-type-mp3_file').clone().appendTo('#dashboard-tabs-media table');

        // other tab
        $('#dashboard-tabs-all .dashboard-type-file').clone().appendTo('#dashboard-tabs-other table');

        // live tab
        $('#dashboard-tabs-all .dashboard-status-live').clone().appendTo('#dashboard-tabs-live table');

        // up for review tab
        $('#dashboard-tabs-all .dashboard-status-up_for_review').clone().appendTo('#dashboard-tabs-up-for-review table');

        // under construction tab
        $('#dashboard-tabs-all .dashboard-status-under_construction').clone().appendTo('#dashboard-tabs-under-construction table');

        // safe edit tab
        $('#dashboard-tabs-all .dashboard-status-safe_editing').clone().appendTo('#dashboard-tabs-safe-edit table');

        // pending approval tab
        $('#dashboard-tabs-all .dashboard-status-pending_approval').clone().appendTo('#dashboard-tabs-pending-approval table');
        $('#dashboard-tabs-all .dashboard-status-safe_editing_pending_approval').clone().appendTo('#dashboard-tabs-pending-approval table');

        // pending go live tab
        $('#dashboard-tabs-all .dashboard-status-approved_to_go_live').clone().appendTo('#dashboard-tabs-pending-go-live table');
        $('#dashboard-tabs-all .dashboard-status-safe_edit_approved_to_go_live').clone().appendTo('#dashboard-tabs-pending-go-live table');

        // expiry tabs
        $('#dashboard-tabs-all .dashboard-type-standard_page').not('.dashboard-status-under_construction').each( function(i) {
          var dtExpiry = getDateObject($(this).find('.dashboard-expiry-cell').html());
          if (dtExpiry < new Date()) {
            $(this).clone().appendTo('#dashboard-tabs-expired table');
          }
          else if (dtExpiry < new Date().setMonth(new Date().getMonth() + 1)) {
            $(this).clone().appendTo('#dashboard-tabs-expired-month table');
          }
        }); // each

        // sorting
        $('#dashboard-status').append('Done.<br />Sorting....');

        // display message for empty tables
        $('#dashboard-tabs div').each( function(i) {
          if (!$(this).find('table tbody tr').length) {
            $(this).html('<p class="dashboard-noresult">No assets listed.</p>');
          }
        }); // each

        $('#dashboard-tabs table').each( function(i) {
          if ($(this).find('tbody tr').length > 0) {
            $(this).tablesorter({
              sortList: [[1,0]],
              dateFormat: "uk",
              headers: {
                0: {sorter: false},
                6: {sorter: false}
              }
            });
          }
        }); //each

        // finish off visual adjustments
        $('#dashboard-status').append('Done.<br />Showing results....');
        $('#dashboard-tabs').tabs({ selected: 0 }); // set initially selected tab

        // set tab counts
        $('#dashboard-tabs div').each( function() {
          $('#' + $(this).attr('id') + '-link span').html($('#' + $(this).attr('id') + ' table tbody tr').length);
          if (!$('#' + $(this).attr('id') + ' table tbody tr').length) {
            $('#' + $(this).attr('id') + '-link').parent().addClass('empty');
          }
        }); // each

        $('#dashboard-status').append('Complete.');

        $('#dashboard-status').hide('slow');
        $('#dashboard-spinner').hide('slow');
        $('#dashboard-util').show('slow');
        $('#dashboard-tabs').show('slow');

      }); // post
    }
  }); // getRoles

  // event handler for add new asset
  $('.dashboard-new-asset').click( function() {
    window.open(DOT_Dashboard_Config["assetListingURL"] + '/_edit?createasset=true');
  }); // click

  // hide empty tabs
  if (DOT_Dashboard_Config['hideEmptyTabs']) {
    $('body').addClass('dot-dashboard-hide-empty');
  }

  $('#dashboard-group-by').buttonset();

  // event handler for group by type
  $('#group-by-type').change(function() {
    $('.dashboard-group-by-status').hide();
    $('.dashboard-group-by-expiry').hide();
    $('.dashboard-group-by-type').fadeIn('slow');
    $('#dashboard-tabs').tabs('option', 'selected', 0);
  });

  // event handler for group by status
  $('#group-by-status').change(function() {
    $('.dashboard-group-by-type').hide();
    $('.dashboard-group-by-expiry').hide();
    $('.dashboard-group-by-status').fadeIn('slow');
    $('#dashboard-tabs').tabs('option', 'selected', 0);
  });

  // event handler for group by expiry
  $('#group-by-expiry').change(function() {
    $('.dashboard-group-by-type').hide();
    $('.dashboard-group-by-status').hide();
    $('.dashboard-group-by-expiry').fadeIn('slow');
    $('#dashboard-tabs').tabs('option', 'selected', 0);
  });
});

function getDateObject(str) {
  var tkn = str.split("/");
  return new Date(tkn[2], (tkn[1] - 1), tkn[0]);
}