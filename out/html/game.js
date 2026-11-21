(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;
    AnatolianCyprusPresentation.install(ui);
    AnatolianSaveStorage.install(ui);
    AnatolianEndgame.install(ui);
    AnatolianCardActions.install(ui.dendryEngine);
    AnatolianCoalitions.install(ui.dendryEngine);

    // Preserve hands while the Cyprus calendar owns play; do not draw/play
    // domestic cards or show leadership actions until normal play resumes.
    ['displayDecks', 'displayHand', 'displayPinnedCards'].forEach(function(method) {
      var display = ui[method].bind(ui);
      ui[method] = function() {
        if (ui.dendryEngine.state.qualities.cyprus_mode) return;
        var result=display.apply(ui, arguments);
        if(method==='displayDecks'){var content=document.getElementById('content');if(content){var old=document.getElementById('government-news');if(old)old.remove();var box=document.createElement('section');box.id='government-news';box.className='government-news';var title=document.createElement('b');title.textContent='News';var text=document.createElement('p');text.textContent=AnatolianNationalCoalition.ensure(ui.dendryEngine.state.qualities).news||'No government news.';box.append(title,text);content.prepend(box);}}
        return result;
      };
    });
    ['drawCard', 'playCard', 'playPinnedCard'].forEach(function(method) {
      var engine = ui.dendryEngine, action = engine[method].bind(engine);
      engine[method] = function() {
        if (engine.state.qualities.cyprus_mode) {
          return method === 'drawCard' ? {id:null,title:'no_card_in_deck'} : engine;
        }
        return action.apply(engine, arguments);
      };
    });

    // Dendry restores scene styles after returning from special screens.
    // Keep the calendar-dependent layout when that clears content classes.
    var setStyle = ui.setStyle.bind(ui);
    ui.setStyle = function(style) {
      setStyle(style);
      if (window.dendryUI && window.dendryUI.dendryEngine) {
        window.updateCyprusWidth();
      }
    };

    // Permanent desk controls follow the four drawn-card slots.
    var drawHand=ui.displayHand.bind(ui);
    // A disabled pinned card needs the same visible explanation as a disabled menu action.
    function pinnedCardReason(id,Q){
      if(id==='cabinet'){
        if(!Q.CHP_in_government)return 'Our party must first enter government to direct the Cabinet.';
        if(Q.prime_minister_party!=='CHP')return 'The Cabinet is directed by the prime minister. We must first secure a CHP prime minister.';
        if(!(Q.in_CHP_majority||Q.chp_seats>=Q.majority_threshold))return 'Cabinet affairs require a CHP parliamentary majority.';
      }
      if(id==='municipalities')return 'Municipal affairs are not available under the current political circumstances.';
      return 'This card is currently unavailable.';
    }
    ui.displayHand=function(hand){
      drawHand(hand,4);
      if(ui.dendryEngine.state.qualities.cyprus_mode)return;
      var e=ui.dendryEngine,Q=e.state.qualities,list=document.querySelector('#content ul.hand');
      if(!list)return;
      list.querySelectorAll('.permanent-desk-card').forEach(function(el){el.remove();});
      var offers=e._compileChoices(e.getCurrentScene());
      ['cabinet','municipalities'].forEach(function(id){
        var scene=e.game.scenes[id],choice=offers.find(function(c){return c.id===id;});
        if(!scene)return;
        var enabled=!!(choice&&choice.canChoose),li=document.createElement('li');
        li.className='card-in-hand permanent-desk-card'+(enabled?'':' unavailable-card');
        if(id==='municipalities'&&enabled)li.classList.add('municipality-ready');
        li.dataset.deskCard=id;
        var link=document.createElement('a');
        link.className='card';
        link.href='#';
        link.setAttribute('aria-disabled',String(!enabled));
        var reason=enabled?'':(choice&&choice.subtitle||pinnedCardReason(id,Q));
        link.title=enabled?scene.title:reason;
        var img=document.createElement('img');
        img.className='card-img';
        img.src=scene.cardImage;
        link.appendChild(img);
        if(!enabled){
          var tip=document.createElement('span');
          tip.className='card-tooltip';
          tip.setAttribute('role','tooltip');
          tip.textContent=reason;
          link.appendChild(tip);
          link.setAttribute('aria-label',scene.title+'. '+reason);
        }
        link.onclick=function(event){event.preventDefault();event.stopPropagation();if(enabled)e.playPinnedCard(id);};
        var caption=document.createElement('span');
        caption.className='card-caption';
        caption.textContent=scene.title;
        li.append(link,caption);
        list.appendChild(li);
      });
    };

    // Add optional styled tooltips to choice buttons without changing subtitles.
    window.buttonTooltips = {
      'campaigning.workers': 'Build support among urban workers.',
      'campaigning.petty_bourgeoisie': 'Build support among artisans and shopkeepers.',
      'campaigning.state_employees': 'Build support among civil servants.',
      'campaigning.rural': 'Build support among rural workers and small farmers.',
      'campaigning.capitalists': 'Build support among industrialists and landlords.'
    };
    var displayChoices = ui.displayChoices.bind(ui);
    ui.displayChoices = function(choices) {
      displayChoices(choices);
      window.renderCyprusCommandPanel();
      var Q=ui.dendryEngine.state.qualities;
      if(!Q.cyprus_atilla2_started&&!Q.cyprus_atilla2_complete){
        var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),text;
        while((text=walker.nextNode()))if(!['SCRIPT','STYLE'].includes(text.parentElement.tagName))text.nodeValue=text.nodeValue.replace(/Atilla I\b/g,'Atilla');
      }
      var tooltips = window.buttonTooltips || {};
      choices.forEach(function(choice, index) {
        var choiceId = String(choice.id || '');
        var rubiconChoice = /^rubicon_|^ecevitandworker\./.test(ui.dendryEngine.state.sceneId || '');
        if (rubiconChoice && window.formatPartyLabel) {
          var li = document.querySelector('#content > ul.choices li:nth-child(' + (index + 1) + ')');
          var label = li && li.querySelector('a, .unavailable');
          if (label) {
            var decisionText = label.innerHTML.trim();
            var quotes = decisionText.match(/^(?:&quot;|&#34;|"|“)([\\s\\S]+?)(?:&quot;|&#34;|"|”)$/);
            label.innerHTML = window.formatPartyLabel(quotes ? quotes[1] : decisionText);
          }
        }
        var tooltip = AnatolianRules.cyprusAtilla1.choiceTooltip(choiceId.replace(/^@/, '')) || tooltips[choiceId] || tooltips[choiceId.replace(/^@/, '')];
        if (!tooltip) return;
        var button = document.querySelector('#content > ul.choices a[data-choice="' + index + '"]');
        if (button) {
          var tooltipId = 'choice-tooltip-' + index;
          button.setAttribute('aria-label', button.textContent.trim() + ' ' + tooltip);
          button.setAttribute('aria-describedby', tooltipId);
          var tooltipElement = document.createElement('span');
          tooltipElement.className = 'choice-tooltip';
          tooltipElement.id = tooltipId;
          tooltipElement.setAttribute('role', 'tooltip');
          tooltipElement.textContent = tooltip;
          button.appendChild(tooltipElement);
        }
      });
    };

    // Add your custom code here.
  };

  var TITLE = "Anatolian Dawn" + '_' + "Egehan";

  // the url is a link to game.json
  // test url: https://aucchen.github.io/social_democracy_mods/v0.1.json
  // TODO;
  window.loadMod = function(url) {
      ui.loadGame(url);
  };
  // Required source readings are saved independently of military decisions.
  window.cyprusBriefingScene = function(Q) {
    return AnatolianRules.cyprusAtilla1.briefingScene(Q);
  };
  window.cyprusPendingScene = function(Q) {
    return AnatolianRules.cyprusCampaign.pending(Q) || window.cyprusBriefingScene(Q) || AnatolianRules.cyprusAtilla1.historyScene(Q) || AnatolianRules.cyprusAtilla1.scene(Q);
  };
  window.updateCyprusWidth = function() {
  const content = document.getElementById('content');
  const toolsWrapper = document.getElementById('tools_wrapper');
  if (!content) return;
  const Q = window.dendryUI.dendryEngine.state.qualities;
  if (!Q) return;
  const mode = Q.cyprus_mode || 0;
  const isCyprus = mode != 0;
  // Content width
  content.classList.toggle('wide-mode', isCyprus);
  content.classList.toggle('normal-mode', !isCyprus);
  // Tools wrapper width
  if (toolsWrapper) {
    toolsWrapper.classList.toggle('wide-mode', isCyprus);
    toolsWrapper.classList.toggle('normal-mode', !isCyprus);
  }
  // End Day header link
  const endDayLink = document.getElementById('cyprus-end-day-link');
  if (endDayLink) {
    endDayLink.style.display = isCyprus ? 'inline-block' : 'none';
    endDayLink.textContent = window.cyprusPendingScene(Q) ? 'Continue operation' : (AnatolianRules.cyprusRoadmap ? AnatolianRules.cyprusRoadmap.skipLabel(Q) : 'Skip Day');
  }
};
  window.updateCyprusTerritoryHighlight = function() {
    var svg=document.getElementById('cyprus-map-svg'),record=window.cyprusSidePixels;
    if(!svg || !record || !record.context || svg.querySelector('#basemap image').getAttribute('href')!==record.source)return;
    var side=window.dendryUI.dendryEngine.state.qualities.cyprus_target_side;
    var overlay=svg.querySelector('#cyprus-territory-highlight');
    if(!AnatolianRules.cyprusAtilla1.operationStarted(window.dendryUI.dendryEngine.state.qualities)){if(overlay)overlay.remove();return;}
    if(side!=='turkish'&&side!=='greek'){if(overlay)overlay.remove();return;}
    if(!record.highlights)record.highlights={};
    if(!record.highlights[side]){
      var canvas=document.createElement('canvas');canvas.width=1063;canvas.height=644;
      var ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(record.context.canvas,0,0,canvas.width,canvas.height);
      var pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
      var color=[255,215,0],width=canvas.width,height=canvas.height;
      var mask=new Uint8Array(width*height),expanded=new Uint8Array(mask.length),closed=new Uint8Array(mask.length);
      // Include shaded terrain, then bridge thin district lines and texture gaps.
      // Only the outside of the territory should receive an opaque outline.
      for(var i=0;i<mask.length;i++){var p=i*4;mask[i]=side==='turkish'?+(d[p]>d[p+2]*1.15&&d[p]>d[p+1]*1.15):+(d[p+2]>d[p]*1.05&&d[p+2]>8);}
      for(var y=0;y<height;y++)for(var x=0;x<width;x++){
        var k=y*width+x;
        for(var dy=-2;dy<=2&&!expanded[k];dy++)for(var dx=-2;dx<=2;dx++){
          var nx=x+dx,ny=y+dy;if(nx>=0&&nx<width&&ny>=0&&ny<height&&mask[ny*width+nx]){expanded[k]=1;break;}
        }
      }
      for(var y=0;y<height;y++)for(var x=0;x<width;x++){
        var k=y*width+x,inside=1;
        for(var dy=-2;dy<=2&&inside;dy++)for(var dx=-2;dx<=2;dx++){
          var nx=x+dx,ny=y+dy;if(nx>=0&&nx<width&&ny>=0&&ny<height&&!expanded[ny*width+nx]){inside=0;break;}
        }
        closed[k]=inside;
      }
      for(var i=0;i<closed.length;i++){var p=i*4;d[p]=color[0];d[p+1]=color[1];d[p+2]=color[2];d[p+3]=closed[i]?51:0;} // 20% opacity: 80% transparent.
      ctx.putImageData(pixels,0,0);
      ctx.globalCompositeOperation='destination-out';ctx.fillStyle='black';ctx.strokeStyle='black';ctx.lineWidth=4;
      svg.querySelectorAll('.sba').forEach(function(p){ctx.beginPath();Array.from(p.points).forEach(function(point,j){if(j===0)ctx.moveTo(point.x*canvas.width/4250,point.y*canvas.height/2573);else ctx.lineTo(point.x*canvas.width/4250,point.y*canvas.height/2573);});ctx.closePath();ctx.fill();ctx.stroke();});
      pixels=ctx.getImageData(0,0,canvas.width,canvas.height);d=pixels.data;var alpha=new Uint8Array(canvas.width*canvas.height);
      for(var j=0;j<alpha.length;j++)alpha[j]=d[j*4+3];
      for(var y=1;y<canvas.height-1;y++)for(var x=1;x<canvas.width-1;x++){var k=y*canvas.width+x;if(alpha[k]&&(!alpha[k-1]||!alpha[k+1]||!alpha[k-canvas.width]||!alpha[k+canvas.width]))d[k*4+3]=255;}
      ctx.globalCompositeOperation='source-over';ctx.putImageData(pixels,0,0);record.highlights[side]=canvas.toDataURL();
    }
    if(!overlay){overlay=document.createElementNS('http://www.w3.org/2000/svg','image');overlay.id='cyprus-territory-highlight';overlay.setAttribute('width','4250');overlay.setAttribute('height','2573');overlay.setAttribute('pointer-events','none');overlay.style.filter='none';svg.appendChild(overlay);}
    overlay.dataset.side=side;overlay.setAttribute('href',record.highlights[side]);overlay.style.filter='none';
  };
  window.setupCyprusSideClicks = function() {
    var svg = document.getElementById('cyprus-map-svg');
    if (!svg) return;
    svg.querySelectorAll('.district').forEach(function(p) { p.style.pointerEvents='none';p.style.display='none';p.removeAttribute('tabindex');p.removeAttribute('role'); });
    var source = svg.querySelector('#basemap image').getAttribute('href');
    if (!window.cyprusSidePixels || window.cyprusSidePixels.source !== source) {
      var record = {source:source,context:null};window.cyprusSidePixels=record;
      var img=new Image();img.onload=function(){var canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;var ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);record.context=ctx;window.updateCyprusTerritoryHighlight();if(record.pending){record.pending();record.pending=null;}};img.src=source;
    }
    var panel=document.getElementById('cyprus-command-panel');
    var chooser=panel.querySelector('#cyprus-side-choices');
    if (!chooser) {
      chooser=document.createElement('div');chooser.id='cyprus-side-choices';
      ['turkish','greek'].forEach(function(side){var b=document.createElement('button');b.type='button';b.className='cyprus-action-btn';b.dataset.side=side;b.textContent=side==='turkish'?'Turkish positions (red)':'Greek positions (blue)';chooser.appendChild(b);});
      panel.querySelector('#cyprus-map-wrap').appendChild(chooser);
    }
    function select(side) {if(!AnatolianRules.cyprusAtilla1.operationStarted(window.dendryUI.dendryEngine.state.qualities))return;window.dendryUI.dendryEngine.state.qualities.cyprus_target_side=side;window.updateCyprusTerritoryHighlight();window.setupCyprusMapClicks();chooser.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.side===side?'true':'false');});}
    chooser.querySelectorAll('button').forEach(function(b){b.disabled=!AnatolianRules.cyprusAtilla1.operationStarted(window.dendryUI.dendryEngine.state.qualities);b.onclick=function(){select(b.dataset.side);};b.setAttribute('aria-pressed',window.dendryUI.dendryEngine.state.qualities.cyprus_target_side===b.dataset.side?'true':'false');});
    svg.style.cursor=AnatolianRules.cyprusAtilla1.operationStarted(window.dendryUI.dendryEngine.state.qualities)?'pointer':'default';
    svg.setAttribute('aria-label','Click Turkish red territory or Greek blue territory to select a side.');
    svg.onclick=function(event){
      if(!AnatolianRules.cyprusAtilla1.operationStarted(window.dendryUI.dendryEngine.state.qualities))return;
      var point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
      var record=window.cyprusSidePixels;if(!record || record.source!==source)return;
      function choose(){
        if(!svg.isConnected || svg.querySelector('#basemap image').getAttribute('href')!==source)return;
        if(Array.from(svg.querySelectorAll('.sba')).some(function(p){return p.isPointInFill(point);}))return;
        var x=Math.floor(point.x),y=Math.floor(point.y);
        if(x<0||y<0||x>=4250||y>=2573)return;
        function readPixel(px,py){var canvas=record.context.canvas;return record.context.getImageData(Math.min(canvas.width-1,Math.max(0,Math.floor(px*canvas.width/4250))),Math.min(canvas.height-1,Math.max(0,Math.floor(py*canvas.height/2573))),1,1).data;}
        function sideAt(px,py){
          var c=readPixel(px,py);
          if(c[0]>c[2]*1.15&&c[0]>c[1]*1.15)return 'turkish';
          if(c[2]>c[0]*1.05&&c[2]>35)return 'greek';
          return '';
        }
        var side=sideAt(x,y);
        if(!side){
          // White borders and city markers belong to the nearest colored land.
          // Black sea pixels and British bases never select a side.
          var c=readPixel(x,y);
          if(Math.max(c[0],c[1],c[2])<35)return;
          for(var radius=2;radius<=40&&!side;radius+=2){
            for(var angle=0;angle<8&&!side;angle++){
              var px=Math.round(x+radius*Math.cos(angle*Math.PI/4)),py=Math.round(y+radius*Math.sin(angle*Math.PI/4));
              if(px>=0&&py>=0&&px<4250&&py<2573)side=sideAt(px,py);
            }
          }
        }
        if(side)select(side);
      }
      if(record.context)choose();else record.pending=choose;
    };
  };
  window.setupCyprusMapClicks = function() {
    var panel = document.getElementById('cyprus-command-panel');
    if (!panel) return;
    var Q = window.dendryUI.dendryEngine.state.qualities, rules = AnatolianRules.cyprusAtilla1;
    var started=rules.operationStarted(Q);
    var selected = started && ['turkish','greek'].indexOf(Q.cyprus_target_side) >= 0 ? Q.cyprus_target_side : '';
    var chosen = selected === 'turkish' ? 'Turkish positions' : selected === 'greek' ? 'Greek positions' : '';
    document.getElementById('cyprus-selected-district').textContent = !started ? 'Military actions unlock when the July 20 operation begins.' : chosen ? 'Selected: ' + chosen : 'Select Turkish (red) or Greek (blue) positions to prepare support.';
    panel.querySelectorAll('[data-branch]').forEach(function(button) {
      button.disabled = !selected;
      button.setAttribute('aria-expanded',window.cyprusSupportBranch === button.dataset.branch ? 'true' : 'false');
      button.onclick = function() {
        window.cyprusSupportBranch = button.dataset.branch;
        window.setupCyprusMapClicks();
      };
    });
    var actions = document.getElementById('cyprus-support-actions');
    actions.replaceChildren();
    if (!selected || !window.cyprusSupportBranch) return;
    var media = document.createElement('div');
    media.className = 'cyprus-force-media';
    var image = document.createElement('img');
    var visuals = {land:{src:'img/landforces.webp',alt:'Turkish Land Forces'},
      air:{src:'img/icon_aerial.webp',alt:'Turkish Air Forces'},
      naval:{src:'img/icon_naval.webp',alt:'Turkish Naval Forces'}};
    var visual = visuals[window.cyprusSupportBranch];
    image.src = visual.src; image.alt = visual.alt;
    media.appendChild(image); actions.appendChild(media);
    var title = document.createElement('p');
    title.textContent = 'Actions targeting ' + chosen + '. Applies to the next roll; each action has a three-day cooldown.';
    actions.appendChild(title);
    var choices = document.createElement('ul');
    choices.className = 'choices';
    actions.appendChild(choices);
    Object.keys(rules.supportActions).forEach(function(key) {
      var action = rules.supportActions[key];
      if (action.branch !== window.cyprusSupportBranch || action.side !== selected) return;
      var reason = rules.supportUnavailable(Q,key,selected);
      var row = document.createElement('li');
      var label = document.createElement(reason ? 'span' : 'a');
      label.textContent = action.label + '.';
      if (reason) {
        row.className = 'unavailable'; row.dataset.supportAction = key;
        row.setAttribute('aria-disabled','true');
        row.onclick = function(event) { event.preventDefault(); event.stopPropagation(); };
      } else {
        label.href = '#'; label.dataset.supportAction = key;
        label.onclick = function(event) {
          // Inline support uses the shared choice styling without invoking an event choice.
          event.preventDefault(); event.stopPropagation();
          if (!rules.useSupport(Q,key,Q.cyprus_target_side)) return;
          window.updatePartySidebar(); window.setupCyprusMapClicks(); window.dendryUI.autosave();
        };
      }
      row.appendChild(label);
      var subtitle = document.createElement('div'); subtitle.className = 'subtitle';
      subtitle.textContent = action.cost + ' resources; +' + action.bonus + ' to the next roll.' + (reason ? ' ' + reason : '');
      row.appendChild(subtitle); choices.appendChild(row);
    });
  };
  window.cyprusAdvanceDay = function() {
  var Q = window.dendryUI.dendryEngine.state.qualities;
  if (!Q.cyprus_mode || Q.cyprus_end_shown) return;
  var operationScene = window.cyprusPendingScene(Q);
  if (operationScene) {
    if (!Q.cyprus_calendar_advance) { Q.year=Q.cyprus_year;Q.month=Q.cyprus_month;Q.week=Q.cyprus_day<=15?1:2; }
    window.dendryUI.dendryEngine.goToScene(operationScene);
    return;
  }
  if (AnatolianRules.cyprusRoadmap && AnatolianRules.cyprusRoadmap.active(Q)) {
    if (AnatolianRules.cyprusRoadmap.skip(Q)) window.dendryUI.dendryEngine.goToScene('cyprus_campaign_continue');
    return;
  }
  var nextDate = new Date(Date.UTC(Q.cyprus_year, Q.cyprus_month - 1, Q.cyprus_day + 1));
  Q.cyprus_day = nextDate.getUTCDate();
  Q.cyprus_month = nextDate.getUTCMonth() + 1;
  Q.cyprus_year = nextDate.getUTCFullYear();

  var monthNames = ['', 'January','February','March','April','May','June','July',
                     'August','September','October','November','December'];
  Q.cyprus_date_display = monthNames[Q.cyprus_month] + ' ' + Q.cyprus_day + ', ' + Q.cyprus_year;

  AnatolianRules.cyprusAtilla1.replenishResources(Q);

  window.updateCyprusDisplay();

  // Only a daily crossing into a new half-month may advance domestic time.
  // Repair the calendar coordinates of saves that drifted through card play,
  // without applying extra domestic turns to catch up with that drift.
  var calendarWeek = Q.cyprus_day <= 15 ? 1 : 2;
  var boundary = Q.cyprus_day === 1 || Q.cyprus_day === 16;
  var expectedPrevious = new Date(Date.UTC(Q.cyprus_year, Q.cyprus_month - 1, Q.cyprus_day - 1));
  var previousWeek = expectedPrevious.getUTCDate() <= 15 ? 1 : 2;
  var calendarMatches = Q.year === expectedPrevious.getUTCFullYear() &&
    Q.month === expectedPrevious.getUTCMonth() + 1 && Q.week === previousWeek;
  // Entry happens in July's second normal period, already accounted for.
  var alreadyCurrent = Q.year === Q.cyprus_year && Q.month === Q.cyprus_month && Q.week === calendarWeek;
  Q.cyprus_calendar_advance = boundary && calendarMatches && !alreadyCurrent ? 1 : 0;
  Q.month_actions = Q.cyprus_calendar_advance;
  if (!Q.cyprus_calendar_advance) {
    Q.year = Q.cyprus_year; Q.month = Q.cyprus_month; Q.week = calendarWeek;
  }
  window.dendryUI.dendryEngine.goToScene('post_event');
  if (Q.cyprus_year > 1974 || (Q.cyprus_year === 1974 && Q.cyprus_month >= 9)) {
    Q.cyprus_end_shown = 1;
    window.dendryUI.dendryEngine.goToScene('kibrisson');
    return;
  }

  function showDateEvent(id) {
    var engine = window.dendryUI.dendryEngine;
    var scene = engine.game.scenes[id];
    if (scene && engine._runPredicate(scene.viewIf, true)) engine.goToScene(id);
  }

  var briefingScene = window.cyprusBriefingScene(Q);
  if (briefingScene) {
    window.dendryUI.dendryEngine.goToScene(briefingScene);
    return;
  }
  operationScene = window.cyprusPendingScene(Q);
  if (operationScene) {
    // Preserve the existing optional stories before the relevant daily decision.
    if (Q.flavour_events && Q.cyprus_day === 21) showDateEvent('ayse');
    else if (Q.flavour_events && Q.cyprus_day === 24) showDateEvent('plane');
    else window.dendryUI.dendryEngine.goToScene(operationScene);
    return;
  }

  // Explicit date-triggered event check
  if (Q.cyprus_day === 16 && Q.cyprus_month === 7 && Q.cyprus_year === 1974) {
    showDateEvent('meetingopposition');
    return;
  }
  if (Q.cyprus_day === 17 && Q.cyprus_month === 7 && Q.cyprus_year === 1974) {
    showDateEvent('cyprusintro');
    return;
  }
  if (Q.cyprus_day === 21 && Q.cyprus_month === 7 && Q.cyprus_year === 1974) {
    showDateEvent('ayse');
    return;
  }
  if (Q.cyprus_day === 24 && Q.cyprus_month === 7 && Q.cyprus_year === 1974) {
    showDateEvent('plane');
    return;
  }
};

