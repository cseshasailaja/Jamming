import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from './../../util/Spotify';

/*{name: 'Tiny Dancer', artist: 'Elton John', album: 'Madman Across The Water', id: '0'},
{name: 'Tiny Dancer', artist: 'Tim McGraw', album: 'Love Story', id: '1'},
{name: 'Tiny Dancer', artist: 'Rockabye Baby!', album: 'Lullaby Renditions of Elton John', id: '2'},
{name: 'Tiny Dancer', artist: 'The White Raven', album: 'Tiny Dancer', id: '3'},
{name: 'Tiny Dancer - Live Album Version', artist: 'Ben Folds', album: 'Ben Folds Live', id: '4'}
*/
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchResults: [
],
      playlistName: 'New playlist',
      playlistTracks: []
    };
      this.addTrack = this.addTrack.bind(this);
      this.removeTrack = this.removeTrack.bind(this);
      this.updatePlaylistName = this.updatePlaylistName.bind(this);
      this.savePlaylist = this.savePlaylist.bind(this);
      this.search = this.search.bind(this);
  }

  addTrack(track) {
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    let newPlaylistTracks = this.state.playlistTracks.concat(track);
    this.setState({playlistTracks: newPlaylistTracks});
  }

  removeTrack(track) {
    let currentPlaylistTracks = this.state.playlistTracks.filter(deleteTrack => deleteTrack.id !== track.id);
      this.setState({playlistTracks: currentPlaylistTracks});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  savePlaylist() {
    let trackURIs = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.setState({playlistName: 'New playlist'});
    this.setState({playlistTracks: [] });
  }

  search(searchTerm) {
    console.log(searchTerm);
    Spotify.search(searchTerm)
    .then(tracks => this.setState({searchResults: tracks}));
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>

        <div className="App">
          <SearchBar onSearch={this.state.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />

            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName}  onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
