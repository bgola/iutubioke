// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.

// Upon loading, the Google APIs JS client automatically invokes this callback.
googleApiClientReady = function() {
  gapi.client.init({
    apiKey: 'key',
  });

  gapi.client.load('youtube', 'v3', function() {
    handleAPILoaded();
  });
}