window.updateCyprusTabVisibility = function() {
  var Q = window.dendryUI.dendryEngine.state.qualities;
  var tab = document.getElementById('cyprus_tab');
  if (!tab) return;
  tab.style.display = (Q.cyprus_mode || 0) != 0 ? '' : 'none';
};

    window.updateCyprusDisplay = function() {
  var Q = window.dendryUI.dendryEngine.state.qualities;
  var map = {
    'cyprus-date-display': Q.cyprus_date_display,
    'cyprus-military-strength': Q.military_strength,
    'cyprus-us-attitude': Q.us_attitude,
    'cyprus-uk-attitude': Q.uk_attitude,
    'cyprus-greece-attitude': Q.greece_attitude,
    'cyprus-leverage-points': Q.leverage_points
  };
  for (var id in map) {
    var el = document.getElementById(id);
    if (el) el.textContent = map[id];
  }
};

window.updateTitleScreenImages = function() {
  const sceneId = window.dendryUI.dendryEngine.state.sceneId;
  const isTitleScreen = (sceneId === 'root.start_menu_2');

  const statsTabs = document.getElementById('stats_tab_container');
  const qualities = document.getElementById('qualities');
  const partyTabs = document.getElementById('party_tab_container');
  const partyQualities = document.getElementById('party_qualities');
  const leftImg = document.getElementById('cyprus-title-left-img');
  const rightImg = document.getElementById('cyprus-title-right-img');

  if (statsTabs) statsTabs.style.display = isTitleScreen ? 'none' : '';
  if (qualities) qualities.style.display = isTitleScreen ? 'none' : '';
  if (partyTabs) partyTabs.style.display = isTitleScreen ? 'none' : '';
  if (partyQualities) partyQualities.style.display = isTitleScreen ? 'none' : '';
  if (leftImg) leftImg.style.display = isTitleScreen ? '' : 'none';
  if (rightImg) rightImg.style.display = isTitleScreen ? '' : 'none';
};

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

  window.showMods = function() {
    window.hideOptions();
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('mod_loader')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('mod_loader');
    }
  };

  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
      window.updateMusicBtn();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      if (window.AnatolianRubiconMusic) window.AnatolianRubiconMusic.sync(window.dendryUI);
      window.dendryUI.saveSettings();
      window.updateMusicBtn();
  };

  window.updateMusicBtn = function() {
      var disabled = window.dendryUI && window.dendryUI.disable_audio;
      var onIcon = document.getElementById('music-on-icon');
      var offIcon = document.getElementById('music-off-icon');
      if (onIcon && offIcon) {
          onIcon.style.display = disabled ? 'none' : 'inline';
          offIcon.style.display = disabled ? 'inline' : 'none';
      }
  };

  window.toggleMusicButton = function() {
      if (window.dendryUI && window.dendryUI.disable_audio) {
          window.enableAudio();
      } else {
          window.disableAudio();
      }
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableFlavour = function() {
      window.dendryUI.dendryEngine.state.qualities.flavour_events = 0;
      window.dendryUI.save();
  };

  window.enableFlavour = function() {
      window.dendryUI.dendryEngine.state.qualities.flavour_events = 1;
      window.dendryUI.save();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    // The old global physical-map radios were removed when map modes moved
    // into the election window. Their absence must not abort showOptions().
    var physicalMap = document.documentElement.classList.contains('physical-map-enabled');
    var physicalYes = document.getElementById('physical_map_yes');
    var physicalNo = document.getElementById('physical_map_no');
    if (physicalYes) physicalYes.checked = physicalMap;
    if (physicalNo) physicalNo.checked = !physicalMap;
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    var flavour_events = window.dendryUI.dendryEngine.state.qualities.flavour_events;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (flavour_events) {
        $('#flavour_yes')[0].checked = true;
    } else {
        $('#flavour_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };


  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.

 function updateCyprusDate() {
  const Q = window.dendryUI.dendryEngine.state.qualities;
  const dateDisplay = document.querySelector("#cyprus-date-display");
  if (dateDisplay) {
    dateDisplay.textContent = "Day " + Q.cyprus_date;
  }
}

  // This function allows you to do something in response to signals.
  // This section of the code has been taken from Communist45, the developer of Beeshana Kalaya with their permission! Ask for their permission before copying and using it.

  window.handleSignal = function (signal, event, scene_id) {};

  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    if (window.AnatolianRubiconMusic) window.AnatolianRubiconMusic.sync(window.dendryUI);
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
      window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false
    }
  };
window.displayText = function (text) {
  // Normalize presentation, including text retained in older saves.
  text=String(text).replace(/\s*\u2014\s*/g,', ').replace(/([.!?]), /g,'$1 ');
  var formattingEngine=window.dendryUI&&window.dendryUI.dendryEngine;
  if(formattingEngine&&/^cyprus/.test(formattingEngine.state.sceneId||'')){
    text=text.replace(/(^|<br\s*\/?>|<p(?:\s[^>]*)?>|<h[1-6](?:\s[^>]*)?>)(?:\s|&nbsp;)*(?::(?:\s|&nbsp;)*)+/gi,'$1');
    text=text.replace(/(^|<br\s*\/?>|<p(?:\s[^>]*)?>|<h[1-6](?:\s[^>]*)?>)(?:\s|&nbsp;)+/gi,'$1');
  }

  // Resume the ending soundtrack when restoring either celebration screen.
  if(window.dendryUI&&window.AnatolianRules&&AnatolianRules.cyprusRoadmap.startEndingMusic){
    var celebrationEngine=window.dendryUI.dendryEngine;
    if(celebrationEngine&&['cyprus_campaign_final','cyprus_sarachane_rally'].includes(celebrationEngine.state.sceneId))AnatolianRules.cyprusRoadmap.startEndingMusic(celebrationEngine.state.qualities);
  }

        return applyWholesome(text);
    };

    //To get a value
    function getRelationshipText(value) {
        if (value === undefined || value === null) return '';
        if (value <= 5) return '<span style="color: #FF0000;">Hostile</span>';
        if (value <= 14.9) return '<span style="color: #FF4500;">Adversarial</span>';
        if (value <= 39.9) return '<span style="color: #FFA500;">Uncooperative</span>';
        if (value <= 54.9) return '<span style="color: #FFD700;">Neutral</span>';
        if (value <= 64.9) return '<span style="color: #9ACD32;">Cordial</span>';
        if (value <= 74.9) return '<span style="color: #32CD32;">Cooperative</span>';
        return '<span style="color: #008000;">Productive</span>';
    }

    function getMilitancyText(value) {
        if (value === undefined || value === null) return 'Unknown';
        if (value <= 0.05) return '<span style="color: #008000;">Nonexistent</span>';
        if (value <= 0.14) return '<span style="color: #32CD32;">Very low</span>';
        if (value <= 0.24) return '<span style="color: #9ACD32;">Low</span>';
        if (value <= 0.44) return '<span style="color: #FFD700;">Medium-low</span>';
        if (value <= 0.69) return '<span style="color: #FFA500;">Medium</span>';
        if (value <= 1) return '<span style="color: #FF4500;">High</span>';
        return '<span style="color: #FF0000;">Very high</span>';
    }

    // Helper function to convert loyalty/morale number to text
    function getLoyaltyText(value) {
        if (value === undefined || value === null) return 'Unknown';
        if (value <= 0.06) return '<span style="color: #FF0000;">Completely disloyal</span>';
        if (value <= 0.19) return '<span style="color: #FF4500;">Very disloyal</span>';
        if (value <= 0.31) return '<span style="color: #FF8C00;">Generally disloyal</span>';
        if (value <= 0.41) return '<span style="color: #FFA500;">Mostly disloyal</span>';
        if (value <= 0.54) return '<span style="color: #FFD700;">Divided</span>';
        if (value <= 0.71) return '<span style="color: #9ACD32;">Mostly loyal**</span>';
        if (value <= 0.95) return '<span style="color: #32CD32;">Generally loyal**</span>';
        return '<span style="color: #008000;">Completely loyal</span>';
    }

function getPartyIdeology(party, Q) {
    if (!Q) return 'Unknown';
    3
    switch(party) {
        case 'TIP':
            if (Q.TIP_party_leader === "Unorganized") return '<span style="color: #C42424;">Left Wing</span> (Disorganized)';
            if (Q.TIP_party_leader === "Behice Boran") return '<span style="color: #780808;">Far Left</span>  (Marxism-Leninism)';
            if (Q.TIP_party_leader === "Mehmet Ali Aybar") return '<span style="color: #C42424;">Left Wing</span> (Democratic Socialism)';
            return 'Unknown';
        case 'TİP':
            if (Q.TIP_party_leader === "Unorganized") return '<span style="color: #C42424;">Left Wing</span> (Disorganized)';
            if (Q.TIP_party_leader === "Behice Boran") return '<span style="color: #780808;">Far Left</span>  (Marxism-Leninism)';
            if (Q.TIP_party_leader === "Mehmet Ali Aybar") return '<span style="color: #C42424;">Left Wing</span> (Democratic Socialism)';
            return 'Unknown';
        case 'TSİP': return '<span style="color: #780808;">Far Left</span> (Marxism-Leninism)';
        case 'TKP': return '<span style="color: #780808;">Far Left</span> (Marxism-Leninism)';
        case 'TEP': return '<span style="color: #910a0a;">Left Wing-Far Left</span> (National Democratic Revolution)';
        case 'SDP': return '<span style="color: #C42424;">Left Wing</span> (Democratic Socialism)';
        case 'MGP':
        case 'CGP':
            if (Q.CGP_party_leader === "Feyzioğlu") return '<span style="color: #484863;">Center-Center Right</span> (Right Kemalism)';
            return 'Unknown';
        case 'AP':
            if (Q.AP_party_leader === "Demirel") return '<span style="color: #4344af;">Center Right-Right</span> (Conservative Liberalism)';
            return 'Unknown';
        case 'CHP':
            if (Q.CHP_party_leader === "İnönü") return '<span style="color: #803c53;">Center-Center Left</span> (Kemalism)';
            if (Q.CHP_party_leader === "Ecevit") return '<span style="color: #c76083;">Center Left</span> (Left Kemalism)';
            return 'Unknown';
        case 'DP':
            if (Q.DP_party_leader === "Bozbeyli") return '<span style="color: #342675;">Right Wing</span> (Conservative Populism)';
            return 'Unknown';
        case 'MNP':
        case 'MSP':
            if(!Q.MSP_formed)return 'Unorganized';
            if (Q.MSP_party_leader === "Süleyman Arif") return '<span style="color: #3c3e4e;">Far Right</span> (Islamic Conservatism)';
            if (Q.MSP_party_leader === "Erbakan") return '<span style="color: #3c3e4e ;">Far Right</span> (National Vision)';
            return 'Unknown';
        case 'MHP':
            if (Q.MHP_party_leader === "Alparslan Türkeş") return '<span style="color: #3c3e4e ;">Far Right</span> (Turkic-Islamic Synthesis)';
            return 'Unknown';
        default:
            return 'Unknown';
    }
}

    //To check if extra dynamic or not
    function getDynamicTooltipContent(searchString, baseTooltip) {
        var Q = window.dendryUI && window.dendryUI.dendryEngine && window.dendryUI.dendryEngine.state ?
                window.dendryUI.dendryEngine.state.qualities : null;

        if (!Q) return baseTooltip.explanationText;

        if (searchString === 'TIP' && Q['TIP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['TIP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
         if (searchString === 'TİP' && Q['TIP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['TIP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if(searchString==='TBP'||searchString==='MP'){return baseTooltip.explanationText+'<br>Politics: '+(searchString==='TBP'?'Left (Alevi Democracy)':'Right (National Conservatism)')+'<br>Relation: '+getRelationshipText(Q[searchString+'_relation']);}
        if (searchString === 'Socialist Left') {
            var socialistLeftParties = [
                { word: 'TİP', voteQuality: 'TIP_socialist_left_r' },
                { word: 'TKP', voteQuality: 'TKP_r' },
                { word: 'TSİP', voteQuality: 'TSIP_r' },
                { word: 'TEP', voteQuality: 'TEP_r' },
                { word: 'SDP', voteQuality: 'SDP_r' }
            ];
            var rows = socialistLeftParties.map(function(party) {
                var colourEntry = colourList.find(function(c) { return c.word === party.word; });
                var colourMatch = colourEntry ? colourEntry.style.match(/color:\s*([^;]+)/) : null;
                var colour = colourMatch ? colourMatch[1] : '#8B0000';
                var vote = Q[party.voteQuality] !== undefined ? Number(Q[party.voteQuality]).toFixed(1) : '0.0';
                return '<div style="text-align: left;"><span style="display: inline-block; width: 10px; height: 10px; background-color: ' +
                    colour + '; margin-right: 4px;"></span><b>' + party.word + '</b>: ' + vote + '%</div>';
            }).join('');
            return baseTooltip.explanationText + '<br>' + rows;
        }
        if (searchString === 'DP' && Q['DP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['DP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if ((searchString === 'CGP' || searchString === 'MGP') && Q['CGP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['CGP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if (searchString === 'AP' && Q['AP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['AP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if ((searchString === 'MSP' || searchString === 'MNP') && Q['MSP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['MSP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText + (!Q.MSP_formed ? '<br><strong>BANNED</strong>' : '');
        }
        if (searchString === 'MHP' && Q['MHP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['MHP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if (searchString === 'CHP') {
            var ideology = getPartyIdeology(searchString, Q);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology;
        }
        if (searchString === 'TSİP') {
            var ideology = getPartyIdeology(searchString, Q);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology;
        }
        if (searchString === 'TEP') {
            var ideology = getPartyIdeology(searchString, Q);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology;
        }
        if (searchString === 'TKP') {
            var ideology = getPartyIdeology(searchString, Q);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology;
        }
        if (searchString === 'SDP') {
            var ideology = getPartyIdeology(searchString, Q);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology;
        }
        return baseTooltip.explanationText;
    }

    let partyLabels;
    function getPartyLabelIndex() {
        if (partyLabels?.tooltipCount === tooltipList.length && partyLabels?.colourCount === colourList.length) return partyLabels;
        const tooltips = new Map(), colours = new Map();
        for (const entry of tooltipList) if (!tooltips.has(entry.searchString)) tooltips.set(entry.searchString, entry);
        for (const entry of colourList) if (!colours.has(entry.word)) colours.set(entry.word, entry);
        const allWords = new Set([...tooltips.keys(), ...colours.keys()]);
        const special='^$.*+?()[]{}|';
        const words=[...allWords].sort((a,b)=>b.length-a.length).map(w=>Array.from(w).map(ch=>special.includes(ch)||ch.charCodeAt(0)===92?String.fromCharCode(92)+ch:ch).join(''));
        const regex=new RegExp('(?<![\\p{L}\\p{N}_])('+words.join('|')+')(?![\\p{L}\\p{N}_])','gu');

        partyLabels = {tooltips, colours, regex, tooltipCount: tooltipList.length, colourCount: colourList.length};
        return partyLabels;
    }

    const partyTooltipLabels = new Set(['CHP', 'AP', 'DP', 'TIP', 'TİP', 'TKP', 'TSİP', 'TEP', 'SDP', 'CGP', 'MGP', 'MSP', 'MNP', 'MHP', 'CKMP', 'TBP', 'MP', 'T-KDP', 'Socialist Left']);

    function applyWholesome(str) {
        const {tooltips, colours, regex} = getPartyLabelIndex();
        return str.replace(/(<(?:span|strong)[^>]*>.*?<\/(?:span|strong)>|<[^>]+>|[^<]+)/g, (segment) => {
            if (segment.startsWith('<')) {
                // Plain styled spans and bold text still receive party tooltips.
                // Existing tooltip containers are preserved to avoid nesting duplicates.
                if (/^<(?:span|strong)\b/i.test(segment) && !/(?:mytooltip|wide_tooltip|tooltip-text)/.test(segment)) {
                    const wrapper=segment.match(/^(<[^>]+>)([\s\S]*)(<\/(?:span|strong)>)$/i);
                    if(wrapper)return wrapper[1]+applyWholesome(wrapper[2])+wrapper[3];
                }
                return segment;
            }

            return segment.replace(regex, (match) => {
                const tooltip = tooltips.get(match);
                const colour = colours.get(match);

                let style = colour ? colour.style : '';
                let innerText = match === 'TIP' ? 'TİP' : match;

                if (colour && colour.img) {
                    innerText = `<img src="${colour.img}" class="p_icon" alt="">${innerText}`;
                }

                if (tooltip) {
                    var tooltipContent = getDynamicTooltipContent(match, tooltip);
                    return `<span class='mytooltip${partyTooltipLabels.has(match) ? ' party-tooltip' : ''}' style='${style}'>${innerText}<span class='mytooltiptext'>${tooltipContent}</span></span>`;
                } else if (colour) {
                    return `<span style='${style}'>${innerText}</span>`;
                }

                return match;
            });
        });
    }
  window.formatPartyLabel = applyWholesome;
  window.partyTooltipHtml = function(name) {
      const entry = getPartyLabelIndex().tooltips.get(name);
      return entry ? getDynamicTooltipContent(name, entry) : name;
  };
  // TODO: have some code for tabbed sidebar browsing.
  window.updateSidebar = function() {
      var scene = dendryUI.game.scenes[window.statusTab];
      var baseStatus = dendryUI.game.scenes.status;
      dendryUI.dendryEngine._runActions(baseStatus.onArrival);
      if (scene !== baseStatus) dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      var html = dendryUI.contentToHTML.convert(displayContent);
      if (window._sidebarHTML !== html) {
          $('#qualities').html(html);
          window._sidebarHTML = html;
      }
  };

  window.updatePartySidebar = function() {
      var newTab = window.statusTabRight || 'status.the_party';
      var scene = dendryUI.game.scenes[newTab];
      if (!scene) return;
      if (!dendryUI.dendryEngine._runPredicate(scene.viewIf, true)) {
          $('#party_qualities').html('<p>This tab is not currently available.</p>');
          window._partySidebarHTML = null;
          return;
      }
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      var html = dendryUI.contentToHTML.convert(displayContent);
      if (window._partySidebarHTML !== html) {
          $('#party_qualities').html(html);
          window._partySidebarHTML = html;
      }
      // Render d3 parliament diagram after DOM update, only when the party tab is active
      if (newTab === 'status.the_party') {
          window.renderPartyParliament();
      }
  };

  window._lastParliamentDataKey = null;
  window._cachedParliamentSVGContent = null;

  window.renderPartyParliament = function() {
      var svgEl = document.getElementById('party-parliament');
      if (!svgEl || !window.partyParliamentData || window.partyParliamentData.length === 0) return;

      // Build a key from the current data to detect changes
      var width = svgEl.parentElement ? svgEl.parentElement.offsetWidth : 220;
      if (width <= 0) width = 220;
      var dataKey = width + ':' + JSON.stringify(window.partyParliamentData.map(function(p) {
          return { id: p.id, seats: p.seats, color: p.color, outline: p.outline };
      }));

      // If data hasn't changed and we have cached SVG content, reuse it
      if (dataKey === window._lastParliamentDataKey && window._cachedParliamentSVGContent) {
          // The story's SVG contains whitespace even when it has no chart elements.
          if (!svgEl.firstElementChild) svgEl.innerHTML = window._cachedParliamentSVGContent;
          return;
      }

      var isFirstRender = !window.partyParliamentRendered;

      // Always clear SVG and interrupt any running D3 transitions
      d3.select("#party-parliament").selectAll("*").interrupt().remove();

      var parliament = d3.parliament();
      parliament.width(width).height(width).innerRadiusCoef(0.4);
      parliament.enter.fromCenter(isFirstRender).smallToBig(isFirstRender);
      parliament.update.animate(false);
      parliament.exit.toCenter(false).bigToSmall(false);
      d3.select("#party-parliament").datum(window.partyParliamentData).call(parliament);
      window.partyParliamentRendered = true;

      // Cache the rendered SVG content for reuse
      if (!isFirstRender) {
          window._lastParliamentDataKey = dataKey;
          window._cachedParliamentSVGContent = svgEl.innerHTML;
      } else {
          // First render has animations; cache after they complete
          setTimeout(function() {
              var el = document.getElementById('party-parliament');
              if (el && el === svgEl && dataKey === window._currentParliamentDataKey) {
                  window._lastParliamentDataKey = dataKey;
                  window._cachedParliamentSVGContent = el.innerHTML;
              }
          }, 2000);
      }
      window._currentParliamentDataKey = dataKey;
  };

  window.changeTab = function(newTab, tabId) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementById('stats_sidebar').getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

  window.changeRightTab = function(newTab, tabId) {
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementById('party_sidebar').getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTabRight = newTab;
      window.updatePartySidebar();
  };

  window.onDisplayContent = function() {
      if(typeof AnatolianCyprusPresentation!=="undefined")AnatolianCyprusPresentation.sync();
      // Title screens have no initialized simulation or portraits to display.
      if (window.dendryUI.dendryEngine.state.qualities.started) {
          var Q = window.dendryUI.dendryEngine.state.qualities;
          if (Q.cyprus_mode) AnatolianRules.cyprusAtilla1.ensureSupport(Q);
          if (Q.cyprus_mode && !window.cyprusSidebarWasActive) {
              window.statusTabRight = 'status.cyprus';
              document.getElementById('cyprus_tab').classList.add('active');
              document.getElementById('the_party_tab').classList.remove('active');
          }
          window.cyprusSidebarWasActive = !!Q.cyprus_mode;
          window.updateSidebar();
          if (window.statusTabRight === 'status.cyprus' && !window.dendryUI.dendryEngine.state.qualities.cyprus_mode) {
              window.statusTabRight = 'status.the_party';
              var partyTab = document.getElementById('the_party_tab');
              var cyprusTab = document.getElementById('cyprus_tab');
              if (partyTab) partyTab.classList.add('active');
              if (cyprusTab) cyprusTab.classList.remove('active');
          }
          window.updatePartySidebar();
      }
      updateCyprusWidth();
      window.updateCyprusTabVisibility();
      window.renderCyprusCommandPanel();
      window.updateTitleScreenImages();
  };

  /*
   * This function copied from the code for Infinite Space Battle Simulator
   *
   * quality - a number between max and min
   * qualityName - the name of the quality
   * max and min - numbers
   * colors - if true/1, will use some color scheme - green to yellow to red for high to low
   * */
  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };


  window.justLoaded = true;
  window.statusTab = "status";
  window.statusTabRight = "status.the_party";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: true, animate: true});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    window.pinnedCardsDescription = "Party Leadership - actions are only usable once per 6 months.";
    window.updateMusicBtn();
    updateCyprusWidth();
    window.updateCyprusTabVisibility();
    window.setupCyprusMapClicks();
    window.updateTitleScreenImages();
  };

  // Arrange the secretary to the leader’s left, with three member slots below.
  window.displayPinnedCards = function(cards) {
    cards=cards.filter(function(c){return c.id!=="cabinet"&&c.id!=="municipalities";});
    var Q = window.dendryUI.dendryEngine.state.qualities;
    var leaderId = Q.party_leader_id || "";
    var secretaryId = Q.party_secretary_id || "";

    // Sort: leader first, then secretary, then members (alphabetically by id)
    cards.sort(function(a, b) {
      function rank(card) {
        var id = card.id || "";
        // card ids are like "advisors.inonu", extract the part after the dot
        var shortId = id.indexOf(".") >= 0 ? id.substring(id.lastIndexOf(".") + 1) : id;
        if (shortId === leaderId) return 0;
        if (shortId === secretaryId) return 1;
        return 2;
      }
      var ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      // Among members, sort alphabetically by id for consistent ordering
      var idA = (a.id || "").toLowerCase();
      var idB = (b.id || "").toLowerCase();
      if (idA < idB) return -1;
      if (idA > idB) return 1;
      return 0;
    });

    // Build the pinned cards HTML using jQuery (matching the engine's approach)
    var $content = window.jQuery("#content") || window.jQuery("#main-content");
    var desc = "Pinned cards - click a card to play.";
    if (window.pinnedCardsDescription) {
      desc = window.pinnedCardsDescription;
    }
    if (Q.pinnedCardsDescription) {
      desc = Q.pinnedCardsDescription;
    }
    $content.append(window.jQuery("<hr>"));
    $content.append(window.jQuery("<p>").addClass("pinned-text-description").text(desc));

    var $ul = window.jQuery("<ul>").addClass("pinned-cards leadership-cards");
    var memberCount = 0;
    var factionColors = {km:'#701616', lk:'#c76083', tw:'#b31f3b', ok:'#ac8bb3', rk:'#5b7387'};
    var advisorFactions = {};
    String(Q._advisor_factions || '').split(',').forEach(function(pair) {
      var parts = pair.split(':'); advisorFactions[parts[0]] = parts[1];
    });
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var $li = window.jQuery("<li>").addClass("pinned-card");

      // Determine if this card is leader or secretary
      var cardId = card.id || "";
      var shortId = cardId.indexOf(".") >= 0 ? cardId.substring(cardId.lastIndexOf(".") + 1) : cardId;
      if (shortId === leaderId) {
        $li.addClass("leader-card");
      } else if (shortId === secretaryId) {
        $li.addClass("secretary-card");
      } else if (shortId === "shuffle_leadership_pinned") {
        $li.addClass("reshuffle-card");
      } else if (shortId === "cabinet") {
        $li.addClass("leadership-control");
      } else {
        $li.addClass("member-card");
        memberCount++;
      }

      // Add role title above the portrait (always present for vertical alignment)
      var roleLabel = "";
      if (shortId === leaderId) {
        roleLabel = "Party Leader";
      } else if (shortId === secretaryId) {
        roleLabel = "Party Secretary";
      } else if (shortId !== "shuffle_leadership_pinned" && shortId !== "cabinet") {
        roleLabel = "Member";
      }
      var $role = window.jQuery("<span>").addClass("card-role-label").html(roleLabel || "&nbsp;");
      $li.append($role);

      var $a = window.jQuery("<a>").addClass("card").attr({href: "#", "card-id": card.id, title: card.title});
      var faction = advisorFactions[shortId];
      if (factionColors[faction] && shortId !== 'cabinet' && shortId !== 'shuffle_leadership_pinned') {
        $li.attr('data-faction',faction);
        $a.css('border-color',factionColors[faction]);
      }
      var $caption = window.jQuery("<span>").addClass("card-caption").text(card.title);

      if (card.image) {
        var $img = window.jQuery("<img>").addClass("card-img").attr({src: card.image, loading: 'lazy', decoding: 'async'});
        $a.append($img);
      }
      if (card.subtitle) {
        var tooltipText = String(card.subtitle)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/\bincrease\b/gi, '<span class="effect-increase">$&</span>')
          .replace(/\bdecrease\b/gi, '<span class="effect-decrease">$&</span>');
        var $tooltip = window.jQuery("<span>").addClass("card-tooltip").html(tooltipText);
        $a.append($tooltip);
      }

      $li.append($a);
      $li.append($caption);
      $ul.append($li);
    }
    // Empty positions remain visible; existing saves keep their current members.
    for (var slot = memberCount; slot < 3; slot++) {
      var $empty = window.jQuery("<li>").addClass("pinned-card member-card empty-member-slot");
      $empty.append(window.jQuery("<span>").addClass("card-role-label").text("Member"));
      $empty.append(window.jQuery("<div>").addClass("blank-card").attr("aria-label", "Vacant advisor position").append(window.jQuery("<span>").text("Vacant")));
      $empty.append(window.jQuery("<span>").addClass("card-caption").text("Available advisor slot"));
      $ul.append($empty);
    }
    $content.append($ul);
  };

}());

(function(){
  if (typeof MutationObserver === 'undefined') return;
  var owner=null,layer=null,frame=0,pendingTarget=null,pendingX=0,pendingY=0,box=null;
  function hide(){if(frame)cancelAnimationFrame(frame);frame=0;pendingTarget=null;if(layer)layer.remove();layer=null;owner=null;box=null;}
  function show(target,x,y){
    var tip=target.querySelector('.mytooltiptext,.wide_tooltip-tip,.province-group-tip');if(!tip)return;
    if(owner!==target){hide();owner=target;layer=document.createElement('div');layer.id='leader-tooltip-layer';layer.className='mytooltip wide_tooltip-wrap';layer.classList.toggle('party-tooltip',target.classList.contains('party-tooltip'));layer.setAttribute('role','tooltip');
      var clone=tip.cloneNode(true),computed=getComputedStyle(tip);
      ['width','max-width','padding','font-size','font-family','line-height','font-weight','background-color','color','border','border-radius','box-shadow','text-align'].forEach(function(k){clone.style.setProperty(k,computed.getPropertyValue(k));});
      clone.style.cssText+=';position:static;display:block;visibility:visible;opacity:1;transform:none;margin:0;transition:none;';layer.appendChild(clone);document.body.appendChild(layer);box=layer.getBoundingClientRect();
    }
    var left=Math.max(8,Math.min(innerWidth-box.width-8,x-box.width/2));var top=y-box.height-18;if(top<8)top=Math.min(innerHeight-box.height-8,y+18);
    layer.style.left=left+'px';layer.style.top=Math.max(8,top)+'px';
  }
  document.addEventListener('mousemove',function(e){var t=e.target instanceof Element?e.target.closest('.mytooltip,.wide_tooltip-wrap,.province-vote-group'):null;if(!t||t.id==='leader-tooltip-layer'){hide();return;}pendingTarget=t;pendingX=e.clientX;pendingY=e.clientY;if(!frame)frame=requestAnimationFrame(function(){frame=0;var target=pendingTarget;if(target&&target.isConnected)show(target,pendingX,pendingY);});});
  document.addEventListener('focusin',function(e){var t=e.target instanceof Element?e.target.closest('.mytooltip,.wide_tooltip-wrap,.province-vote-group'):null;if(t){var b=t.getBoundingClientRect();show(t,b.left+b.width/2,b.bottom);}});
  document.addEventListener('focusout',hide);window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
  new MutationObserver(function(){if(owner&&!owner.isConnected)hide();}).observe(document.documentElement,{childList:true,subtree:true});
}());


window.openCyprusDiplomacy=function(country){
 var e=window.dendryUI.dendryEngine,Q=e.state.qualities;
 if(!['greece','uk','us'].includes(country)||!Q.cyprus_mode||!Q.cyprus_atilla1_ending_seen||Q.cyprus_campaign_resolved||(Q.cyprus_campaign_phase==='atilla2'&&!Q.cyprus_atilla2_complete))return;
 e.goToScene('cyprus_diplomacy_'+country);
};

window.switchMusicTrack=function(direction){var ui=window.dendryUI;if(!ui)return;var tracks=Array.from(new Set((ui.audioPlaylist||[]).filter(function(t){return t&&t!=='none'&&t!=='null';})));if(tracks.length<2)return;var current=ui.currentAudioURL||'',index=tracks.findIndex(function(t){return current===t||(ui.currentAudio&&decodeURI(ui.currentAudio.src).endsWith(decodeURI(t)));});index=(index+direction+tracks.length)%tracks.length;var next=tracks[index];ui.audioQueue=[];if(!ui.currentAudio)ui.currentAudio=new Audio(next);else{ui.currentAudio.pause();ui.currentAudio.src=next;}ui.currentAudioURL=next;ui.currentAudio.loop=false;if(!ui.disable_audio)ui.currentAudio.play().catch(function(){});if(window.AnatolianRubiconMusic)window.AnatolianRubiconMusic.sync(ui);};


// A render can add both a whole panel and its children in the same mutation batch.
// Walk each resulting subtree once, rather than revisiting every descendant.
(function(){if(typeof MutationObserver==='undefined'||!document.createTreeWalker)return;
function shortenText(text){if(text.parentElement?.closest('script,style,textarea'))return;var value=text.nodeValue.replace(/(\d+\.\d)\d+(?=%)/g,'$1');if(value!==text.nodeValue)text.nodeValue=value;}
function shorten(node){if(node.nodeType===3){shortenText(node);return;}var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);while(walker.nextNode())shortenText(walker.currentNode);}
function installPrecision(){var observer=new MutationObserver(function(records){var roots=new Set();for(var record of records)for(var node of record.addedNodes)if(node.isConnected&&(node.nodeType===1||node.nodeType===3))roots.add(node);for(var root of roots){var ancestor=root.parentNode,covered=false;while(ancestor){if(roots.has(ancestor)){covered=true;break;}ancestor=ancestor.parentNode;}if(!covered)shorten(root);}});observer.observe(document.body,{childList:true,subtree:true});shorten(document.body);}
if(document.body)installPrecision();else document.addEventListener('DOMContentLoaded',installPrecision,{once:true});})();

/* Anatolian Dawn: Options, victory margins and provincial tooltip fixes (v7). */
