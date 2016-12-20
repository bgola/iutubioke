var player_window;
var localStorage = window.localStorage;
if (localStorage.playlist == undefined) {
    localStorage.playlist = JSON.stringify([]);
}
if (localStorage.playlist_position == undefined) {
    localStorage.playlist_position = 0;
}
var playlist = JSON.parse(localStorage.playlist);
function handleAPILoaded() {
  gapi.client.setApiKey('AIzaSyAVClkf0ZIFdbc20Bxv8eD4n9wQJTXXbmg');
  $('#search-button').attr('disabled', false);
  $("#query").keyup(function(event){
    if(event.keyCode == 13){
        $("#search-button").click();
    }
  });
  $('#search-container').on('click', '.video-snippet', function (element) {
      var video_object = {
                  'singerName': singer_name,
                  'videoTitle': $('#'+element.currentTarget.id + ' .video-title').text(),
                  'videoId': element.currentTarget.id
              }
      if(player_window == undefined || player_window.closed) {
          openPlayerWindow(function () { addVideo(video_object, true)});
     } else {
         addVideo(video_object);
      }
  });
}
function openPlayerWindow(f) {
  player_window = window.open(
          "player.html", "_blank", "toolbar=no, location=no, "+
          "directories=no, status=no, menubar=no, scrollbars=no," +
          "resizable=yes, copyhistory=yes, width=700, height=450");
  player_window.onload = function () {
      setTimeout(f, 2000);
  }
}
function removeVideo(id) {
    var new_playlist = playlist.filter(function (item) { item['videoId'] != id});
    playlist = new_playlist;
    localStorage.playlist = JSON.stringify(playlist);

    updateList();
}

function loadNextVideo() {
    if (playlist[localStorage.playlist_position] != null && player_window != undefined && !player_window.closed) {
        player_window.player.loadVideoById({'videoId': playlist[localStorage.playlist_position]['videoId']});
        localStorage.playlist_position++;
    }
}
function reloadVideo() {
    if (playlist[localStorage.playlist_position] != null) {
        if (player_window == undefined || player_window.closed) {
            openPlayerWindow(function () { localStorage.playlist_position--; loadNextVideo(); });
        } else {
            localStorage.playlist_position--;
            loadNextVideo();
        }
    }
}
function addVideo(video_object, start) {
    playlist.push(video_object);
    localStorage.playlist = JSON.stringify(playlist);
    if (start == true || (localStorage.playlist_position == playlist.length-1 && player_window.player.getPlayerState() == 0)) {
        loadNextVideo();
    }
    updateList();
}

function skip() {
    if(player_window == undefined || player_window.closed) {
        player_window = window.open(
          "player.html", "_blank", "toolbar=no, location=no, "+
          "directories=no, status=no, menubar=no, scrollbars=no," +
          "resizable=yes, copyhistory=yes, width=700, height=450");
        player_window.onload = function () {
          setTimeout(function () { loadNextVideo(); updateList() }, 2000 );
        }
    } else {
        loadNextVideo();
        updateList();
    }
}
function clearPlaylist () {
    if (window.confirm("ARE YOU SURE?? IS THE PARTY OVER???!!")) {
        localStorage.playlist = JSON.stringify([]);
        localStorage.playlist_position = 0;
        playlist = JSON.parse(localStorage.playlist);
        updateList();
    }
}
function updateList() {
    if (playlist.length > localStorage.playlist_position) {
        $('#skip-button').attr('disabled', false);
    } else {
        $('#skip-button').attr('disabled', true);
    }
    var playlist_html = '</ul>';
    var idx = 0;
    if (playlist.length == 0) {
        playlist_html = "<li>Playlist is empty!</li>" + playlist_html
    } else {
        playlist.forEach(function (item) {
            playlist_html = '</li>' + playlist_html;
            item_html = item['singerName'] + ' - ' + item['videoTitle'];
            if (idx+1 == localStorage.playlist_position) {
                if (player_window && player_window.player && player_window.player.getPlayerState() == 1) {
                    playlist_html = '<strong style="color: greenyellow;">&gt;&gt;&gt; ' + item_html + '</strong>' + playlist_html;
                } else {
                    playlist_html = '<strong>&gt;&gt;&gt; ' + item_html + '</strong>' + playlist_html;
                }
            } else {
                playlist_html = item_html + playlist_html;
            }
            playlist_html = '<li>' + playlist_html;
            idx++;
        });
    }
    playlist_html = '<ul>' + playlist_html;
    $('#playlist').html(playlist_html);
}

var singer_name;

function search() {
  var q = $('#query').val();
  q += ' karaoke';
  var request = gapi.client.youtube.search.list({
    q: q,
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
  });
  singer_name = $('#singer-name').val();
  request.execute(function(response) {
    var str = JSON.stringify(response.result);
    var result_html = '<ul id="video-list">';
    response.result.items.forEach(function (item) {
        result_html += '<li id="' + item.id.videoId + '" class="video-snippet">';
        result_html += '<img src="' + item.snippet.thumbnails.default.url + '"/>';
        result_html += '<span class="video-title">'+ item.snippet.title + '</span></li>';
    });
    result_html += '</ul>';
    $('#search-container').html(result_html);
  });
}
