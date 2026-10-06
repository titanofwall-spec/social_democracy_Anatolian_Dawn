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

    // Preserve hands while the Cyprus calendar owns play; do not draw/play
    // domestic cards or show leadership actions until normal play resumes.
    ['displayDecks', 'displayHand', 'displayPinnedCards'].forEach(function(method) {
      var display = ui[method].bind(ui);
      ui[method] = function() {
        if (ui.dendryEngine.state.qualities.cyprus_mode) return;
        return display.apply(ui, arguments);
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
      var tooltips = window.buttonTooltips || {};
      choices.forEach(function(choice, index) {
        var choiceId = String(choice.id || '');
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
    endDayLink.textContent = window.cyprusPendingScene(Q) ? 'Continue operation' : 'Skip Day';
  }
};
  // One shared map/control panel is rendered alongside every Cyprus passage.
  window.cyprusMapMarkup = "<svg\n   version=\"1.1\"\n   id=\"cyprus-map-svg\"\n   width=\"100%\"\n   height=\"100%\"\n   viewBox=\"0 0 4250 2573\"\n   xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n   xmlns=\"http://www.w3.org/2000/svg\">\n  <style>\n    .sba { fill: transparent; stroke: transparent; pointer-events: none; }\n    .district {\n      fill: #ffffff;\n      fill-opacity: 0;\n      stroke: #ffffff;\n      stroke-opacity: 0;\n      stroke-width: 6;\n      cursor: pointer;\n      transition: fill-opacity 0.15s ease, stroke-opacity 0.15s ease;\n    }\n    .district:hover {\n      fill-opacity: 0.28;\n      stroke-opacity: 0.9;\n    }\n    .district.selected {\n      fill: #9b7d07;\n      fill-opacity: 0.35;\n      stroke: #ffcc00;\n      stroke-opacity: 1;\n    }\n  </style>\n  <g id=\"basemap\">\n    <image\n       width=\"4250\"\n       height=\"2573\"\n       preserveAspectRatio=\"none\"\n       xlink:href=\"cyprusgame/cyprus_map.png\" />\n  </g>\n  <g id=\"districts\">\n    <polygon id=\"nicosia\" class=\"district\" data-name=\"Nicosia\" points=\"2371,1274 2366,1240 2314,1283 2236,1239 2280,1165 2346,1150 2338,1094 2364,1071 2336,1048 2329,989 2315,983 2278,997 2173,984 2166,1032 2146,1051 2085,1074 1938,1087 1909,1070 1866,1073 1837,1050 1769,1090 1736,1085 1711,1049 1660,1041 1622,1058 1539,1045 1468,1059 1409,1022 1307,1038 1221,1007 1153,1198 1025,1274 991,1256 1006,1276 981,1298 953,1274 975,1250 952,1228 872,1190 853,1204 840,1184 757,1169 738,1152 654,1156 632,1182 567,1203 660,1277 657,1306 698,1330 697,1411 657,1445 681,1492 707,1493 744,1531 774,1593 779,1670 768,1724 745,1749 762,1784 794,1769 833,1796 870,1748 906,1766 917,1695 982,1652 1128,1709 1195,1712 1262,1664 1328,1672 1372,1723 1426,1746 1469,1810 1514,1790 1578,1819 1652,1754 1702,1764 1719,1783 1777,1767 1818,1804 1871,1772 1881,1742 1931,1694 1978,1726 2022,1709 2067,1721 2083,1696 2072,1640 2088,1624 2163,1651 2192,1627 2231,1636 2252,1612 2261,1571 2235,1499 2194,1457 2247,1401 2249,1360 2320,1322\">\n      <title>Nicosia</title>\n    </polygon>\n    <polygon id=\"famagusta\" class=\"district\" data-name=\"Famagusta\" points=\"4238,24 4142,47 4101,86 4066,76 4042,113 3956,119 3892,168 3780,196 3766,240 3745,237 3680,301 3608,313 3571,345 3475,334 3376,466 3301,482 3112,594 3068,589 3038,619 2885,670 2743,668 2569,776 2533,779 2581,826 2561,857 2360,951 2403,1076 2376,1107 2399,1179 2402,1287 2433,1318 2475,1312 2531,1357 2551,1427 2574,1402 2626,1392 2646,1417 2636,1440 2757,1430 2795,1389 2862,1402 2903,1377 2891,1341 2946,1266 3028,1359 2848,1479 2855,1535 2921,1554 2948,1618 3003,1647 3110,1616 3192,1627 3324,1687 3286,1559 3144,1417 3090,1319 3055,1340 3028,1316 3046,1280 3001,1233 2983,1147 2993,1016 3101,873 3285,854 3306,770 3407,659 3494,598 3683,513 3805,397 3901,343 3911,293 3949,246 4085,175 4174,156 4197,123 4201,64\">\n      <title>Famagusta</title>\n    </polygon>\n    <polygon id=\"paphos\" class=\"district\" data-name=\"Paphos\" points=\"32,1348 8,1433 15,1426 31,1442 12,1455 11,1475 43,1545 85,1590 85,1663 77,1674 65,1669 63,1690 83,1698 106,1747 106,1777 87,1798 143,1897 168,1899 169,1911 182,1905 184,1921 206,1921 218,1938 227,2048 240,2059 249,2100 237,2127 258,2132 251,2120 281,2097 304,2120 282,2152 300,2173 324,2174 384,2229 411,2245 448,2235 475,2257 519,2257 624,2324 674,2339 676,2269 663,2237 693,2216 717,2175 747,2170 810,2110 814,2089 783,2070 774,2047 784,2031 764,2009 768,1986 791,1967 807,1983 794,1999 810,2005 818,1989 787,1961 803,1945 838,1968 861,1956 876,1909 942,1848 928,1846 874,1786 837,1852 790,1833 771,1847 711,1782 709,1726 741,1672 738,1647 721,1630 738,1597 708,1562 707,1535 668,1527 613,1452 629,1418 647,1400 659,1403 662,1346 618,1315 624,1289 603,1281 537,1216 536,1192 528,1191 502,1241 462,1276 427,1366 384,1423 302,1480 235,1489 245,1504 220,1526 192,1502 206,1485 171,1473 76,1393 75,1378 46,1346\">\n      <title>Paphos</title>\n    </polygon>\n    <polygon id=\"limassol\" class=\"district\" data-name=\"Limassol\" points=\"704,2353 746,2360 793,2387 819,2384 830,2365 870,2373 850,2353 852,2326 838,2312 869,2268 928,2274 985,2210 1030,2200 1052,2204 1084,2228 1111,2268 1172,2308 1193,2309 1240,2282 1305,2289 1328,2314 1290,2346 1257,2344 1253,2361 1313,2345 1358,2345 1385,2361 1383,2342 1391,2336 1373,2336 1350,2311 1378,2277 1413,2299 1406,2323 1417,2328 1460,2284 1612,2227 1692,2243 1836,2238 1839,2227 1815,2204 1818,2177 1810,2165 1824,2080 1801,2036 1756,2005 1726,1953 1569,1911 1553,1895 1564,1851 1547,1851 1527,1830 1503,1826 1481,1846 1464,1847 1424,1811 1410,1780 1345,1742 1327,1709 1264,1701 1187,1749 1165,1739 1092,1741 1077,1726 988,1689 969,1713 954,1713 942,1771 944,1812 959,1813 976,1830 982,1862 938,1908 907,1924 898,1973 851,2000 847,2025 824,2048 816,2045 860,2083 839,2145 736,2213 704,2250 715,2268 706,2287 713,2303\">\n      <title>Limassol</title>\n    </polygon>\n    <polygon id=\"larnaca\" class=\"district\" data-name=\"Larnaca\" points=\"2509,1382 2464,1350 2432,1354 2421,1378 2441,1397 2425,1413 2395,1404 2463,1467 2439,1493 2367,1423 2373,1416 2357,1391 2330,1389 2309,1368 2281,1378 2289,1403 2267,1431 2270,1445 2250,1461 2274,1454 2312,1481 2315,1510 2280,1537 2287,1546 2299,1536 2315,1552 2289,1622 2269,1640 2272,1670 2255,1687 2197,1663 2157,1694 2109,1665 2119,1688 2109,1727 2071,1758 2016,1748 1964,1764 1938,1733 1882,1804 1818,1845 1785,1845 1761,1806 1720,1821 1687,1803 1679,1810 1665,1803 1649,1821 1621,1822 1604,1840 1593,1878 1616,1892 1642,1887 1682,1906 1705,1904 1741,1924 1837,2032 1860,2073 1857,2108 1876,2097 1898,2118 1877,2145 1855,2133 1847,2163 1859,2206 1894,2206 1921,2224 1953,2199 1936,2206 1913,2180 1941,2144 1959,2146 1977,2164 1955,2198 1976,2187 2012,2188 2057,2153 2098,2143 2125,2115 2202,2089 2245,2087 2260,2061 2300,2038 2289,2027 2345,1973 2364,1970 2376,1990 2444,2000 2452,1960 2509,1887 2507,1780 2526,1755 2514,1737 2522,1711 2554,1669 2599,1645 2588,1633 2601,1616 2583,1584 2608,1551 2577,1526 2592,1503 2563,1479 2534,1482 2518,1466\">\n      <title>Larnaca</title>\n    </polygon>\n    <polygon id=\"kyrenia\" class=\"district\" data-name=\"Kyrenia\" points=\"1198,704 1200,794 1207,814 1223,827 1231,925 1226,974 1311,1002 1321,992 1390,993 1427,970 1444,988 1442,1002 1471,1021 1497,1009 1585,1014 1599,1007 1609,1013 1625,999 1653,995 1680,1013 1701,1014 1710,1006 1754,1048 1793,1016 1812,1011 1843,1014 1862,1032 1921,1035 1934,1047 2083,1037 2130,1015 2129,990 2169,948 2228,951 2256,939 2291,950 2317,947 2315,938 2333,919 2450,871 2471,849 2517,848 2530,835 2511,816 2512,801 2502,789 2456,799 2446,787 2437,797 2371,819 2324,825 2309,819 2218,850 2183,840 2097,852 2091,844 2062,848 2033,837 2018,847 2003,840 1968,843 1933,830 1943,855 1923,875 1907,878 1872,856 1893,827 1876,810 1848,823 1816,810 1783,823 1739,798 1699,792 1673,811 1623,801 1583,778 1561,781 1552,770 1520,802 1463,800 1434,792 1403,770 1390,776 1334,770 1272,720 1255,721 1210,697\">\n      <title>Kyrenia</title>\n    </polygon>\n    <polygon id=\"akrotiri\" class=\"sba\" data-name=\"Akrotiri SBA\" points=\"862,2318 879,2364 893,2361 899,2348 924,2349 955,2332 1006,2338 1017,2326 1049,2335 1059,2321 1083,2330 1093,2326 1111,2330 1148,2374 1171,2392 1186,2415 1221,2498 1215,2507 1221,2510 1225,2530 1211,2541 1212,2551 1236,2542 1271,2548 1285,2536 1339,2543 1381,2560 1404,2548 1386,2518 1379,2517 1352,2486 1350,2416 1362,2372 1316,2369 1247,2385 1233,2371 1232,2358 1241,2340 1260,2327 1292,2329 1305,2320 1296,2310 1241,2307 1226,2321 1199,2332 1166,2331 1141,2320 1127,2303 1079,2274 1072,2253 1057,2235 1026,2225 997,2230 991,2247 970,2253 961,2275 948,2279 939,2297 876,2292\">\n      <title>Akrotiri SBA</title>\n    </polygon>\n    <polygon id=\"dhekelia\" class=\"sba\" data-name=\"Dhekelia SBA\" points=\"2942,1291 2935,1305 2938,1318 2915,1347 2922,1358 2923,1386 2868,1425 2798,1415 2785,1422 2768,1454 2740,1449 2727,1460 2682,1454 2675,1469 2641,1494 2626,1491 2607,1471 2606,1447 2619,1437 2620,1417 2579,1426 2568,1440 2583,1480 2608,1503 2601,1537 2616,1534 2629,1543 2628,1564 2606,1590 2617,1616 2613,1639 2672,1635 2678,1628 2698,1639 2708,1630 2745,1637 2755,1633 2844,1666 2904,1716 2926,1713 2972,1685 2988,1659 2968,1659 2951,1641 2898,1644 2875,1636 2867,1625 2868,1608 2886,1597 2886,1563 2852,1560 2837,1546 2841,1528 2833,1521 2837,1497 2787,1466 2801,1442 2815,1443 2841,1463 2861,1458 2903,1431 2929,1402 2965,1398 3006,1366 2979,1352 2977,1330 2948,1313\">\n      <title>Dhekelia SBA</title>\n    </polygon>\n  </g>\n</svg>";
  window.renderCyprusCommandPanel = function() {
    var engine = window.dendryUI.dendryEngine, Q = engine.state.qualities;
    var content = document.getElementById('content');
    if (!content) return;
    var panel = document.getElementById('cyprus-command-panel');
    if (!Q.cyprus_mode) { if (panel) panel.remove(); return; }
    var rules = AnatolianRules.cyprusAtilla1;
    rules.ensureSupport(Q);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'cyprus-command-panel';
      panel.className = 'cyprus-command-panel';
      panel.innerHTML = '<div id="cyprus-map-wrap">' + window.cyprusMapMarkup + '</div>' +
        '<p id="cyprus-selected-district">Select Turkish (red) or Greek (blue) positions to prepare support.</p>' +
        '<div id="cyprus-action-buttons">' +
        '<button type="button" id="cyprus-btn-smuggle" class="cyprus-action-btn" data-branch="land"><img src="img/icon_smuggling.png" alt="">Turkish Land Forces</button>' +
        '<button type="button" id="cyprus-btn-airstrike" class="cyprus-action-btn" data-branch="air"><img src="img/icon_aerial.webp" alt="">Turkish Air Forces</button>' +
        '<button type="button" id="cyprus-btn-naval" class="cyprus-action-btn" data-branch="naval"><img src="img/icon_naval.webp" alt="">Turkish Naval Forces</button></div>' +
        '<div id="cyprus-support-actions" aria-live="polite"></div>';
    }
    // The supplied artwork and the province hit areas use the same 4250 x 2573 coordinates.
    // Replace only the basemap, retaining selection, keyboard controls and support actions.
    var image = panel.querySelector('#basemap image');
    var mapSource = rules.mapImage(Q);
    if (image.getAttribute('href') !== mapSource) {
      image.setAttribute('href',mapSource);
      image.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',mapSource);
    }
    // Dendry appends choices after rendering text. Move controls below those choices.
    content.appendChild(panel);
    window.setupCyprusSideClicks();
    window.updateCyprusTerritoryHighlight();
    window.setupCyprusMapClicks();
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
      var color=[255,203,90];
      for(var i=0;i<d.length;i+=4){var hit=side==='turkish'?d[i]>d[i+2]*1.15&&d[i]>d[i+1]*1.15:d[i+2]>d[i]*1.05&&d[i+2]>35;d[i]=color[0];d[i+1]=color[1];d[i+2]=color[2];d[i+3]=hit?45:0;}
      ctx.putImageData(pixels,0,0);
      ctx.globalCompositeOperation='destination-out';ctx.fillStyle='black';ctx.strokeStyle='black';ctx.lineWidth=4;
      svg.querySelectorAll('.sba').forEach(function(p){ctx.beginPath();Array.from(p.points).forEach(function(point,j){if(j===0)ctx.moveTo(point.x*canvas.width/4250,point.y*canvas.height/2573);else ctx.lineTo(point.x*canvas.width/4250,point.y*canvas.height/2573);});ctx.closePath();ctx.fill();ctx.stroke();});
      pixels=ctx.getImageData(0,0,canvas.width,canvas.height);d=pixels.data;var alpha=new Uint8Array(canvas.width*canvas.height);
      for(var j=0;j<alpha.length;j++)alpha[j]=d[j*4+3];
      for(var y=1;y<canvas.height-1;y++)for(var x=1;x<canvas.width-1;x++){var k=y*canvas.width+x;if(alpha[k]&&(!alpha[k-1]||!alpha[k+1]||!alpha[k-canvas.width]||!alpha[k+canvas.width]))d[k*4+3]=210;}
      ctx.globalCompositeOperation='source-over';ctx.putImageData(pixels,0,0);record.highlights[side]=canvas.toDataURL();
    }
    if(!overlay){overlay=document.createElementNS('http://www.w3.org/2000/svg','image');overlay.id='cyprus-territory-highlight';overlay.setAttribute('width','4250');overlay.setAttribute('height','2573');overlay.setAttribute('pointer-events','none');overlay.style.filter='drop-shadow(0 0 3px '+'#ffd66b'+')';svg.appendChild(overlay);}
    overlay.dataset.side=side;overlay.setAttribute('href',record.highlights[side]);overlay.style.filter='drop-shadow(0 0 3px '+'#ffd66b'+')';
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
        function sideAt(px,py){
          var c=record.context.getImageData(px,py,1,1).data;
          if(c[0]>c[2]*1.15&&c[0]>c[1]*1.15)return 'turkish';
          if(c[2]>c[0]*1.05&&c[2]>35)return 'greek';
          return '';
        }
        var side=sideAt(x,y);
        if(!side){
          // White borders and city markers belong to the nearest colored land.
          // Black sea pixels and British bases never select a side.
          var c=record.context.getImageData(x,y,1,1).data;
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

  window.showColdWarMap = function() {
    var overlay = document.getElementById('cold-war-map-overlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    overlay.classList.remove('cold-war-map-opening');
    void overlay.offsetWidth;
    overlay.classList.add('cold-war-map-opening');
    document.body.classList.add('cold-war-map-open');
    window.setupColdWarMap();
    var closeButton = document.getElementById('cold-war-map-close');
    if (closeButton) closeButton.focus();
  };

  window.hideColdWarMap = function() {
    var overlay = document.getElementById('cold-war-map-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.classList.remove('cold-war-map-open');
    var button = document.getElementById('cold-war-map-button');
    if (button) button.focus();
  };

  window.setupColdWarMap = function() {
    var map = document.getElementById('cold-war-map');
    var tooltip = document.getElementById('cold-war-map-tooltip');
    if (!map || !tooltip || map.dataset.ready) return;
    map.dataset.ready = 'true';
    map.querySelectorAll('.cold-war-region').forEach(function(region) {
      region.addEventListener('click', function() {
        map.querySelectorAll('.cold-war-region.active').forEach(function(activeRegion) {
          activeRegion.classList.remove('active');
        });
        region.classList.add('active');
        tooltip.innerHTML = '<strong>' + region.dataset.region + '</strong><br>' + region.dataset.tooltip;
      });
    });
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
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
      window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false
    }
  };
window.displayText = function (text) {
        return applyWholesome(text);
    };

    //To get a value
    function getRelationshipText(value) {
        if (value === undefined || value === null) return '';
        if (value <= 5) return '<span style="color: #FF0000;">Hostile</span>';
        if (value <= 14.9) return '<span style="color: #FF4500;">Frigid</span>';
        if (value <= 29.9) return '<span style="color: #FF8C00;">Cold</span>';
        if (value <= 39.9) return '<span style="color: #FFA500;">Cool</span>';
        if (value <= 54.9) return '<span style="color: #FFD700;">Neutral</span>';
        if (value <= 64.9) return '<span style="color: #9ACD32;">Warm</span>';
        if (value <= 74.9) return '<span style="color: #32CD32;">Friendly</span>';
        return '<span style="color: #008000;">Very friendly</span>';
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
        case 'TKP ': return '<span style="color: #780808;">Far Left</span> (Marxism-Leninism)';
        case 'TEP': return '<span style="color: #910a0a;">Left Wing-Far Left</span> (National Democratic Revolution)';
        case 'SDP': return '<span style="color: #C42424;">Left Wing</span> (Democratic Socialism)';
        case 'CGP':
            if (Q.CGP_party_leader === "Feyzioğlu") return '<span style="color: #484863;">Center-Center Right</span> (Right Kemalism)';
            return 'Unknown';
        case 'AP':
            if (Q.AP_party_leader === "Demirel") return '<span style="color: #4344af;">Center Right-Right</span> (Conservative Liberalism)';
            return 'Unknown';
        case 'CHP':
            if (Q.CHP_party_leader === "İnönü") return '<span style="color: #803c53;">Center-Center Left</span> (Kemalism)';
            if (Q.CHP_party_leader === "Ecevit") return '<span style="color: #c76082;">Center Left</span> (Left Kemalism)';
            return 'Unknown';
        case 'DP':
            if (Q.DP_party_leader === "Bozbeyli") return '<span style="color: #342675;">Right Wing</span> (Conservative Populism)';
            return 'Unknown';
        case 'MSP':
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
        if (searchString === 'CGP' && Q['CGP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['CGP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if (searchString === 'AP' && Q['AP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['AP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
        }
        if (searchString === 'MSP' && Q['MSP_relation'] !== undefined) {
            var ideology = getPartyIdeology(searchString, Q);
            var relationText = getRelationshipText(Q['MSP_relation']);
            return baseTooltip.explanationText + '<br>Politics: ' + ideology + '<br>Relation: ' + relationText;
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
        if (searchString === 'paramilitary-name' && Q['paramilitary-name_strength'] !== undefined) {
            var strength = Q['paramilitary-name_strength'] ? Q['paramilitary-name_strength'].toFixed(1) : '0';
            var militancy = getMilitancyText(Q['paramilitary-name_militancy']);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization: ' + militancy;
        }

        if (searchString === 'THKP-C' && Q.thkpc_strength !== undefined) {
            var strength = Q.thkpc_strength ? Q.thkpc_strength : '0';
            var morale = getMilitancyText(Q.thkpc_militancy);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization' + militancy;
        }

        if (searchString === 'TKP/ML' && Q.tkpml_strength !== undefined) {
            var strength = Q.tkpml_strength ? Q.tkpml_strength : '0';
            var morale = getMilitancyText(Q.tkpml_militancy);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization' + militancy;
        }
         if (searchString === 'Grey Wolves' && Q.grey_wolves_strength !== undefined) {
            var strength = Q.grey_wolves_strength ? Q.grey_wolves_strength : '0';
            var morale = getMilitancyText(Q.grey_wolves_militancy);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization' + militancy;
        }
        if (searchString === 'Raiders' && Q.raiders_strength !== undefined) {
            var strength = Q.raiders_strength ? Q.raiders_strength : '0';
            var morale = getMilitancyText(Q.raiders_militancy);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization' + militancy;
        }
        if (searchString === 'DEV-YOL' && Q.devyol_strength !== undefined) {
            var strength = Q.devyol_strength ? Q.devyol_strength : '0';
            var morale = getMilitancyText(Q.devyol_militancy);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization' + militancy;
        }
        if (searchString === 'TİT' && Q.tit_strength !== undefined) {
            var strength = Q.tit_strength ? Q.tit_strength : '0';
            var morale = getMilitancyText(Q.tit_militancy);
            return baseTooltip.explanationText + '<br>Strength: ' + strength + 'k<br>Militarization' + militancy;
        }
        return baseTooltip.explanationText;
    }

    function applyWholesome(str) {
        const allWords = new Set([
            ...tooltipList.map(t => t.searchString),
            ...colourList.map(c => c.word)
        ]);

        const regex = new RegExp(`\\b(${[...allWords].join('|')})\\b`, 'g');

        return str.replace(/(<(?:span|strong)[^>]*>.*?<\/(?:span|strong)>|<[^>]+>|[^<]+)/g, (segment) => {
            if (segment.startsWith('<')) return segment;

            return segment.replace(regex, (match) => {
                const tooltip = tooltipList.find(t => t.searchString === match);
                const colour = colourList.find(c => c.word === match);

                let style = colour ? colour.style : '';
                let innerText = match;

                if (colour && colour.img) {
                    innerText = `<img src="${colour.img}" class="p_icon" alt="">${innerText}`;
                }

                if (tooltip) {
                    var tooltipContent = getDynamicTooltipContent(match, tooltip);
                    return `<span class='mytooltip' style='${style}'>${innerText}<span  class='mytooltiptext'>${tooltipContent}</span></span>`;
                } else if (colour) {
                    return `<span style='${style}'>${innerText}</span>`;
                }

                return match;
            });
        });
    }
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
    var Q = window.dendryUI.dendryEngine.state.qualities;
    var leaderId = Q.party_leader_id || "";
    var secretaryId = Q.party_secretary_id || "";

    // Sort: leader first, then secretary, then members (alphabetically by id)
    cards.sort(function(a, b) {
      function rank(card) {
        var id = card.id || "";
        // card ids are like "advisors.inonu" — extract the part after the dot
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
      } else if (shortId === "shuffle_leadership_pinned" || shortId === "cabinet") {
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

// Position only the hovered tooltip, at most once per paint frame.
(function () {
    var pending = false, tooltip = null, x = 0, y = 0;
    document.addEventListener('mousemove', function (event) {
        var target = event.target instanceof Element ? event.target.closest('.mytooltip') : null;
        tooltip = target ? target.querySelector('.mytooltiptext') : null;
        if (!tooltip) return;
        x = event.clientX; y = event.clientY;
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
            pending = false;
            if (!tooltip || !tooltip.isConnected) return;
            tooltip.style.setProperty('--mouse-x', x + 'px');
            tooltip.style.setProperty('--mouse-y', y + 'px');
        });
    });
}());

(function(){
  if (typeof MutationObserver === 'undefined') return;
  var owner=null,layer=null;
  function hide(){if(layer)layer.remove();layer=null;owner=null;}
  function show(target,x,y){
    var tip=target.querySelector('.mytooltiptext,.wide_tooltip-tip');if(!tip)return;
    if(owner!==target){hide();owner=target;layer=document.createElement('div');layer.id='leader-tooltip-layer';layer.className='mytooltip wide_tooltip-wrap';layer.setAttribute('role','tooltip');
      var clone=tip.cloneNode(true),computed=getComputedStyle(tip);
      ['width','max-width','padding','font-size','font-family','line-height','font-weight','background-color','color','border','border-radius','box-shadow','text-align'].forEach(function(k){clone.style.setProperty(k,computed.getPropertyValue(k));});
      clone.style.cssText+=';position:static;display:block;visibility:visible;opacity:1;transform:none;margin:0;transition:none;';layer.appendChild(clone);document.body.appendChild(layer);
    }
    var box=layer.getBoundingClientRect();var left=Math.max(8,Math.min(innerWidth-box.width-8,x-box.width/2));var top=y-box.height-18;if(top<8)top=Math.min(innerHeight-box.height-8,y+18);
    layer.style.left=left+'px';layer.style.top=Math.max(8,top)+'px';
  }
  document.addEventListener('mousemove',function(e){var t=e.target instanceof Element?e.target.closest('.mytooltip,.wide_tooltip-wrap'):null;if(t&&t.id!=='leader-tooltip-layer')show(t,e.clientX,e.clientY);else hide();});
  document.addEventListener('focusin',function(e){var t=e.target instanceof Element?e.target.closest('.mytooltip,.wide_tooltip-wrap'):null;if(t){var b=t.getBoundingClientRect();show(t,b.left+b.width/2,b.bottom);}});
  document.addEventListener('focusout',hide);window.addEventListener('scroll',hide,true);
  new MutationObserver(function(){if(owner&&!owner.isConnected)hide();}).observe(document.documentElement,{childList:true,subtree:true});
}());


window.openCyprusDiplomacy=function(country){
 var e=window.dendryUI.dendryEngine,Q=e.state.qualities;
 if(!['greece','uk','us'].includes(country)||!Q.cyprus_mode||!Q.cyprus_atilla1_ending_seen||Q.cyprus_campaign_resolved||(Q.cyprus_campaign_phase==='atilla2'&&!Q.cyprus_atilla2_complete))return;
 e.goToScene('cyprus_diplomacy_'+country);
};
