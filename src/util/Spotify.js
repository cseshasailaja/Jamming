const url = 'https://accounts.spotify.com/authorize';
const client_id = '961e71a120c64b1baac923b3635af150';
const response_type = 'token';
const scope = 'playlist-modify-public';
const redirect_uri = 'http://localhost:3000/';
const authorization_url = `${url}?client_id=${client_id}&response_type=${response_type}&scope=${scope}&redirect_uri=${redirect_uri}`;
let usersAccessToken = '';
let expirationTimeInSeconds = 0;

const Spotify = {
  getAccessToken: function() {
    let accessToken = window.location.href.match(/access_token=([^&]*)/);
    let expirationTime = window.location.href.match(/expires_in=([^&]*)/);
    if (usersAccessToken) {
      console.log(`Access token already exist: ${usersAccessToken}!`);
      return usersAccessToken;
    } else if (accessToken && expirationTime) {
      console.log(`Acquired access token: ${accessToken}`);
      usersAccessToken = accessToken[1];
      expirationTimeInSeconds = expirationTime[1];
      window.setTimeout(() => usersAccessToken = '', expirationTimeInSeconds * 1000);
      window.history.pushState('Access Token', null, '/');
      return usersAccessToken;
    } else {
      console.log('No access token found. Redirecting...');
      window.location = authorization_url;
      return '';
    }
  },
  search: async function(searchTerm) {
    let accessToken = await this.getAccessToken();
    if (!accessToken) {
      console.log(`No access token present.`);
      return [];
    }
    const term = encodeURI(searchTerm);
    return fetch(`https://api.spotify.com/v1/search?q=${term}&type=track`, {
      headers: { Authorization: `Bearer ${accessToken}`}
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      console.log(`Search query failed.`);
    }, networkError => console.log(networkError.message)
    )
    .then(jsonResponse => {
      if (jsonResponse && jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        });
      }
      else if (jsonResponse && jsonResponse.error) {
        console.log(`Search query error: ${jsonResponse.error.message}`);
      }
      else {
        return [];
      }
    });
  },
  savePlaylist: async function(playlistName, playlistTracks) {
    if (!playlistName || !playlistTracks || playlistTracks.length === 0) {
      return ;
    }
    let accessToken = await this.getAccessToken();
    if (!accessToken) {
      console.log(`No access token present.`);
      return;
    }
    const headers = {Authorization: `Bearer ${accessToken}`,
                     Accept: 'application/json',
                     'Content-Type': 'application/json'};
    const userID = await fetch('https://api.spotify.com/v1/me', {
      headers: headers
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      console.log('Error querying user ID...');
    }, networkError => console.log(networkError.message)
    )
    .then(jsonResponse => {
      if (jsonResponse && jsonResponse.id) {
        return jsonResponse.id;
      } else if (jsonResponse && jsonResponse.error) {
        console.log(`Error querying user ID: ${jsonResponse.error.message}`);
      }
    });
    if (!userID) {
      return;
    }
    const playlistID = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({name: playlistName})
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      console.log(`Error creating playlist ${playlistName}.`);
    }, networkError => console.log(networkError.message)
    )
    .then(jsonResponse => {
      if (jsonResponse && jsonResponse.id) {
        console.log(`Error creating ${playlistName}: ${jsonResponse.error.message}`);
      }
    });
    if (!playlistID) {
      return;
    }    
  }

};


export default Spotify;
