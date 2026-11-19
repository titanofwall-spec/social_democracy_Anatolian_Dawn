'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'out', 'html', 'rubicon-music.js'), 'utf8');
const browser = {};
vm.runInNewContext(source, {window: browser, decodeURI});
const music = browser.AnatolianRubiconMusic;
const INTRO = 'music/50yilmarsi.mp3';
const RUBICON = 'music/memorandum-rubicon.mp3';

function makeUI(track, active = true) {
  const audio = {src: track, ended: false, paused: false, loop: false, onended: null};
  const ui = {
    currentAudio: audio,
    currentAudioURL: track,
    audioPlaylist: [INTRO, 'music/Yeni_Bir_Turkiye.mp3'],
    audioQueue: [],
    disable_audio: false,
    calls: [],
    dendryEngine: {state: {
      sceneId: 'rubicon_opening',
      visits: {rubicon_opening: 1},
      qualities: {rubicon_mode: active ? 1 : 0, cyprus_mode: 0}
    }},
    audio(command) {
      this.calls.push(command);
      const words = command.split(' ');
      const titles = words.filter(w => !['clear', 'loop', 'shuffle', 'queue', 'nofade'].includes(w));
      if (words.includes('clear')) { this.audioPlaylist = []; this.audioQueue = []; }
      this.audioPlaylist.push(...titles);
      if (!words.includes('shuffle')) {
        this.currentAudio.src = titles[0];
        this.currentAudioURL = titles[0];
        this.currentAudio.ended = false;
        this.currentAudio.loop = words.includes('loop');
      }
    }
  };
  return ui;
}

// The opening march must not be interrupted when Rubicon begins.
{
  const ui = makeUI(INTRO);
  let normalEnded = 0;
  ui.currentAudio.onended = () => { normalEnded += 1; };
  music.begin(ui);
  assert.equal(ui.currentAudio.src, INTRO);
  assert.equal(ui.calls.length, 0);
  music.begin(ui);
  assert.equal(ui.calls.length, 0, 'duplicate renders must not reset the intro');
  ui.currentAudio.ended = true;
  ui.currentAudio.onended();
  assert.equal(ui.currentAudio.src, RUBICON);
  assert.equal(ui.currentAudio.loop, true);
  assert.equal(normalEnded, 0, 'regular playlist must not play after the intro');
}

// If the march already finished before the event, switch immediately.
{
  const ui = makeUI('music/Yeni_Bir_Turkiye.mp3');
  music.begin(ui);
  assert.equal(ui.currentAudio.src, RUBICON);
  assert.equal(ui.currentAudio.loop, true);
}

// Talu's government must terminate the soundtrack immediately, not wait
// for the long album to finish, and must restore the normal shuffle.
{
  const ui = makeUI(RUBICON);
  ui.currentAudio.loop = true;
  ui.dendryEngine.state.qualities.rubicon_mode = 0;
  music.finish(ui);
  assert.equal(ui.calls.length, 2);
  assert.equal(ui.currentAudio.src, 'music/Yeni_Bir_Turkiye.mp3');
  assert.equal(ui.currentAudio.loop, false);
  assert(ui.audioPlaylist.length > 15);
  assert(!ui.audioPlaylist.includes(INTRO));
  assert(!ui.audioPlaylist.includes(RUBICON));
}

// Ending Rubicon before the march finishes cancels the pending interruption.
{
  const ui = makeUI(INTRO);
  let continued = 0;
  const normal = () => { continued += 1; };
  ui.currentAudio.onended = normal;
  music.begin(ui);
  ui.dendryEngine.state.qualities.rubicon_mode = 0;
  music.finish(ui);
  assert.equal(ui.currentAudio.onended, normal);
  ui.currentAudio.ended = true;
  ui.currentAudio.onended();
  assert.equal(continued, 1);
  assert.equal(ui.calls.length, 0);
}

// Saved games and muted playback also pick the correct phase on resumption.
{
  const ui = makeUI(INTRO);
  ui.disable_audio = true;
  music.begin(ui);
  assert.equal(ui.currentAudio.onended, null);
  ui.disable_audio = false;
  music.sync(ui);
  assert.equal(typeof ui.currentAudio.onended, 'function');
  ui.currentAudio.ended = true;
  ui.currentAudio.onended();
  assert.equal(ui.currentAudio.src, RUBICON);
  ui.currentAudio.loop = false;
  music.sync(ui);
  assert.equal(ui.currentAudio.loop, true);
}

console.log('Memorandum soundtrack lifecycle tests passed');
