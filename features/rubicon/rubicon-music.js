/* Anatolian Dawn: Memorandum Rubicon music window.
 * The opening march must finish before Rubicon begins; Rubicon ends
 * immediately when its gameplay period ends, even during a long track.
 */
(function (root) {
  'use strict';

  var OPENING = 'music/50yilmarsi.mp3';
  var MEMORANDUM = 'music/memorandum-rubicon.mp3';
  // The opening march belongs to the opening, not the post-Rubicon rotation.
  var REGULAR = [
    "music/Yeni_Bir_Turkiye.mp3",
    "music/Oy_Gulum_Oy.mp3",
    "music/Canim_Ecevit.mp3",
    "music/Dısarda_Kar_Yagiyor.mp3",
    "music/Sev_Kardesim_Senay.mp3",
    "music/Neye_Geldim_Dunyaya.mp3",
    "music/Kumsaldaki_Izler_Juanito.mp3",
    "music/Semiramis_Pekkan_Senden_Vazgecemem.mp3",
    "music/Genclik_Basimda_Duman.mp3",
    "music/Ersan_Erdura_Acılar_Surekli_Olamaz.mp3",
    "music/Juanito_Arkadasimin_Askisin.mp3",
    "music/Nilufer_dunya_donuyor.mp3",
    "music/Nilufer_selam_soyle.mp3",
    "music/gozleri_aska_gulen.mp3",
    "music/herkeskendinebenzer.mp3",
    "music/helvaci.mp3",
    "music/gecevakti.mp3",
    "music/dostlarbenihatirlasin.mp3",
    "music/sultanıyegah.mp3",
    "music/omurbiteryolbitmez.mp3",
    "music/Tamirci_Ciragi.mp3",
    "music/bahceleregeldibahar.mp3",
    "music/gozlerikaradilber.mp3",
    "music/kecivurdumcayira.mp3"
  ];

  function isTrack(ui, path) {
    if (!ui || !ui.currentAudio) return false;
    var src = ui.currentAudio.currentSrc || ui.currentAudio.src || '';
    try { src = decodeURI(src); } catch (_) {}
    src = src.split(/[?#]/)[0];
    return src === path || src.endsWith('/' + path);
  }

  function isRubiconActive(ui) {
    var state = ui && ui.dendryEngine && ui.dendryEngine.state;
    return !!(state && state.qualities && state.qualities.rubicon_mode &&
      !state.qualities.cyprus_mode &&
      (state.sceneId === 'rubicon_opening' ||
        (state.visits && state.visits.rubicon_opening)));
  }

  function clearOpeningWait(audio) {
    if (!audio || !audio._anatolianRubiconOnEnded) return;
    if (audio.onended === audio._anatolianRubiconOnEnded) {
      audio.onended = audio._anatolianRubiconPreviousEnd || null;
    }
    delete audio._anatolianRubiconPreviousEnd;
    delete audio._anatolianRubiconOnEnded;
  }

  function playMemorandum(ui) {
    if (!ui || ui.disable_audio) return;
    var audio = ui.currentAudio;
    clearOpeningWait(audio);
    if (isTrack(ui, MEMORANDUM)) {
      audio.loop = true;
      ui.audioPlaylist = [MEMORANDUM];
      ui.audioQueue = [];
      return;
    }
    // Single long soundtrack, repeated until the historical period ends.
    ui.audio('clear loop ' + MEMORANDUM);
  }

  function begin(ui) {
    if (!ui || ui.disable_audio) return;
    var audio = ui.currentAudio;
    if (audio && isTrack(ui, OPENING) && !audio.ended) {
      if (audio._anatolianRubiconOnEnded === audio.onended) return;
      clearOpeningWait(audio);
      var previous = audio.onended;
      var onMarchEnded = function (event) {
        clearOpeningWait(audio);
        if (isRubiconActive(ui)) playMemorandum(ui);
        else if (typeof previous === 'function') previous.call(audio, event);
      };
      audio._anatolianRubiconPreviousEnd = previous;
      audio._anatolianRubiconOnEnded = onMarchEnded;
      audio.onended = onMarchEnded;
      return;
    }
    // If the player took longer than the opening march, switch now.
    playMemorandum(ui);
  }

  function finish(ui) {
    if (!ui) return;
    clearOpeningWait(ui.currentAudio);
    if (ui.disable_audio || !isTrack(ui, MEMORANDUM)) return;
    // Do not shuffle here first: Dendry defers a shuffled switch until the
    // current track ends, and the Rubicon album could run for hours.
    ui.audio('clear ' + REGULAR[0]);
    ui.audio('shuffle ' + REGULAR.join(' '));
  }

  function sync(ui) {
    if (!ui || !ui.currentAudio || !ui.dendryEngine ||
        !ui.dendryEngine.state) return;
    if (isRubiconActive(ui)) begin(ui);
    else finish(ui);
  }

  root.AnatolianRubiconMusic = {
    begin: begin,
    finish: finish,
    sync: sync
  };
})(window);
