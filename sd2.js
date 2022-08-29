function parseSdealDate(dateStr, timeStr, TODAY = new Date(), hourZoneShift = -1) {
  var year = TODAY.getFullYear();
  var month = TODAY.getMonth();
  var day = TODAY.getDate();
  if (dateStr == 'Today') {} else if (dateStr == 'Yesterday') {
    day = TODAY.getDate() - 1;
  } else {
    var reg1 = dateStr.match(/^(\d+)-(\d+)-(\d+)$/);
    if (reg1 != null) {
      month = Number(reg1[1]) - 1;
      day = Number(reg1[2]);
      year = Number(reg1[3]);
    } else {
      console.error('parseSdealDate(): unknown dateStr param ' + dateStr);
    }
  }

  var hour = 0,
    min = 0,
    ampm = '';
  var reg = timeStr.match(/(\d+):(\d+) (AM|PM)/);
  if (reg != null) {
    hour = Number(reg[1]);
    min = Number(reg[2]);
    ampm = reg[3];
    if (hour == 12 && ampm == 'AM') {
      hour = 0;
    }
    if (hour != 12 && ampm == 'PM') {
      hour += 12;
    }
  } else {
    console.error('parseSdealDate(): unknown timeStr param ' + timeStr);
  }

  var retDate = new Date(year, month, day, hour, min, 0);
  retDate.setHours(retDate.getHours() + hourZoneShift);
  return retDate;
};

function filterClick() {
  var scoreT = 1,
    viewsT = 10,
    repliesT = 0,
    votesT = 0;

  scoreVal = $('[name=scoreI]').val();
  if (scoreVal != '') scoreT = parseInt(scoreVal, 10);

  viewsVal = $('[name=viewsI]').val();
  if (viewsVal != '') viewsT = parseInt(viewsVal, 10);

  repliesVal = $('[name=repliesI]').val();
  if (repliesVal != '') repliesT = parseInt(repliesVal, 10);

  votesVal = $('[name=votesI]').val();
  if (votesVal != '') votesT = parseInt(votesVal, 10);

  console.log('+ filterApply(' + scoreT + ', ' + viewsT + ', ' + repliesT + ', ' + votesT + ')');
  filterApply(scoreT, viewsT, repliesT, votesT);
};


function filterApply(scoreT = 2, viewsT = 10, repliesT = 0, votesT = 0) {
  var trArr = $("#threadbits_forum_9").children();
  var items = [];
  var k = 0;
  var mobile_url_param = "no_mobile=false";
  var TODAY = new Date();
  var nHideItems = 0;

  for (var i = 0; i < trArr.length; i++) {
    var tr = $(trArr[i]);
    var data = tr.find('div.mobile_threadbit');
    var toHide = false;

    if (data.text().match(/Sticky:.*RULES, FAQ, TIPS/)) {
      toHide = true;
    }

    var titleObj = data.find('.mobile_threadbit_title a');
    //var link = 'https://slickdeals.net' + titleObj.attr('href');
    var link = titleObj.attr('href');

    if (link & link.match(/\?\w+=\w+/)) link += '&' + mobile_url_param;
    else link += '?' + mobile_url_param;

    var title = titleObj.text().trim();
    var reg0 = link.match(/\/f\/(\d+)-/);
    var sdid = null;
    if (reg0 != null) {
      sdid = reg0[1];
    } else {
      console.error('sdeal.parseSd(): unknown mobile_threadbit_title: ' + title);
    }

    var detailObj = data.find('.mobile_threadbit_details');
    var details = detailObj.text().trim().replace(/(?:\r\n|\r|\n)/g, ' ');

    var reg = details.match(/^(\S+)\s+([^-]+) -\s*(.*)\s*Replies: (\S*) -.*Views: (\S*) -/);
    var poster = '', time = null, replies = 0, views = 0;
    if (reg != null) {
      time = parseSdealDate(reg[1], reg[2], TODAY);
      poster = reg[3];
      replies = reg[4].replace(/,/g, '');
      views = reg[5].replace(/,/g, '');
      if (replies == '-') replies = 0;
      if (views == '-') views = 0;
    } else {
      console.error('sdeal.parseSd(): unknown mobile_threadbit_details text(): ' + details);
    }

    var hasFP = false;
    var scoreObj = detailObj.find('span img.inlineimg');
    var scoreStr = scoreObj.attr('alt');
    if (scoreObj.length > 1) {
      hasFP = true;
      scoreStr = $(scoreObj[1]).attr('alt');
    }
    var votes = 0;
    var score = 0;
    if (scoreStr != undefined) {
      var reg1 = scoreStr.match(/Votes: (\S*) Score: (\S*)/);
      if (reg1) {
        votes = reg1[1].replace(/,/g, '');
        score = reg1[2].replace(/,/g, '');
      } else {
        console.error('sdeal.parseSd(): unknown scoreStr: ' + scoreStr + ', scoreObj=' + $.html(scoreObj));
      }
    }

    if (titleObj.parent().text().trim().match(/^Moved:/)) {
      isMoved = true;
      console.log('Moved: detected, to skip');
      toHide = true;
    }

    var strout = '++ item[' + k + '][' + sdid + ']: scoreVoteReplyViews=' + score + ',' + votes + ',' + replies + ',' + views + ' ' + title;

    if (toHide || score < scoreT ||
      views < viewsT ||
      replies < repliesT ||
      votes < votesT) {
      tr.attr("style", "display:none");
      console.log('\n' + 'HIDE: ' + strout);
      nHideItems++;
    } else {
      tr.removeAttr("style");
    }

    k++;
  }
  nHideItems++;
  $('#filterLabel').html('<b>' + nHideItems + '</b> hiddden');
};
